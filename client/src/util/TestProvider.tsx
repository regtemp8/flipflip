import * as React from 'react'
import { Provider } from 'react-redux'
import { createTheme } from '@mui/material'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import defaultTheme from 'flipflip-common'

export default class TestProvider extends React.Component {
  readonly props: {
    children: any
    store: any
  }

  disableTransitions = {
    defaultProps: {
      disablePortal: true,
      hideBackdrop: true,
      TransitionComponent: ({ children }) => children
    }
  }

  render() {
    const theme = createTheme({
      ...defaultTheme,
      // disable Transitions when runing tests, throws errors otherwise.
      components: {
        MuiMenu: this.disableTransitions,
        MuiPopover: this.disableTransitions,
        MuiDialog: this.disableTransitions,
        MuiModal: this.disableTransitions
      }
    } as any)
    return (
      <Provider store={this.props.store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>{this.props.children}</ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )
  }
}
