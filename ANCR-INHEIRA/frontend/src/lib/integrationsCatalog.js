// Comprehensive catalog of connected services / integrations.
// Each entry: { id, name, description, permissions[], color, defaultConnected? }
// Grouped by category.

export const CATEGORIES = [
    {
        id: 'first_party',
        title: 'First-Party Services',
        subtitle: 'The ANCR creative operating system.',
        accent: '#8B5CF6',
        services: [
            {
                id: 'ancrlab',
                name: 'ANCRLAB™',
                description: 'Research and creative development workspace.',
                permissions: ['Read Song Data', 'Write Creative Notes', 'Access AI Research', 'Generate Creative Briefs', 'Generate Mood Boards', 'Reference Library', 'Session Research', 'Creative Challenges', 'Prompt Library'],
                defaultConnected: true, verified: true,
            },
            {
                id: 'ancrwav',
                name: 'ANCRWAV™',
                description: 'Audio production environment.',
                permissions: ['Read Songs', 'Upload Audio', 'Sync Sessions', 'Import Stems', 'Export Mixes', 'Version Audio', 'Voice Memo Sync', 'Master File Storage'],
                defaultConnected: true, verified: true,
            },
            {
                id: 'ccdp',
                name: 'CCDP™',
                description: 'Education mode for universities & camps.',
                permissions: ['Instructor Access', 'Student Access', 'Assignments', 'Curriculum', 'Feedback', 'Mentorship', 'Rubrics', 'Portfolio Review', 'Learning Analytics', 'Course Integration', 'Capstone Projects'],
                defaultConnected: true, verified: true,
            },
        ],
    },
    {
        id: 'identity',
        title: 'Identity & Authentication',
        subtitle: 'How creators sign in.',
        services: [
            { id: 'google', name: 'Google', description: 'Sign in with Google.', permissions: ['Basic profile', 'Email'] },
            { id: 'apple', name: 'Apple', description: 'Sign in with Apple.', permissions: ['Basic profile', 'Email (relay)'] },
            { id: 'microsoft', name: 'Microsoft', description: 'Sign in with Microsoft.', permissions: ['Basic profile', 'Email'] },
            { id: 'github', name: 'GitHub', description: 'Sign in with GitHub.', permissions: ['Basic profile', 'Email'] },
            { id: 'linkedin', name: 'LinkedIn', description: 'Sign in with LinkedIn.', permissions: ['Basic profile', 'Public URL'] },
            { id: 'magic', name: 'Magic Link', description: 'Passwordless email sign-in.', permissions: ['Email verification'] },
            { id: '2fa', name: 'Two-Factor Auth', description: 'TOTP / SMS 2FA.', permissions: ['Phone', 'Authenticator'] },
            { id: 'passkeys', name: 'Passkeys', description: 'FIDO2 / WebAuthn.', permissions: ['Device'] },
        ],
    },
    {
        id: 'storage',
        title: 'Cloud Storage',
        subtitle: 'Where files live.',
        services: [
            { id: 'gdrive', name: 'Google Drive', description: 'Sync stems, PDFs, artwork.', permissions: ['Read', 'Write', 'Metadata'] },
            { id: 'dropbox', name: 'Dropbox', description: 'Sync session assets.', permissions: ['Read', 'Write', 'Share links'] },
            { id: 'onedrive', name: 'OneDrive', description: 'Microsoft cloud storage.', permissions: ['Read', 'Write'] },
            { id: 'box', name: 'Box', description: 'Enterprise cloud storage.', permissions: ['Read', 'Write'] },
            { id: 'icloud', name: 'iCloud Drive', description: 'Apple cloud storage.', permissions: ['Read', 'Write'] },
            { id: 's3', name: 'AWS S3', description: 'Object storage for master files.', permissions: ['Read', 'Write', 'Signed URLs'] },
            { id: 'objstore', name: 'Object Storage', description: 'Emergent object storage.', permissions: ['Read', 'Write'], defaultConnected: true },
        ],
    },
    {
        id: 'daw',
        title: 'Music Creation',
        subtitle: 'DAWs and creative tools.',
        services: [
            { id: 'ableton', name: 'Ableton Live', description: 'Import projects, sync metadata.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'logic', name: 'Logic Pro', description: 'Import projects, sync metadata.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'protools', name: 'Pro Tools', description: 'Session sync.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'flstudio', name: 'FL Studio', description: 'Sync projects & stems.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'cubase', name: 'Cubase', description: 'Cubase project sync.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'studioone', name: 'Studio One', description: 'Studio One session sync.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'reason', name: 'Reason', description: 'Reason project sync.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'reaper', name: 'Reaper', description: 'Reaper session sync.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'bandlab', name: 'BandLab', description: 'Cloud DAW sync.', permissions: ['Import project', 'Export stems', 'Metadata'] },
            { id: 'soundtrap', name: 'Soundtrap', description: 'Soundtrap session sync.', permissions: ['Import project', 'Export stems', 'Metadata'] },
        ],
    },
    {
        id: 'distribution',
        title: 'Music Distribution',
        subtitle: 'How songs reach DSPs.',
        services: [
            { id: 'distrokid', name: 'DistroKid', description: 'Independent distribution.', permissions: ['Export Metadata', 'Upload Release', 'Check Status', 'Sync Analytics', 'Import Royalties'] },
            { id: 'tunecore', name: 'TuneCore', description: 'Independent distribution.', permissions: ['Export Metadata', 'Upload Release', 'Check Status', 'Sync Analytics', 'Import Royalties'] },
            { id: 'cdbaby', name: 'CD Baby', description: 'Independent distribution.', permissions: ['Export Metadata', 'Upload Release', 'Check Status', 'Sync Analytics', 'Import Royalties'] },
            { id: 'unitedmasters', name: 'UnitedMasters', description: 'Independent distribution.', permissions: ['Export Metadata', 'Upload Release', 'Sync Analytics'] },
            { id: 'symphonic', name: 'Symphonic', description: 'Distribution + services.', permissions: ['Export Metadata', 'Upload Release', 'Sync Analytics'] },
            { id: 'toolost', name: 'Too Lost', description: 'Modern distribution.', permissions: ['Export Metadata', 'Upload Release'] },
            { id: 'stem', name: 'Stem', description: 'Modern distribution + splits.', permissions: ['Export Metadata', 'Upload Release', 'Sync Analytics'] },
            { id: 'onerpm', name: 'ONErpm', description: 'Global distribution.', permissions: ['Export Metadata', 'Upload Release', 'Sync Analytics'] },
            { id: 'orchard', name: 'The Orchard', description: 'Label services.', permissions: ['Export Metadata', 'Upload Release', 'Sync Analytics'] },
            { id: 'awal', name: 'AWAL', description: 'Sony label services.', permissions: ['Export Metadata', 'Upload Release', 'Sync Analytics'] },
        ],
    },
    {
        id: 'dsp',
        title: 'Streaming Platforms',
        subtitle: 'Where the audience lives.',
        services: [
            { id: 'spotify', name: 'Spotify', description: 'Streaming + Spotify for Artists.', permissions: ['Streaming Analytics', 'Playlist Data', 'Artist Profile', 'Catalog', 'Revenue', 'Audience'] },
            { id: 'apple', name: 'Apple Music', description: 'Apple Music + Music for Artists.', permissions: ['Streaming Analytics', 'Playlist Data', 'Artist Profile'] },
            { id: 'amazon', name: 'Amazon Music', description: 'Amazon Music.', permissions: ['Streaming Analytics', 'Artist Profile', 'Catalog'] },
            { id: 'youtube', name: 'YouTube Music', description: 'YouTube Music + YouTube Studio.', permissions: ['Streaming Analytics', 'Playlist Data', 'Artist Profile', 'Revenue'] },
            { id: 'tidal', name: 'TIDAL', description: 'TIDAL.', permissions: ['Streaming Analytics', 'Artist Profile'] },
            { id: 'pandora', name: 'Pandora', description: 'Pandora + AMP.', permissions: ['Streaming Analytics', 'Artist Profile'] },
            { id: 'deezer', name: 'Deezer', description: 'Deezer.', permissions: ['Streaming Analytics', 'Artist Profile'] },
            { id: 'qobuz', name: 'Qobuz', description: 'Hi-res streaming.', permissions: ['Streaming Analytics'] },
            { id: 'audiomack', name: 'Audiomack', description: 'Audiomack.', permissions: ['Streaming Analytics', 'Artist Profile'] },
            { id: 'boomplay', name: 'Boomplay', description: 'Boomplay (Africa focus).', permissions: ['Streaming Analytics', 'Artist Profile'] },
        ],
    },
    {
        id: 'pro',
        title: 'Performance Rights Organizations',
        subtitle: 'Global PROs.',
        services: [
            { id: 'ascap', name: 'ASCAP', description: 'US performance rights.', permissions: ['Register Works', 'Retrieve Catalog', 'Performance Data', 'Royalty Status', 'Writer Information'] },
            { id: 'bmi', name: 'BMI', description: 'US performance rights.', permissions: ['Register Works', 'Retrieve Catalog', 'Performance Data', 'Royalty Status'] },
            { id: 'sesac', name: 'SESAC', description: 'US performance rights.', permissions: ['Register Works', 'Retrieve Catalog', 'Performance Data'] },
            { id: 'socan', name: 'SOCAN', description: 'Canadian performance rights.', permissions: ['Register Works', 'Retrieve Catalog', 'Performance Data'] },
            { id: 'prs', name: 'PRS', description: 'UK performance rights.', permissions: ['Register Works', 'Retrieve Catalog', 'Performance Data'] },
            { id: 'apra', name: 'APRA AMCOS', description: 'AU/NZ performance rights.', permissions: ['Register Works', 'Retrieve Catalog', 'Performance Data'] },
            { id: 'sacem', name: 'SACEM', description: 'French performance rights.', permissions: ['Register Works', 'Retrieve Catalog', 'Performance Data'] },
            { id: 'gmr', name: 'GMR', description: 'Global Music Rights.', permissions: ['Register Works', 'Retrieve Catalog', 'Performance Data'] },
        ],
    },
    {
        id: 'publisher',
        title: 'Publishing',
        subtitle: 'Publisher admin systems.',
        services: [
            { id: 'songtrust', name: 'Songtrust', description: 'Publishing admin.', permissions: ['Publishing Catalog', 'Registration', 'Royalties', 'Statements', 'Administration'] },
            { id: 'sentric', name: 'Sentric', description: 'Publishing admin.', permissions: ['Publishing Catalog', 'Registration', 'Royalties', 'Statements'] },
            { id: 'kobalt', name: 'Kobalt', description: 'Publishing admin.', permissions: ['Publishing Catalog', 'Registration', 'Royalties'] },
            { id: 'downtown', name: 'Downtown', description: 'Downtown Music Publishing.', permissions: ['Publishing Catalog', 'Registration', 'Royalties'] },
            { id: 'sonypub', name: 'Sony Music Publishing', description: 'Major publisher.', permissions: ['Publishing Catalog', 'Royalties', 'Statements'] },
            { id: 'umpg', name: 'Universal Music Publishing', description: 'Major publisher.', permissions: ['Publishing Catalog', 'Royalties', 'Statements'] },
            { id: 'wcm', name: 'Warner Chappell', description: 'Major publisher.', permissions: ['Publishing Catalog', 'Royalties', 'Statements'] },
        ],
    },
    {
        id: 'rights',
        title: 'Rights & Metadata',
        subtitle: 'Mechanical & metadata registries.',
        services: [
            { id: 'mlc', name: 'The MLC', description: 'Mechanical Licensing Collective.', permissions: ['Metadata', 'Mechanical Rights', 'Registration Status'] },
            { id: 'soundexchange', name: 'SoundExchange', description: 'Neighboring rights.', permissions: ['Metadata', 'Neighboring Rights', 'Registration Status'] },
            { id: 'musicreports', name: 'Music Reports', description: 'Rights administration.', permissions: ['Metadata', 'Mechanical Rights'] },
            { id: 'isrc_reg', name: 'ISRC Registration', description: 'Global ISRC registry.', permissions: ['Metadata', 'Registration Status'] },
            { id: 'upc_serv', name: 'UPC Services', description: 'UPC/EAN registrar.', permissions: ['Metadata', 'Registration Status'] },
            { id: 'ddex', name: 'DDEX', description: 'Digital Data Exchange.', permissions: ['Metadata'] },
        ],
    },
    {
        id: 'finance',
        title: 'Business & Finance',
        subtitle: 'Money in, money out.',
        services: [
            { id: 'vaulta', name: 'Vaulta™', description: 'INHEIRA royalty rail.', permissions: ['Revenue', 'Royalties', 'Payments'], defaultConnected: true },
            { id: 'stripe', name: 'Stripe', description: 'Payments & payouts.', permissions: ['Revenue', 'Invoices', 'Royalties', 'Payments'] },
            { id: 'paypal', name: 'PayPal', description: 'Payments.', permissions: ['Payments', 'Payouts'] },
            { id: 'quickbooks', name: 'QuickBooks', description: 'Accounting.', permissions: ['Revenue', 'Expenses', 'Invoices', 'Tax Reporting'] },
            { id: 'xero', name: 'Xero', description: 'Accounting.', permissions: ['Revenue', 'Expenses', 'Invoices', 'Tax Reporting'] },
            { id: 'plaid', name: 'Plaid', description: 'Bank connections.', permissions: ['Balances', 'Transactions'] },
            { id: 'square', name: 'Square', description: 'Payments.', permissions: ['Payments', 'Payouts'] },
        ],
    },
    {
        id: 'comm',
        title: 'Communication',
        subtitle: 'Chat, meetings, notifications.',
        services: [
            { id: 'slack', name: 'Slack', description: 'Slack notifications.', permissions: ['Notifications', 'File Sharing', 'Collaboration'] },
            { id: 'teams', name: 'Microsoft Teams', description: 'Teams notifications.', permissions: ['Notifications', 'Meeting Scheduling', 'File Sharing'] },
            { id: 'zoom', name: 'Zoom', description: 'Meeting scheduling.', permissions: ['Meeting Scheduling'] },
            { id: 'meet', name: 'Google Meet', description: 'Meeting scheduling.', permissions: ['Meeting Scheduling'] },
            { id: 'discord', name: 'Discord', description: 'Community notifications.', permissions: ['Notifications', 'File Sharing'] },
            { id: 'whatsapp', name: 'WhatsApp', description: 'Session notifications.', permissions: ['Notifications'] },
        ],
    },
    {
        id: 'calendar',
        title: 'Calendar',
        subtitle: 'Writing sessions, deadlines, releases.',
        services: [
            { id: 'gcal', name: 'Google Calendar', description: 'Sync sessions and deadlines.', permissions: ['Writing Sessions', 'Deadlines', 'Release Dates', 'Meetings', 'Reminders'] },
            { id: 'outlook', name: 'Microsoft Outlook', description: 'Sync sessions & meetings.', permissions: ['Writing Sessions', 'Meetings', 'Reminders'] },
            { id: 'apple_cal', name: 'Apple Calendar', description: 'Sync via CalDAV.', permissions: ['Writing Sessions', 'Meetings', 'Reminders'] },
        ],
    },
    {
        id: 'ai',
        title: 'AI Providers',
        subtitle: 'Which engine powers your workspace.',
        services: [
            { id: 'openai', name: 'OpenAI', description: 'GPT-5.2 / GPT-4o family.', permissions: ['Chat', 'Analysis'] },
            { id: 'anthropic', name: 'Anthropic', description: 'Claude Sonnet 4.5 (default).', permissions: ['Chat', 'Analysis'], defaultConnected: true, verified: true },
            { id: 'gemini', name: 'Google Gemini', description: 'Gemini 3 family.', permissions: ['Chat', 'Analysis'] },
            { id: 'perplexity', name: 'Perplexity', description: 'Research + citations.', permissions: ['Research', 'Chat'] },
            { id: 'custom', name: 'Custom Model', description: 'Bring your own model endpoint.', permissions: ['Chat', 'Analysis'] },
        ],
    },
];

export function findService(id) {
    for (const cat of CATEGORIES) {
        const s = cat.services.find((x) => x.id === id);
        if (s) return { ...s, category: cat.id };
    }
    return null;
}

export function totalServices() {
    return CATEGORIES.reduce((a, c) => a + c.services.length, 0);
}
