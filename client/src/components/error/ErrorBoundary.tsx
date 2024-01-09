import * as React from 'react'
import ErrorCard from './ErrorCard'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  info?: React.ErrorInfo
}

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>
> {
  readonly state: ErrorBoundaryState = { hasError: false }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Display fallback UI
    this.setState({ hasError: true, error, info })
  }

  clearError() {
    this.setState({
      hasError: false,
      error: null,
      info: null
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorCard
          error={this.state.error as Error}
          info={this.state.info as React.ErrorInfo}
          onClearError={this.clearError}
        />
      )
    } else {
      return this.props.children
    }
  }
}

;(ErrorBoundary as any).displayName = 'ErrorBoundary'
