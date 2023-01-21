import React from "react"
import { CssVarsProvider, extendTheme, getInitColorSchemeScript, StyledEngineProvider} from '@mui/joy/styles';
import '@fontsource/public-sans';
import { CssBaseline } from "@mui/joy";

type ThemeProps = {
  children?: React.ReactNode;
}


export const Theme: React.FC<ThemeProps> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <CssVarsProvider defaultMode="dark" colorSchemeSelector="#dark-mode-by-default">
        <div id="dark-mode-by-default" style={{backgroundColor: "#0b1519", margin: "-8px"}}>
          {children}
        </div>
      </CssVarsProvider>
    </StyledEngineProvider>
  )
}