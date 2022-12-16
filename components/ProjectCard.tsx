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

import Divider from '@mui/joy/Divider';
import AspectRatio from '@mui/joy/AspectRatio';
import Link from '@mui/joy/Link';
import { Database } from '../lib/database.types';
import useMediaQuery, { BREAKPOINTS } from '../hooks/useMediaQuery';
import Box from '@mui/joy/Box';
import { animated, useTransition } from 'react-spring'
import { useAuthenticated } from '../hooks/useAuthenticated';
import EditProjectModal from './EditProjectModal';
import CardCover from '@mui/joy/CardCover';


export type ProjectCardProps = {
    project: Database["public"]["Tables"]["projects"]["Row"]
}

// flesh out
const getTimeSince = (date: string) => {
    if (date) {
        return (new Date(date)).toLocaleDateString()
    }
}

const getStateChip = (state: Database["public"]["Enums"]["status"]) => {
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
    const isSmall = useMediaQuery(BREAKPOINTS.down("sm"))
    const isMobile = useMediaQuery(BREAKPOINTS.down("mobile"))
    const isAdmin = useAuthenticated()

    return (
        <Card variant="outlined"
            sx={(theme) => ({
                transition: 'transform 0.3s, border 0.3s',
                '&:hover': {
                    borderColor: theme.vars.palette.primary.outlinedHoverBorder,
                    transform: 'translateY(-2px)',
                },
            })}>
            {
                !isSmall && (
                    <CardOverflow>
                        <AspectRatio ratio="2" sx={{ marginBottom: 2 }}>
                            <img
                                src="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=318"
                                srcSet="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=318&dpr=2 2x"
                                loading="lazy"
                                alt=""
                            />
                        </AspectRatio>
                    </CardOverflow>
                )
            }
            {
                isAdmin && (
                    <Box sx={{
                        position: 'absolute',
                        zIndex: 2,
                        right: '0.5rem',
                        top: "0.5rem",
                      }}>
                        <EditProjectModal project={project} buttonVariant={!isSmall ? "soft" : "outlined"}/>
                    </Box>
                )
            }
            <Stack direction={isSmall ? "row" : "column"} spacing={isSmall ? 2 : 0} height="100%">
                {!isMobile && isSmall && (
                    <Box minWidth="100px" >
                        <AspectRatio ratio="1" sx={{ marginBottom: 2 }}>
                            <img
                                src="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=318"
                                srcSet="https://images.unsplash.com/photo-1532614338840-ab30cf10ed36?auto=format&fit=crop&w=318&dpr=2 2x"
                                loading="lazy"
                                alt=""
                            />
                        </AspectRatio>
                    </Box>
                )}
                <Stack direction="column" height="100%">
                    <Typography level="h2" fontSize="md" sx={{ mb: 0.5 }}>
                        <Link
                            overlay
                            underline="none"
                            onClick={() => fetch('/api/projects').then((res) => res.json())}
                            sx={{ color: 'text.primary' }}
                        >
                            {project.title}
                        </Link>
                    </Typography>
                    <Typography level="body3" sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                    }}>
                        {project.details}
                    </Typography>
                    {project.tags && (
                        <Stack direction="row" spacing={1} marginBottom={1} marginTop="auto" paddingTop={1}>
                            {project.tags.map(tag => (
                                <Chip key={tag} size="sm" variant='outlined' color='neutral'>{tag}</Chip>
                            ))}
                        </Stack>
                    )}
                </Stack>
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
                    {getStateChip(project.status ?? "upcoming")}
                </Typography>
                {project.lastUpdated && (
                    <>
                        <Divider orientation="vertical" />
                        <Typography level="body3" sx={{ fontWeight: 'md', color: 'text.secondary' }}>
                            {`Last updated ${getTimeSince(project.lastUpdated)}`}
                        </Typography>
                    </>
                )}
            </CardOverflow>


        </Card>
    )
}

export default ProjectCard