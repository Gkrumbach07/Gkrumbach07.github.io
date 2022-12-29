import notion from "./client";

export const queryNotionDatabase = async (database_id: string) =>
    await notion.databases.query({
        database_id: database_id,
    })