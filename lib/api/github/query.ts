import { parseGithubUrl } from './utils';
import client from "./client"

export const queryGithubRepository = async (githubUrl: string) => {
    const { owner, repo } = parseGithubUrl(githubUrl)
    return client.request("GET /repos/{owner}/{repo}", {
        owner: owner,
        repo: repo,
    });

}

