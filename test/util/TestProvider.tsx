import React, { type PropsWithChildren } from "react";
import { Provider } from 'react-redux'
import { createTheme } from "@mui/material";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import defaultTheme from "../../src/renderer/data/theme";

export interface TestProviderProps {
  store: any
}

export default function TestProvider(props: PropsWithChildren<TestProviderProps>) {

  const disableTransitions = {
    defaultProps: {
      disablePortal: true,
      hideBackdrop: true,
      TransitionComponent: ({ children }) => children
    }
  };

  const theme = createTheme({
    ...defaultTheme,
    // disable Transitions when runing tests, throws errors otherwise.
    components: {
      MuiMenu: disableTransitions,
      MuiPopover: disableTransitions,
      MuiDialog: disableTransitions,
      MuiModal: disableTransitions
    }
  } as any);

  return (
    <Provider store={props.store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  );
}
