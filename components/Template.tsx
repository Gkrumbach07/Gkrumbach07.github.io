import { padding } from "@mui/system";
import Box from "@mui/system/Box"
import React from "react"

type TemplateProps = {
    children?: React.ReactNode
  };

export const Template: React.FC<TemplateProps> = ({children}) => {
    return (
        <Box sx={{
            justifyContent: "center",
            marginTop: "-180px",
            padding: 1,
            paddingX: "10%",
        }}>
            {children}
        </Box>
    )
}

export default Template