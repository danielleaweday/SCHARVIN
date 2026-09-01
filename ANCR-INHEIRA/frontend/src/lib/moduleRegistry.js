/**
 * INHEIRA / ANCR — Ecosystem Module Registry
 *
 * Every ANCR product is registered here. Navigation, cross-module links,
 * breadcrumbs, and future standalone-deployment routing all read from this
 * one source of truth. When (for example) ANCRID becomes its own deployed
 * app, we only change `external_url` here — the UI and business logic
 * elsewhere never change.
 *
 * Fields per module:
 *   module_id           unique key (kebab-case)
 *   display_name        canonical brand name
 *   tagline             one-line description
 *   owning_product      "ANCR" for ecosystem modules; the parent product
 *   route_prefix        path this module owns inside the current monorepo
 *   external_url        set to a fully-qualified URL when the module ships
 *                       standalone; null means "resolve locally"
 *   icon                Lucide icon name (for menus / chips)
 *   availability        "live" · "beta" · "coming_soon"
 *   nav                 visibility metadata (see NavPrimary and EcosystemMenu)
 *                         primary   — appears in the primary nav
 *                         ecosystem — appears in the ecosystem drawer
 *                         hidden    — reachable only via deep-link
 *   permissions         placeholder for future access-control checks
 */

export const MODULES = {
    inheira: {
        module_id: 'inheira',
        display_name: 'INHEIRA',
        tagline: 'The operating system for creative ownership and legacy.',
        owning_product: 'INHEIRA',
        route_prefix: '/',
        external_url: null,
        icon: 'Compass',
        availability: 'live',
        nav: { primary: true, ecosystem: false },
        permissions: [],
        color: '#818cf8',
    },
    ancrid: {
        module_id: 'ancrid',
        display_name: 'ANCRID',
        tagline: 'Creator identity, verified across the ecosystem.',
        owning_product: 'ANCR',
        route_prefix: '/creator',
        external_url: null,          // Future: 'https://ancrid.app'
        icon: 'IdCard',
        availability: 'live',
        nav: { primary: false, ecosystem: true },
        permissions: ['creator.read'],
        color: '#38bdf8',
    },
    vaulta: {
        module_id: 'vaulta',
        display_name: 'Vaulta',
        tagline: 'Sealed rights, ready for the market.',
        owning_product: 'ANCR',
        route_prefix: '/vaulta',
        external_url: null,          // Future: 'https://vaulta.app'
        icon: 'Vault',
        availability: 'live',
        nav: { primary: false, ecosystem: true },
        permissions: ['vaulta.read'],
        color: '#f472b6',
    },
    // ---- Coming Soon (registered so cross-references never dangle) ----
    cynaiah: {
        module_id: 'cynaiah',
        display_name: 'CYNAIAH',
        tagline: 'AI-assisted co-creation intelligence.',
        owning_product: 'ANCR',
        route_prefix: null,
        external_url: null,
        icon: 'Brain',
        availability: 'coming_soon',
        nav: { primary: false, ecosystem: true },
        permissions: [],
        color: '#c084fc',
    },
    ancrsync: {
        module_id: 'ancrsync',
        display_name: 'ANCRSYNC',
        tagline: 'Sync licensing for the ecosystem.',
        owning_product: 'ANCR',
        route_prefix: null,
        external_url: null,
        icon: 'RefreshCw',
        availability: 'coming_soon',
        nav: { primary: false, ecosystem: true },
        permissions: [],
        color: '#4ade80',
    },
    ancrview: {
        module_id: 'ancrview',
        display_name: 'ANCRVIEW',
        tagline: 'Analytics & audience insight across releases.',
        owning_product: 'ANCR',
        route_prefix: null,
        external_url: null,
        icon: 'LineChart',
        availability: 'coming_soon',
        nav: { primary: false, ecosystem: true },
        permissions: [],
        color: '#fb923c',
    },
    ancrmedia: {
        module_id: 'ancrmedia',
        display_name: 'ANCRMEDIA',
        tagline: 'Owned media hosting and delivery.',
        owning_product: 'ANCR',
        route_prefix: null,
        external_url: null,
        icon: 'Film',
        availability: 'coming_soon',
        nav: { primary: false, ecosystem: true },
        permissions: [],
        color: '#f43f5e',
    },
    ancrwav: {
        module_id: 'ancrwav',
        display_name: 'ANCRWAV',
        tagline: 'Master audio custody & distribution.',
        owning_product: 'ANCR',
        route_prefix: null,
        external_url: null,
        icon: 'AudioWaveform',
        availability: 'coming_soon',
        nav: { primary: false, ecosystem: true },
        permissions: [],
        color: '#22d3ee',
    },
    ancrshop: {
        module_id: 'ancrshop',
        display_name: 'ANCRSHOP',
        tagline: 'Direct-to-fan commerce for creator estates.',
        owning_product: 'ANCR',
        route_prefix: null,
        external_url: null,
        icon: 'Store',
        availability: 'coming_soon',
        nav: { primary: false, ecosystem: true },
        permissions: [],
        color: '#facc15',
    },
};

/** Convenience list, sorted with `inheira` first, then live modules, then coming-soon. */
export const MODULE_LIST = Object.values(MODULES).sort((a, b) => {
    const rank = (m) => (m.module_id === 'inheira' ? 0 : m.availability === 'live' ? 1 : 2);
    return rank(a) - rank(b);
});

export const getModule = (id) => MODULES[id] || null;

/**
 * Resolve a URL for a module (respecting future external deployments).
 * Passing an optional `subpath` (leading "/") appends it to the route_prefix.
 */
export function moduleHref(moduleId, subpath = '') {
    const m = MODULES[moduleId];
    if (!m) return null;
    if (m.availability === 'coming_soon') return null;
    if (m.external_url) return m.external_url + (subpath || '');
    if (!m.route_prefix) return null;
    if (subpath && m.route_prefix.endsWith('/')) return m.route_prefix + subpath.replace(/^\//, '');
    return m.route_prefix + (subpath || '');
}

/**
 * Are we currently INSIDE a non-INHEIRA module? Used by ModuleFrame to
 * render an ownership eyebrow the user can trust ("You're in ANCRID").
 */
export function moduleForPath(pathname) {
    // Longest prefix match, ignoring INHEIRA (which is the root).
    const candidates = MODULE_LIST
        .filter((m) => m.module_id !== 'inheira' && m.route_prefix && !m.external_url)
        .sort((a, b) => b.route_prefix.length - a.route_prefix.length);
    for (const m of candidates) {
        if (pathname === m.route_prefix || pathname.startsWith(m.route_prefix + '/')) return m;
    }
    return MODULES.inheira;
}
