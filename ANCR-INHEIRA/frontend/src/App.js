import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import ModuleFrame from '@/components/ModuleFrame';
import Landing from '@/pages/Landing';
import AuthPage from '@/pages/AuthPage';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Sessions from '@/pages/Sessions';
import NewSession from '@/pages/NewSession';
import SessionDetail from '@/pages/SessionDetail';
import SplitSheet from '@/pages/SplitSheet';
import Vaulta from '@/pages/Vaulta';
import StudioSession from '@/pages/StudioSession';
import SongDNA from '@/pages/SongDNA';
import CreatorPassport from '@/pages/CreatorPassport';
import ReleaseDashboard from '@/pages/ReleaseDashboard';
import SongIntelligence from '@/pages/SongIntelligence';
import PublicReport from '@/pages/PublicReport';
import ConnectedServices from '@/pages/ConnectedServices';
import WritingRooms from '@/pages/WritingRooms';

function AppRouter() {
    const location = useLocation();
    // Handle Emergent Auth session_id in URL fragment BEFORE normal routing.
    if (location.hash?.includes('session_id=')) {
        return <AuthCallback />;
    }
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
            <Route path="/sessions/new" element={<ProtectedRoute><NewSession /></ProtectedRoute>} />
            <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetail /></ProtectedRoute>} />
            <Route path="/sessions/:id/studio" element={<ProtectedRoute><StudioSession /></ProtectedRoute>} />
            <Route path="/sessions/:id/dna" element={<ProtectedRoute><SongDNA /></ProtectedRoute>} />
            <Route path="/sessions/:id/release" element={<ProtectedRoute><ReleaseDashboard /></ProtectedRoute>} />
            <Route path="/sessions/:id/intelligence" element={<ProtectedRoute><SongIntelligence /></ProtectedRoute>} />
            <Route path="/report/:token" element={<PublicReport />} />
            <Route path="/creator/:id" element={<ProtectedRoute><ModuleFrame pathname={location.pathname}><CreatorPassport /></ModuleFrame></ProtectedRoute>} />
            <Route path="/settings/integrations" element={<ProtectedRoute><ConnectedServices /></ProtectedRoute>} />
            <Route path="/sessions/:id/split-sheet" element={<ProtectedRoute><SplitSheet /></ProtectedRoute>} />
            <Route path="/vaulta" element={<ProtectedRoute><ModuleFrame pathname={location.pathname}><Vaulta /></ModuleFrame></ProtectedRoute>} />
            <Route path="/writing-rooms" element={<ProtectedRoute><WritingRooms /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

function NotFound() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 text-center">
            <div className="max-w-md">
                <div className="font-mono-metadata text-[10px] uppercase tracking-[0.3em] text-indigo-300 mb-4">/ 404</div>
                <h1 className="font-display font-black text-5xl md:text-6xl tracking-tighter text-white mb-4">Page not found.</h1>
                <p className="text-sm text-zinc-500 mb-8">This route doesn't exist in INHEIRA™.</p>
                <a href="/dashboard" className="inline-block px-6 py-3 bg-white hover:bg-zinc-200 text-black font-bold transition-colors">Back to Dashboard</a>
            </div>
        </div>
    );
}

function App() {
    return (
        <div className="App min-h-screen bg-zinc-950 text-zinc-50">
            <BrowserRouter>
                <AuthProvider>
                    <ErrorBoundary>
                        <AppRouter />
                    </ErrorBoundary>
                    <Toaster theme="dark" position="top-right" />
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
