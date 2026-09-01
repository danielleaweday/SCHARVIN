import { Navigate, useParams } from 'react-router-dom';

/*
 * INHEIRA — Session Detail is now consolidated into the full Studio Session.
 * The previous small workspace at `/sessions/:id` predated the Phase-2 cinematic
 * conventions and has been superseded. Anyone landing here is sent straight
 * into the unified studio.
 */
export default function SessionDetail() {
    const { id } = useParams();
    return <Navigate to={`/sessions/${id}/studio`} replace />;
}
