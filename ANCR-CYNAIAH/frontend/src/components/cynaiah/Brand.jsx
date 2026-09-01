import { TID } from "@/constants/testIds";

export const CynaiahMark = ({ className = "", showText = true, size = 42 }) => (
    <div
        data-testid={TID.sidebarLogo}
        className={`flex items-center gap-3 ${className}`}
    >
        <img
            src="/brand/cynaiah-mark.png"
            alt=""
            style={{ width: size, height: size }}
            className="object-contain drop-shadow-[0_0_18px_rgba(109,40,217,0.4)]"
        />
        {showText && (
            <div className="leading-none">
                <div className="font-heading text-lg tracking-[0.22em] text-white">
                    CYNAIAH
                    <span className="text-white/40 text-[9px] align-top ml-0.5">™</span>
                </div>
                <div className="text-[9px] tracking-[0.28em] text-white/40 mt-1 uppercase">
                    Vision · Story · Impact
                </div>
            </div>
        )}
    </div>
);

export const CynaiahLogoLarge = ({ className = "" }) => (
    <img
        src="/brand/cynaiah-logo.png"
        alt="CYNAIAH — School of Film, Visual Storytelling & Emerging Media"
        className={`object-contain ${className}`}
        style={{ filter: "drop-shadow(0 0 40px rgba(109,40,217,0.35))" }}
    />
);

export const AncrMark = ({ className = "", size = 20 }) => (
    <img
        src="/brand/ancr-logo.png"
        alt="ANCR ecosystem"
        style={{ height: size }}
        className={`object-contain ${className}`}
    />
);

export const PoweredByAncr = ({ className = "" }) => (
    <div
        className={`flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-white/35 ${className}`}
    >
        <span>Powered by</span>
        <AncrMark size={14} className="opacity-80" />
    </div>
);
