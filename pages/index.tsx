import React from "react"

import Template from "../components/Template";
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
import { ParallaxHeader } from "../components/ParallaxHeader";

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
    <>
      <ParallaxHeader />
      <Template>
        <Tabs size="lg" defaultValue={0} sx={{ backgroundColor: "transparent", "--Tabs-gap": "10px"}}>
          <TabList variant="soft" sx={{ marginBottom: 10, width: "100%", position: "sticky", top: 0, zIndex: 1, boxShadow: "0px 1px 2px 0px rgba(0,0,0,.3),0px 1px 3px 1px rgba(0,0,0,.15)", }}>
            <Tab>Home</Tab>
            <Tab>Projects</Tab>
            {/* <Tab>Blog</Tab> */}
          </TabList>
          <TabPanel value={0}>
            <Divider component="div" role="presentation">
              <Typography level="h3">Featured Projects</Typography>
            </Divider>
            <Box sx={{ marginY: 3, display: "grid", rowGap: 2, columnGap: 2, justifyContent: "center", justifyItems: "stretch", gridTemplateColumns: isSmall ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {projects.filter(project => project.pinned).map(project => <ProjectCard key={project.title} project={project} />)}
            </Box>
            {/* <Divider component="div" role="presentation">
              <Typography level="h3">Featured Posts</Typography>
            </Divider> */}
          </TabPanel>
          <TabPanel value={1} >
            <AllProjects allProjects={projects} />
          </TabPanel>
          {/* <TabPanel value={2} >
          <Divider component="div" role="presentation">
              <Typography level="h3">All Blog Posts</Typography>
            </Divider>
          </TabPanel> */}
        </Tabs>
      </Template>
    </>

  )
}
