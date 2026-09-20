import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error trapped by LedgerAI ErrorBoundary:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper" role="alert">
          <div className="error-boundary-card">
            <div className="error-boundary-icon-box">
              <AlertOctagon size={40} className="error-icon" />
            </div>
            <h1 className="error-boundary-title">Application State Safeguard</h1>
            <p className="error-boundary-message">
              An unexpected UI runtime error occurred. LedgerAI has protected your session state and isolated the component failure.
            </p>
            {this.state.error && (
              <div className="error-boundary-details">
                <code>{this.state.error.message}</code>
              </div>
            )}
            <div className="error-boundary-actions">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                leftIcon={<Home size={16} />}
              >
                Return to Dashboard
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.location.reload()}
                leftIcon={<RotateCcw size={16} />}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
