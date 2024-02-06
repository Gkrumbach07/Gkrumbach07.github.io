import { Client } from "@notionhq/client";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { load } from 'cheerio';
import axios from "axios";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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
		const { url } = req.body;

		if (!url) {
			return res.status(400).json({ message: 'URL is required', error: true });
		}

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

		// Use OpenAI to parse the text
		const openAiResponse = await openai.chat.completions.create({
			messages: [{ role: "user", content: `DIRECTIONS: Extract each restaurant's details into a json blob with key "restaurants" and value an array of objects with keys for "name" as a string, "handle" as a string, "type" of food as a string, estimated "price" as a number if available, "occasion" as an array of strings (breakfast, lunch, dinner, brunch, snack, late night) multiple if needed, "location" if available as a string, "notes" a short description or interesting notes. If any are unavailable set the value to null. TEXT: ${title}` }],
			model: "gpt-3.5-turbo",
		});

		// Simplified parsing logic here - you would extract specifics like name, type of food, etc.
		const message = openAiResponse.choices[0].message.content

		if (!message) {
			return res.status(400).json({ message: 'Failed to parse data', error: true });
		}

		console.debug('OpenAI response:', message);

		const messageData = JSON.parse(message) as MessageData;

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

					upvoted.push(name); // Assuming 'upvoted' means handled or updated in this context
				} catch (error) {
					console.error('Failed to update existing restaurant:', name, error);
					failed.push(name);
				}
			} else {
				// No existing restaurant found, proceed to create a new one
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
						children: notes ? [
							{
								object: 'block',
								type: 'paragraph',
								paragraph: {
									rich_text: [{ type: 'text', text: { content: notes } }],
								},
							},
						] : [],
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