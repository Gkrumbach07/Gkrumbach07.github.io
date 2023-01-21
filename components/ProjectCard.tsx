import React, { useMemo } from 'react';

import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Chip from '@mui/joy/Chip';
import CardOverflow from '@mui/joy/CardOverflow';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';

import Divider from '@mui/joy/Divider';
import AspectRatio from '@mui/joy/AspectRatio';
import Link from '@mui/joy/Link';
import { Database } from '../lib/types/database.types';
import useMediaQuery, { BREAKPOINTS } from '../hooks/useMediaQuery';
import Box from '@mui/joy/Box';
import { Project } from '../lib/types/types';


export type ProjectCardProps = {
    project: Project
}

const getTimeSince = (date: string) => {
    const datetime = new Date(date)
    if (datetime) {
        const fromToday = Date.now() - datetime.getTime()
        if(fromToday / 3.6e+6 < 24) {
            const time = Math.ceil(fromToday / 3.6e+6)
            return `${time} hour${time === 1 ? "" : "s"} ago`
        }
        else if(fromToday / 8.64e+7 < 28) {
            const time = Math.ceil(fromToday / 8.64e+7)
            return `${time} day${time === 1 ? "" : "s"} ago`
        }
        else if(fromToday / 2.628e+9 < 12) {
            const time = Math.ceil(fromToday / 2.628e+9)
            return `${time} month${time === 1 ? "" : "s"} ago`
        }

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

    const image = useMemo(() => {
        const choice = Math.floor(Math.random() * 4)
        return `/assets/background-${choice}.png`
    }, [])

    return (
        <>
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
                                src={image}
                                loading="lazy"
                                alt=""
                            />
                        </AspectRatio>
                    </CardOverflow>
                )
            }
            <Stack direction={isSmall ? "row" : "column"} spacing={isSmall ? 2 : 0} height="100%">
                {!isMobile && isSmall && (
                    <Box minWidth="100px" >
                        <AspectRatio ratio="1" sx={{ marginBottom: 2 }}>
                            <img
                                src={image}
                                srcSet={image}
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
                            href={project.link ?? undefined}
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
        </>
        
    )
}

export default ProjectCard