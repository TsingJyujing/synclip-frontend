import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import React from "react";

interface MyThemeProviderProps {
    children?: JSX.Element;
}
export default function MyThemeProvider({ children }: MyThemeProviderProps) {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () => createTheme({
            palette: {
                mode: prefersDarkMode ? 'dark' : 'light',
                primary: {
                    main: "#CCCCFF"
                }
            },
        }),
        [prefersDarkMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}