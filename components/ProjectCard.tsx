import React from 'react';

import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/system/Stack';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import CardOverflow from '@mui/joy/CardOverflow';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';

import { ProjectDataType } from '../projects';
import Divider from '@mui/joy/Divider';
import AspectRatio from '@mui/joy/AspectRatio';


export type ProjectCardProps = {
    project: ProjectDataType
}

// flesh out
const getTimeSince = (date: Date) => {
    if (date) {
        return date.toLocaleDateString()
    }
}

const getStateChip = (state: ProjectDataType["state"]) => {
    switch (state) {
        case "active":
            return <Chip size='sm' color='primary' startDecorator={<AddRoundedIcon />}>Active</Chip>

        case "done":
            return <Chip size='sm' color='success' startDecorator={<DoneRoundedIcon />}>Done</Chip>

        case "inactive":
            return <Chip size='sm' color='danger' startDecorator={<CloseRoundedIcon />}>Inactive</Chip>

        case "upcoming":
            return <Chip size='sm' color='neutral' startDecorator={<CalendarTodayRoundedIcon />}>Upcoming</Chip>
    }
}

const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <Card variant="outlined" sx={{ width: 320 }}>
            <CardOverflow>
        <AspectRatio ratio="2" sx={{marginBottom: 2}}>
          <img
            src="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=318"
            srcSet="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=318&dpr=2 2x"
            loading="lazy"
            alt=""
          />
        </AspectRatio>
      </CardOverflow>
            <Typography level="h2" fontSize="md" sx={{ mb: 0.5 }}>
                {project.title}
            </Typography>
            <IconButton
                aria-label="bookmark Bahamas Islands"
                variant="plain"
                color="neutral"
                size="sm"
                sx={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
            >
            </IconButton>
            <Typography level="body3">
                {project.details}
            </Typography>
            <Stack direction="row" spacing={1} marginBottom={2} marginTop={1}>
                {project.tags.map(tag => (
                    <Chip key={tag} size="sm" variant='outlined' color='neutral'>{tag}</Chip>
                ))}
            </Stack>
            <Divider inset="context" />
            <CardOverflow
                variant="soft"
                sx={{
                    display: 'flex',
                    alignItems: "center",
                    gap: 1,
                    py: 1,
                    px: 'var(--Card-padding)',
                    bgcolor: 'background.level1',
                }}
            >
                <Typography level="body3" sx={{ fontWeight: 'md', color: 'text.secondary' }}>
                    {getStateChip(project.state)}
                </Typography>
                <Divider orientation="vertical" />
                <Typography level="body3" sx={{ fontWeight: 'md', color: 'text.secondary' }}>
                    {`Last updated ${getTimeSince(project.lastUpdated)}`}
                </Typography>
            </CardOverflow>
        </Card>
    )
}

export default ProjectCard