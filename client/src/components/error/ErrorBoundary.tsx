import { Component, ErrorInfo, PropsWithChildren } from 'react'
import ErrorCard from './ErrorCard'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  info?: ErrorInfo
}

class ErrorBoundary extends Component<PropsWithChildren> {
  readonly state: ErrorBoundaryState = { hasError: false }

  componentDidCatch(error: Error, info: ErrorInfo) {
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
          info={this.state.info as ErrorInfo}
          onClearError={this.clearError.bind(this)}
        />
      )
    } else {
      return this.props.children
    }
  }
}

;(ErrorBoundary as any).displayName = 'ErrorBoundary'
export default ErrorBoundary
