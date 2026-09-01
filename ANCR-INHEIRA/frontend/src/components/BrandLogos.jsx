// Brand assets — official INHEIRA™ logos
export const INHEIRA_LOGO_URL = 'https://customer-assets.emergentagent.com/job_ownership-os-1/artifacts/4ga63df1_ChatGPT%20Image%20Jul%206%2C%202026%2C%2007_50_48%20PM.png';
export const ANCR_LOGO_URL = 'https://customer-assets.emergentagent.com/job_ownership-os-1/artifacts/7zne902n_ChatGPT%20Image%20Jul%204%2C%202026%2C%2007_42_00%20PM.png';

export function InheiraMark({ className = 'h-8 w-auto' }) {
    return (
        <img
            src={INHEIRA_LOGO_URL}
            alt="INHEIRA — From Creation to Legacy"
            className={className}
            style={{
                maskImage: 'radial-gradient(ellipse 65% 55% at 50% 50%, black 55%, transparent 92%)',
                WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 50%, black 55%, transparent 92%)',
                filter: 'drop-shadow(0 0 40px rgba(129, 140, 248, 0.18))',
            }}
        />
    );
}

// Legacy alias removed post-rebrand — all imports now use InheiraMark directly.

export function AncrMark({ className = 'h-8 w-auto' }) {
    return (
        <img
            src={ANCR_LOGO_URL}
            alt="ANCR — Artist Discovery & Development Network"
            className={className}
            style={{ filter: 'drop-shadow(0 0 14px rgba(59, 130, 246, 0.3))' }}
        />
    );
}
