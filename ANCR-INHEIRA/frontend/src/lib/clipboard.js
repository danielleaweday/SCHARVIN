// Safe clipboard write that degrades in preview / headless / permission-denied contexts.
// Returns { ok: boolean }.
export async function copyToClipboard(text) {
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return { ok: true };
        }
    } catch (_e) {
        // fall through to textarea fallback
    }
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
        return { ok: !!ok };
    } catch (_e) {
        return { ok: false };
    }
}
