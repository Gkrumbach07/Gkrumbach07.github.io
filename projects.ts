export type ProjectState = "upcoming" | "active" | "inactive" | "done"

export type ProjectDataType = {
    title: string;
    tags: string[];
    link: string;
    state: ProjectState
    details: string
    lastUpdated: Date;
    blogSlug?: string
}

// TODO connect to GitHub API to pull projects

export const projectData: ProjectDataType[] = [
    {
        title: "Lake Erosion Simulator",
        tags: ["Unity", "simulation", "C#", "GPU"],
        lastUpdated: new Date(Date.now()),
        link: "",
        state: "active",
        details: "A rabbit hole of terrain generation and erosion simulation with the goal of producing natural looking lakes.",
    },
    {
        title: "Lake Erosion Simulator",
        tags: ["Unity", "simulation", "C#", "GPU"],
        link: "",
        lastUpdated: new Date(Date.now()),
        state: "active",
        details: "A rabbit hole of terrain generation and erosion simulation with the goal of producing natural looking lakes.",
    },
    {
        title: "Lake Erosion Simulator",
        tags: ["Unity", "simulation", "C#", "GPU"],
        link: "",
        lastUpdated: new Date(Date.now()),
        state: "active",
        details: "A rabbit hole of terrain generation and erosion simulation with the goal of producing natural looking lakes.",
    }
]