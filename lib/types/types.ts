import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

export type ProjectStatus = "done" | "active" | "inactive" | "upcoming"

export type Project = {
    title: string,
    link: string | null,
    lastUpdated: string | null,
    status: ProjectStatus,
    details: string | null,
    tags: string[],
    pinned: boolean,
    visible: boolean
}

export type NotionProjectProperties = {
    "Status": PageObjectResponse["properties"][string] & { type: "status" }
    "Last edited time": PageObjectResponse["properties"][string] & { type: "last_edited_time" }
    "Technology": PageObjectResponse["properties"][string] & { type: "multi_select" }
    "Type": PageObjectResponse["properties"][string] & { type: "select" }
    "Github": PageObjectResponse["properties"][string] & { type: "url" }
    "Name": PageObjectResponse["properties"][string] & { type: "title" }
    "Pinned": PageObjectResponse["properties"][string] & { type: "checkbox" }
    "Public": PageObjectResponse["properties"][string] & { type: "checkbox" }
    "Details": PageObjectResponse["properties"][string] & { type: "rich_text" }
}