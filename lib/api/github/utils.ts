import {components} from "@octokit/openapi-types/types"

export const parseGithubUrl = (githubUrl: string) => {
    const curser = githubUrl.search("github.com/")

    if (curser === -1) {
        return {owner: "", repo: "" }
    }
    else {
        try {
            const parts = githubUrl.slice(curser + 11).split("/")
            const [owner, repo] = parts
            if (owner !== "" && repo !== "") {
                return { owner: owner, repo: repo }
            }
            else {
                throw "URL is missing parts"
            }
        }
        catch (error) {
            return {owner: "", repo: "" }
        }
    }
}

export const parseGithubRepository = (repo: components["schemas"]["full-repository"]) => {
    return {
        description: repo.description,
        last_updated: repo.updated_at,
        topics: repo.topics,
        watchers_count: repo.watchers_count,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        size: repo.size,
        fork: repo.fork,
    }
}