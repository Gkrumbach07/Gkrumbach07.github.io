import { Octokit } from "octokit";

export default new Octokit({auth: process.env.GITHUB_API_KEY ?? ''});