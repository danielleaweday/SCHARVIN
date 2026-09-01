import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, setBearer } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh, setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const sessionId = params.get("session_id");

    if (!sessionId) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        const { data } = await api.post("/auth/emergent", { session_id: sessionId });
        setBearer(data.session_token);
        setUser(data.user);
        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error(e);
        navigate("/login?error=emergent", { replace: true });
      }
    })();
  }, [navigate, refresh, setUser]);

  return (
    <div className="min-h-screen grid place-items-center bg-black text-white">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-cohesion mb-6 animate-pulse" />
        <div className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
          Verifying ANCRID™ session…
        </div>
      </div>
    </div>
  );
}
