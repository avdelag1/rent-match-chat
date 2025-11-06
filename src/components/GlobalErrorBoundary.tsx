import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  copied: boolean;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleCopyDetails = async () => {
    const { error, errorInfo } = this.state;
    const details = `Error: ${error?.message || 'Unknown error'}\n\nStack Trace:\n${error?.stack || 'No stack trace available'}\n\nComponent Stack:\n${errorInfo?.componentStack || 'No component stack available'}`;
    
    try {
      await navigator.clipboard.writeText(details);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  public render() {
    if (this.state.hasError) {
      const { error, copied } = this.state;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-white/20 bg-black/40 backdrop-blur-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <CardTitle className="text-2xl text-white">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-center">
                We encountered an unexpected error. Please try reloading the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-red-950/30 border border-red-500/30 p-3 rounded-lg text-xs font-mono text-red-300 overflow-auto max-h-40">
                  <strong className="text-red-400">Error:</strong> {error.message}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer hover:text-red-200">Stack trace</summary>
                      <pre className="mt-2 text-xs whitespace-pre-wrap break-words">{error.stack}</pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.handleReload} 
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                <Button 
                  onClick={this.handleCopyDetails} 
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Details
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-white/50 text-center mt-4">
                If this problem persists, please contact support with the error details.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
