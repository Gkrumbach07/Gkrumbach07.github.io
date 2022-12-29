import * as React from 'react';
import useMediaQuery, { BREAKPOINTS } from "../hooks/useMediaQuery"
import ProjectCard from "./ProjectCard"
import { Box, Divider, Typography } from '@mui/joy';
import { Project } from '../lib/types/types';

const AllProjects = ({ allProjects }: { allProjects: Project[] }) => {
    const isSmall = useMediaQuery(BREAKPOINTS.down("sm"))

    return (
        <Box>
            <Divider component="div" role="presentation" sx={{ marginTop: 10 }}>
              <Typography level="h3">All Projects</Typography>
            </Divider>
            <Box sx={{ marginY: 3, display: "grid", rowGap: 4, columnGap: 4, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"  }}>
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
                {allProjects.map(project => <ProjectCard key={project.title} project={project} />)}
            </Box>
        </Box>

    )
}

export default AllProjects