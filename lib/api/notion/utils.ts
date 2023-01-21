import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionProjectProperties } from "../../types/types";

export const parseNotionProjectProperties = (page: PageObjectResponse) => {
    const properties = page.properties as NotionProjectProperties

    return {
        status: properties.Status.status?.name,
        tags: properties.Technology.multi_select.map(tag => tag.name),
        link: properties.Github.url,
        title: properties.Name.title[0].plain_text,
        pinned: properties.Pinned.checkbox,
        public: properties.Public.checkbox,
        details: properties.Details.rich_text?.[0]?.plain_text ?? ""
    }
}