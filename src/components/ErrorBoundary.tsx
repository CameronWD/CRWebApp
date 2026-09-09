import { Component, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-md rounded-2xl bg-surface p-6 text-center dark:bg-night-surface">
          <h1 className="font-display text-xl font-medium">Something went wrong.</h1>
          <p className="mt-2 text-sm leading-relaxed text-mist dark:text-night-mist">
            Your records are still on this device.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href="#/"
              onClick={this.reset}
              className="rounded-2xl bg-sage-soft px-4 py-3 text-sm font-medium text-sage-deep dark:bg-night-bg dark:text-sage"
            >
              Back home
            </a>
            <a
              href="#/settings"
              onClick={this.reset}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-mist dark:text-night-mist"
            >
              Go to Settings
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
