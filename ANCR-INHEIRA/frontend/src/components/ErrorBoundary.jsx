import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { InheiraMark } from '@/components/BrandLogos';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('INHEIRA error boundary caught:', error, info);
    }
    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                    <InheiraMark className="h-14 w-auto mx-auto mb-8" />
                    <AlertTriangle className="w-10 h-10 text-indigo-400 mx-auto mb-6" strokeWidth={1.5} />
                    <div className="font-display font-bold text-3xl text-white mb-3">Something went wrong.</div>
                    <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                        INHEIRA™ hit an unexpected error. Your session data is safe — nothing has been lost.
                    </p>
                    <Link to="/dashboard" className="inline-block px-6 py-3 bg-indigo-400 hover:bg-indigo-500 text-zinc-950 font-bold transition-colors">
                        Back to Dashboard
                    </Link>
                    {this.state.error?.message && (
                        <details className="mt-8 text-left">
                            <summary className="font-mono-metadata text-[10px] uppercase tracking-[0.25em] text-zinc-500 cursor-pointer">Technical details</summary>
                            <pre className="mt-3 p-3 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 whitespace-pre-wrap font-mono-metadata">{String(this.state.error.message)}</pre>
                        </details>
                    )}
                </div>
            </div>
        );
    }
}
