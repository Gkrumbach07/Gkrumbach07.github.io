import { queryGithubRepository } from './github/query';
import { parseGithubRepository } from './github/utils';

import { DATABASE_IDS } from './notion/constants';
import { queryNotionDatabase } from './notion/query';
import { parseNotionProjectProperties } from './notion/utils';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { Project } from '../types/types';
import { getProjectStatus } from './utils';

export const getProjects = async (): Promise<Project[]> => {
  const notionData = await queryNotionDatabase(DATABASE_IDS.projects)
  const projects = await Promise.all(notionData.results.map(async page => {
    const notionProperties = parseNotionProjectProperties(page as PageObjectResponse)

    // github data
    const githubData = notionProperties.link !== null ? await queryGithubRepository(notionProperties.link) : null
    const githubProperties = githubData?.data ? parseGithubRepository(githubData?.data) : null

    return {
        title: notionProperties.title,
        link: notionProperties.link,
        lastUpdated: githubProperties?.last_updated ?? null,
        status: getProjectStatus(githubProperties?.last_updated, notionProperties.status),
        details: notionProperties.details ?? null,
        tags: notionProperties.tags,
        pinned: notionProperties.pinned,
        visible: notionProperties.public
    }
  }))

  return projects.filter(project => project.visible)
}



 
  