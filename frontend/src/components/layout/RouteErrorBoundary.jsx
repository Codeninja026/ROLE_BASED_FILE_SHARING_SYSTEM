import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useLocation } from "react-router-dom";

class RouteErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Route render failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
          <div className="glass-card max-w-xl w-full p-8 text-center space-y-5">
            <AlertTriangle className="w-14 h-14 mx-auto text-error opacity-80" />
            <div>
              <h1 className="text-2xl font-black font-manrope tracking-tight">
                Page Could Not Load
              </h1>
              <p className="text-sm text-on-surface-variant mt-2">
                This page hit an unexpected UI error. Refresh once and try again.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 h-11 px-5 bg-primary text-black font-black rounded-xl"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const RouteErrorBoundary = ({ children }) => {
  const location = useLocation();
  return (
    <RouteErrorBoundaryInner key={location.pathname}>
      {children}
    </RouteErrorBoundaryInner>
  );
};
