import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
    const nav = useNavigate();
    const hasProcessed = useRef(false);
    const { setUser } = useAuth();

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const hash = window.location.hash || '';
        const match = hash.match(/session_id=([^&]+)/);
        const sessionId = match ? decodeURIComponent(match[1]) : null;

        if (!sessionId) {
            nav('/auth', { replace: true });
            return;
        }

        (async () => {
            try {
                const { data } = await api.post('/auth/session', { session_id: sessionId }, {
                    headers: { 'X-Session-ID': sessionId },
                });
                if (data?.token) setToken(data.token);
                if (data?.user) setUser(data.user);
                nav('/dashboard', { replace: true, state: { user: data.user } });
            } catch (e) {
                nav('/auth', { replace: true });
            }
        })();
    }, [nav, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500">
            <span className="font-mono-metadata text-xs uppercase tracking-[0.3em]">Establishing your RightPrint session…</span>
        </div>
    );
}
