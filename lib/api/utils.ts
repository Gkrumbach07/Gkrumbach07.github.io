import { ProjectStatus } from "../types/types"
import { DAYS_TO_INACTIVE } from "./constants"

export const getProjectStatus = (lastEdit?: string, notionStatus?: string): ProjectStatus => {
    if(!notionStatus || !lastEdit || notionStatus === "Not Started") {
        return "upcoming"
    }
    else if(notionStatus === "Done") {
        return "done"
    }
    else {
        // is in progress, so check active level
        const start = new Date(lastEdit)
        const end = new Date()
        const days = (end.getTime() - start.getTime()) / 8.64e+7

        if(days >= DAYS_TO_INACTIVE) {
            return "inactive"
        }
        else {
            return "active"
        }
    }
}