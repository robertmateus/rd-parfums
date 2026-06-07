import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: any;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    try {
      const payload = {
        error: error.message,
        stack: error.stack,
        info,
        time: new Date().toISOString(),
      };
      localStorage.setItem('rd_admin_error_last', JSON.stringify(payload));
      // also log to console for developer visibility
      // eslint-disable-next-line no-console
      console.error('Captured AdminPanel error:', payload);
    } catch (e) {
      // ignore
    }
    this.setState({ info });
  }

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, info: undefined });
    // attempt a soft reload of page state to recover
    try {
      window.location.reload();
    } catch (e) {
      // ignore
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="max-w-xl w-full bg-zinc-950 border border-red-900/30 rounded-lg p-6 text-center">
            <h2 className="text-lg font-serif text-white mb-2">Erro no Painel Administrativo</h2>
            <p className="text-sm text-zinc-400 mb-4">Um erro inesperado ocorreu ao abrir o painel. Os detalhes foram salvos localmente para análise.</p>
            <div className="text-xs text-zinc-300 mb-4 break-words max-h-40 overflow-auto text-left bg-black/40 p-2 border border-zinc-900 rounded">
              <pre className="whitespace-pre-wrap">{this.state.error?.message}</pre>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={this.handleDismiss} className="px-4 py-2 bg-gold-400 text-zinc-900 rounded font-bold">Recarregar</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
