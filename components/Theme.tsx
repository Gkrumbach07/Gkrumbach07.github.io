import React from "react"
import { CssVarsProvider, StyledEngineProvider} from '@mui/joy/styles';
import '@fontsource/public-sans';

type ThemeProps = {
  children?: React.ReactNode;
}

export const Theme: React.FC<ThemeProps> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <CssVarsProvider>
        {children}
      </CssVarsProvider>
    </StyledEngineProvider>
  )
}