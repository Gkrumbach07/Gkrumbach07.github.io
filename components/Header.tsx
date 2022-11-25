import React from "react"

import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';
import Button from '@mui/joy/Button';
import Stack from "@mui/system/Stack";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/system/Box";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import useMediaQuery, { BREAKPOINTS } from "../hooks/useMediaQuery"

const Header = () => {
    const isSmall = useMediaQuery(BREAKPOINTS.down("sm"))
    const isMedium = useMediaQuery(BREAKPOINTS.up("md"))

    return (
        <Stack direction={isSmall ? "column" : "row"} spacing={5} alignItems="center" sx={{margin: isMedium ? "5% 10%" : undefined}}>
            <Box sx={{
                width: "100%",
                boxShadow: "0 0 25px 0 rgb(0 0 0 / 10%)",
                borderRadius: "1000px",
                border: "18px solid #fff",
                overflow: "hidden",
                maxWidth: "300px"
            }}>
                <AspectRatio ratio={1}>
                    <img alt="Gage Krumbach" src="/assets/gage_krumbach.jpg" />
                </AspectRatio>
            </Box>

            <Stack direction="column">
                <Typography level="body1" textColor="GrayText">
                    Software Engineer
                </Typography>
                <Typography gutterBottom level="h1">
                    Gage Krumbach
                </Typography>
                <Typography level="body2">
                    I am a software engineer interested in building tools that explore problems and ideas faced everyday. Currently I am focused on building open source services in the kubernetes ecosystem at <Link
                        color="danger"
                        target="_blank"
                        rel="noopener"
                        level="body2"
                        underline="none"
                        variant="soft"
                        href="https://www.redhat.com/en"
                    >Red Hat</Link>
                </Typography>
                <Stack marginTop={3} direction="row" spacing={2}>
                    <Button
                        onClick={function () { }}
                        size="lg"
                        variant="solid"
                        fullWidth={isSmall}
                    >Contact</Button>
                    <Button
                        onClick={function () { }}
                        size="lg"
                        variant="outlined"
                        endDecorator={<DownloadRoundedIcon />}
                        fullWidth={isSmall}
                    >Resume</Button>
                </Stack>
            </Stack>
        </Stack>
    )
}

export default Header