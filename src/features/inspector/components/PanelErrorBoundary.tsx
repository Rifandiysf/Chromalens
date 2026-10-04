import { Component, type ErrorInfo, type ReactNode } from 'react';
import { getErrorMessage } from '@/shared/errors';

interface PanelErrorBoundaryProps {
  resetKey: unknown;
  children: ReactNode;
}

interface PanelErrorBoundaryState {
  errorMessage: string | null;
}

export class PanelErrorBoundary extends Component<PanelErrorBoundaryProps, PanelErrorBoundaryState> {
  override state: PanelErrorBoundaryState = { errorMessage: null };

  static getDerivedStateFromError(renderError: unknown): PanelErrorBoundaryState {
    return { errorMessage: getErrorMessage(renderError) };
  }

  override componentDidCatch(renderError: Error, errorInfo: ErrorInfo): void {
    console.error(`[Chromalens] The color panel failed to render: ${renderError.message}`, errorInfo.componentStack);
  }

  override componentDidUpdate(previousProps: PanelErrorBoundaryProps): void {
    if (previousProps.resetKey !== this.props.resetKey && this.state.errorMessage !== null) {
      this.setState({ errorMessage: null });
    }
  }

  override render(): ReactNode {
    if (this.state.errorMessage !== null) {
      return <p className="cn-empty-message">Chromalens ran into a problem. {this.state.errorMessage}</p>;
    }
    return this.props.children;
  }
}
