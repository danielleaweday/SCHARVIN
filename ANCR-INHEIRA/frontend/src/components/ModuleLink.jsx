import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { getModule, moduleHref } from '@/lib/moduleRegistry';

/**
 * INHEIRA — ModuleLink
 *
 * The single call-site for every cross-module navigation. Given a `module`
 * id and an optional `subpath` (leading "/"), it renders:
 *
 *   • a react-router <Link> when the module is served locally (external_url
 *     is null — the current state for every ANCR module today)
 *   • an <a target="_blank" rel="noreferrer"> when the module has moved to
 *     its own deployment (external_url is set)
 *   • nothing clickable (a plain span) when the module is `coming_soon` —
 *     never render a broken link
 *
 * This is what makes the moduleRegistry the *actual* single source of
 * navigation truth. When (for example) Vaulta ships standalone, the only
 * change required is `MODULES.vaulta.external_url = '...'` — every existing
 * ModuleLink instance in the app updates automatically.
 */
const ModuleLink = forwardRef(function ModuleLink(
    { module: moduleId, subpath = '', children, className, testid, onClick, title, ...rest },
    ref
) {
    const mod = getModule(moduleId);
    // Fail-soft: unknown module id -> just render children non-interactively.
    if (!mod) return <span ref={ref} className={className} data-testid={testid} title={title} onClick={onClick} {...rest}>{children}</span>;

    if (mod.availability === 'coming_soon') {
        return (
            <span
                ref={ref}
                className={className}
                data-testid={testid}
                title={title || `${mod.display_name} — coming soon`}
                aria-disabled="true"
                {...rest}
            >
                {children}
            </span>
        );
    }

    const href = moduleHref(moduleId, subpath);
    if (!href) return <span ref={ref} className={className} data-testid={testid} title={title} onClick={onClick} {...rest}>{children}</span>;

    if (mod.external_url) {
        return (
            <a
                ref={ref}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={className}
                data-testid={testid}
                onClick={onClick}
                title={title}
                {...rest}
            >
                {children}
            </a>
        );
    }

    return (
        <Link
            ref={ref}
            to={href}
            className={className}
            data-testid={testid}
            onClick={onClick}
            title={title}
            {...rest}
        >
            {children}
        </Link>
    );
});

export default ModuleLink;
