import Box from "@mui/system/Box"
import React from "react"

type TemplateProps = {
    children?: React.ReactNode
  };

export const Template: React.FC<TemplateProps> = ({children}) => {
    return (
        <Box sx={{
            justifyContent: "center",
            maxWidth: "1120px",
            margin: "5% 10%"
        }}>
            {children}
        </Box>
    )
}

export default Template