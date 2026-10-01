import React from "react";

type Props = React.PropsWithChildren;
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("BrainTumorVision UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen grid place-items-center bg-navy-950 p-6 text-slate-100">
          <section className="max-w-md rounded-2xl border border-red-500/30 bg-navy-900 p-8 text-center space-y-4">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-slate-400">Please refresh the page. If the issue continues, restart the Vite development server.</p>
            <button onClick={() => window.location.reload()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Refresh page</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
