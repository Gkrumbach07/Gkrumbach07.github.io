import React from "react"

import Template from "../components/Template";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import Typography from "@mui/joy/Typography";
import Divider from '@mui/joy/Divider';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import TabPanel from '@mui/joy/TabPanel';
import Tab from '@mui/joy/Tab';
import { Box } from "@mui/system";
import useMediaQuery, { BREAKPOINTS } from "../hooks/useMediaQuery";
import AllProjects from "../components/AllProjects";
import { getProjects } from "../lib/api/projects";
import { Project } from "../lib/types/types";

export async function getStaticProps() {
  const projects = await getProjects()

  return {
    props: {
      projects: projects,
    },
  }
}

export default function Home({ projects }: { projects: Project[] }) {
  const isSmall = useMediaQuery(BREAKPOINTS.down("sm"))  

  return (
    <Box>
      <Tabs defaultValue={0}>
        <TabList variant="soft" sx={{ width: 300, alignSelf: "center" }}>
          <Tab>Home</Tab>
          <Tab>Projects</Tab>
          <Tab>Blog</Tab>
        </TabList>
        <TabPanel value={0}>
          <Template>
            <Header />
            <Divider component="div" role="presentation" sx={{ marginTop: 10 }}>
              <Typography level="h3">Pinned Projects</Typography>
            </Divider>
            <Box sx={{ marginY: 3, display: "grid", rowGap: 2, columnGap: 2, justifyContent: "center", justifyItems: "stretch", gridTemplateColumns: isSmall ? "1fr" : "repeat(auto-fit, minmax(270px, 1fr))" }}>
              {projects.filter(project => project.pinned).map(project => <ProjectCard key={project.title} project={project} />)}
            </Box>
          </Template>
        </TabPanel>
        <TabPanel value={1}>
          <AllProjects allProjects={projects}/>
        </TabPanel>
        <TabPanel value={2}>
          <b>Third</b> tab panel
        </TabPanel>
      </Tabs>
    </Box>

  )
}
