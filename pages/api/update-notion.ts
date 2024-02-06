import { Client } from "@notionhq/client";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { load } from 'cheerio';
import axios from "axios";
import { BlockObjectRequest, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

type Restaurant = {
	name?: string;
	handle?: string;
	type?: string;
	occasion?: string[];
	price?: number;
	location?: string;
	notes?: string;
};

type MessageData = {
	restaurants: Restaurant[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		// Check if the request method is POST
		if (req.method !== 'POST') {
			return res.status(405).end(); // Method Not Allowed
		}

		// Simple Authentication Check
		const { authorization } = req.headers;

		if (!authorization || authorization !== `Bearer ${process.env.PHONE_SECRET_KEY}`) {
			return res.status(401).json({ message: 'Unauthorized', error: true });
		}

		// Assuming the URL is sent in the request body
		const { url, personalNote } = req.body;

		if (!url) {
			return res.status(400).json({ message: 'URL is required', error: true });
		}

		// Immediately respond to the client
		res.status(200).json({ message: 'Valid request received, processing in background' });

		// Background task
		setImmediate(async () => {
			try {
				// Place your long-running tasks here
				// For example, API calls, database updates, etc.
				console.log('Background task is running');

				const { data } = await axios.get(url);

				const $ = load(data);
				const metaContentTitle = $(`meta[property='og:title']`).attr('content');
				const metaContentDescription = $(`meta[property='og:description']`).attr('content');

				if (!metaContentTitle || !metaContentDescription) {
					return res.status(400).json({ message: 'Failed to parse meta data', error: true });
				}

				const title = `${metaContentTitle}. ${metaContentDescription}`

				console.debug('Restaurant og:title from URL:', title);

				const notion = new Client({ auth: process.env.NOTION_RESTAURANT_API_KEY });
				const openai = new OpenAI({
					apiKey: process.env.OPENAI_API_KEY,
				});

				const prompt = `Task: Create a JSON blob for restaurant details.
				- Format the output as JSON.
				- Key: "restaurants", Value: Array of objects.
				- Each object should have:
					* "name": (string) The restaurant's name.
					* "handle": (string) The restaurant's social media handle or identifier.
					* "type": (string) Type of food served.
					* "price": (number) Estimated price, use null if unavailable.
					* "occasion": (array of strings) Possible occasions, e.g., ["breakfast", "lunch"].
					* "location": (string) Location, use null if unavailable.
					* "notes": (string) Any interesting notes or description, use null if unavailable.
				- If information for a key is unavailable, set its value to null.
				TEXT: ${title}`

				console.log('OpenAI prompt:', prompt)

				// Use OpenAI to parse the text
				const openAiResponse = await openai.chat.completions.create({
					messages: [{
						role: "user",
						content: prompt
					}], model: "gpt-4",
				});

				// Simplified parsing logic here - you would extract specifics like name, type of food, etc.
				const message = openAiResponse.choices[0].message.content

				if (!message) {
					return res.status(400).json({ message: 'Failed to parse data', error: true });
				}

				console.debug('OpenAI response:', message);
				let messageData: MessageData = { restaurants: [] };
				try {
					messageData = JSON.parse(message);
				}
				catch (error) {
					console.error('Failed to parse OpenAI response:', error);
					// try to find handles
					const handles = message.match(/@([a-zA-Z0-9_]+)/g)
					if (handles) {
						messageData = {
							restaurants: handles.map((handle) => ({ handle, name: handle }))
						}
					}
				}

				// validate the parsed data
				if (!Array.isArray(messageData.restaurants)) {
					return res.status(400).json({ message: 'Invalid data format', error: true });
				}

				const database_id = process.env.NOTION_RESTAURANT_DATABASE_ID;

				if (!database_id) {
					return res.status(400).json({ message: 'Database ID is required', error: true });
				}

				const loggedRestaurants = await notion.databases.query({ database_id });
				// get all handles
				const handles = loggedRestaurants.results.map((restaurant) => ((restaurant as PageObjectResponse)?.properties?.Handle as PageObjectResponse["properties"][string] & { type: "rich_text" })?.rich_text?.[0]?.plain_text)

				// Update Notion Database
				const added: string[] = []
				const failed: string[] = []
				const upvoted: string[] = []
				await Promise.all(messageData.restaurants.map(async (restaurant) => {
					const { name, handle, type, occasion, price, location, notes } = restaurant;

					// Validate required fields
					if (!name || !handle) {
						console.error('Missing required fields:', restaurant);
						failed.push(name || 'Unknown');
						return;
					}

					// Construct the handle link outside the conditionals as it's used in both new creations and updates
					const handleLink = `https://instagram.com/${handle.slice(1)}`;

					// Check if the restaurant already exists by handle
					const existingRestaurantIndex = handles.findIndex(existingHandle => existingHandle === handle);
					if (existingRestaurantIndex !== -1) {
						// Existing restaurant found, get its page ID
						const existingPageId = loggedRestaurants.results[existingRestaurantIndex].id;

						try {
							// Increment the count by retrieving the current value and adding 1
							const currentCount = ((loggedRestaurants.results[existingRestaurantIndex] as PageObjectResponse).properties.Count as any)?.number || 0;
							await notion.pages.update({
								page_id: existingPageId,
								properties: {
									Count: { number: currentCount + 1 },
								},
							});

							// Append a new text block with the notes if notes exist
							if (notes) {
								await notion.blocks.children.append({
									block_id: existingPageId,
									children: [
										{
											object: 'block',
											type: 'paragraph',
											paragraph: {
												rich_text: [{ type: "text", text: { content: notes } }],
											},
										},
									],
								});
							}
							if (personalNote) {
								await notion.blocks.children.append({
									block_id: existingPageId,
									children: [
										{
											object: 'block',
											type: 'quote',
											quote: {
												rich_text: [{ type: "text", text: { content: personalNote } }],
											},
										},
									],
								});
							}

							upvoted.push(name); // Assuming 'upvoted' means handled or updated in this context
						} catch (error) {
							console.error('Failed to update existing restaurant:', name, error);
							failed.push(name);
						}
					} else {
						// No existing restaurant found, proceed to create a new one
						const blocks: Array<BlockObjectRequest> = []
						if (notes) {
							blocks.push({
								object: 'block',
								type: 'paragraph',
								paragraph: {
									rich_text: [{ type: 'text', text: { content: notes } }],
								},
							})
						}
						if (personalNote) {
							blocks.push({
								object: 'block',
								type: 'quote',
								quote: {
									rich_text: [{ type: 'text', text: { content: personalNote } }],
								},
							})
						}
						try {
							await notion.pages.create({
								parent: { database_id },
								properties: {
									Name: { title: [{ text: { content: name } }] },
									Handle: { rich_text: [{ text: { content: handle, link: { url: handleLink } } }] },
									URL: { url },
									...(type ? { Type: { rich_text: [{ text: { content: type } }] } } : {}),
									...(occasion ? { Occasion: { multi_select: occasion.map((o) => ({ name: o })) } } : {}),
									...(price ? { Price: { number: price } } : {}),
									...(location ? { Location: { rich_text: [{ text: { content: location } }] } } : {}),
									Count: { number: 1 }, // Initialize count for new restaurant
								},
								children: blocks
							});

							added.push(name);
						} catch (error) {
							console.error('Failed to create new restaurant:', name, error);
							failed.push(name);
						}
					}
				}));

				const respMessageArray = []
				if (added.length > 0) {
					respMessageArray.push(`Added: ${added.join(', ')}`)
				}
				if (upvoted.length > 0) {
					respMessageArray.push(`Upvoted: ${upvoted.join(', ')}`)
				}
				if (failed.length > 0) {
					respMessageArray.push(`Failed: ${failed.join(', ')}`)
				}
				console.debug('Notion database updated:', respMessageArray.join(' | '));
				res.status(200).json({ message: respMessageArray.join(' | '), error: false });

				console.log('Background task completed');
			} catch (error) {
				console.error('Background task failed:', error);
				// Implement error handling or logging as needed
			}
		});
	}
	catch (error) {
		console.error('Failed to update Notion database:', error);
		if (error instanceof Error) {
			res.status(500).json({ message: error.message, error: true });
		}
		else {
			res.status(500).json({ message: 'Internal Server Error', error: true });
		}
	}
}