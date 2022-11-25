import React from "react"

import Template from "../components/Template";
import Stack from "@mui/system/Stack";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import Typography from "@mui/joy/Typography";
import Divider from '@mui/joy/Divider';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import TabPanel from '@mui/joy/TabPanel';
import Tab from '@mui/joy/Tab';
import { Box } from "@mui/system";

import { projectData } from "../projects";

export default function Home() {
  return (
    <Box>
      <Tabs defaultValue={0}>
        <TabList variant="soft" sx={{ width: 300, alignSelf: "center" }}>
          <Tab>Home</Tab>
          <Tab>About</Tab>
          <Tab>Blog</Tab>
        </TabList>
        <TabPanel value={0}>
          <Template>
            <Header />
            <Divider component="div" role="presentation" sx={{ marginTop: 10 }}>
              <Typography level="h3">Recent Projects</Typography>
            </Divider>
            <Stack direction="row" spacing={2} sx={{ marginY: 3 }}>
              {projectData.map(project => <ProjectCard project={project} />)}
            </Stack>
          </Template>
        </TabPanel>
        <TabPanel value={1}>
          <b>Second</b> tab panel
        </TabPanel>
        <TabPanel value={2}>
          <b>Third</b> tab panel
        </TabPanel>
      </Tabs>
    </Box>

  )
}
