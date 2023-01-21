import React from "react"

import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';
import Button from '@mui/joy/Button';
import Stack from "@mui/joy/Stack";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import useMediaQuery, { BREAKPOINTS } from "../hooks/useMediaQuery"
import { CssVarsProvider } from "@mui/joy";
import { OpenInNew } from "@mui/icons-material";

const Header = () => {
    const isSmall = useMediaQuery(BREAKPOINTS.down("sm"))

    return (
        <CssVarsProvider defaultMode="light" colorSchemeSelector="#light-header" disableNestedContext>
            <Stack id="light-header" direction={isSmall ? "column" : "row"} spacing={5} alignItems="center" sx={{ margin: isSmall ? 5 : 0 }}>
                <Stack direction="column" textAlign={isSmall ? "center" : undefined}>
                    <Typography level="body1" textColor="GrayText">
                        Software Engineer
                    </Typography>
                    <Typography gutterBottom level="h1">
                        Gage Krumbach
                    </Typography>
                    <Typography level="body2">
                        I am a software engineer interested in building tools that solve problems that I face in everyday life. Currently I am focused on building open source services in the kubernetes ecosystem at <Link
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
                        {/* <Button
                            onClick={function () { }}
                            size="lg"
                            variant="solid"
                            fullWidth={isSmall}
                        >Contact</Button> */}
                        <Button
                            href="https://drive.google.com/file/d/1QiigYgNMHvSaex-9EQwnuKyBeIBhi9x4/view?usp=sharing"
                            size="sm"
                            component="a"
                            target="_blank"
                            rel="noopener"
                            variant="solid"
                            endDecorator={<OpenInNew />}
                            fullWidth={isSmall}
                        >Resume</Button>
                    </Stack>
                </Stack>
            </Stack>
        </CssVarsProvider>

    )
}

export default Header