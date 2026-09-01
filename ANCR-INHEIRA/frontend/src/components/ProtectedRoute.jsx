import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500">
                <span className="font-mono-metadata text-xs uppercase tracking-[0.3em]">Authenticating…</span>
            </div>
        );
    }
    if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
    return children;
}
