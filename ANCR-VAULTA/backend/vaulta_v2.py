"""Grant & Funding Center + Tour Profitability & Project P&L seed data."""
import uuid
import random
from datetime import datetime, timezone, timedelta

FUNDING_OPPORTUNITIES_FULL = [
    # (name, org, category, subcategory, amount, deadline, eligibility, location, difficulty, hours, ai_match, docs, previous, notes, funding_type)
    ("NEA Grants for Arts Projects", "National Endowment for the Arts", "National grants", "Federal", 50000, "2026-03-14", "Nonprofit 501(c)(3) or partnership with fiscal sponsor", "United States", 82, 40, 94, ["Proof of 501(c)(3)", "Project narrative", "Budget", "Work samples"], ["Alvin Ailey", "Kronos Quartet", "Sundance Institute"], "Highly competitive but ideal fit for your catalog.", "Grant"),
    ("NYSCA Individual Artist Grant", "New York State Council on the Arts", "State grants", "Individual", 25000, "2026-04-15", "NY-based, min 2 years professional", "New York, USA", 68, 24, 91, ["Artist statement", "Work samples", "Budget", "Resume"], ["Kai Marlow (2024)", "Simone Ali (2023)"], "You've won this before. Repeat applicants often succeed.", "Grant"),
    ("California Creative Corps", "California Arts Council", "State grants", "Individual", 40000, "2026-05-20", "CA resident, community engagement focus", "California, USA", 74, 30, 87, ["Community proposal", "Impact plan", "Budget"], ["Kamasi Washington", "Kelela"], "Strong community narrative required.", "Grant"),
    ("Sundance Composer Fellowship", "Sundance Institute", "Fellowships", "Music", 40000, "2026-06-30", "Emerging composer, 1-3 features credited", "United States", 88, 60, 89, ["Reel", "Recommendations x3", "Statement of purpose", "Score sample"], ["Nick Cave", "Nicholas Britell"], "Two of your recent syncs would strengthen the reel.", "Fellowship"),
    ("MacDowell Fellowship", "MacDowell", "Creative residencies", "Composition", 22000, "2026-09-15", "Working artist, project-based", "New Hampshire, USA", 78, 20, 86, ["Work samples", "Statement", "References"], ["Leonard Bernstein", "Meredith Monk"], "6-week residency. Prestigious.", "Residency"),
    ("Yaddo Residency", "Yaddo", "Creative residencies", "Music", 8500, "2026-08-01", "Working artist, application review", "Saratoga Springs, NY", 72, 18, 84, ["Work samples", "Project proposal", "References"], ["Aaron Copland", "Philip Glass"], "Excellent for album writing.", "Residency"),
    ("Ableton Loop Artist Grant", "Ableton", "Industry funding", "Music Production", 15000, "2026-04-30", "Ableton Live users, portfolio", "Global", 62, 12, 88, ["Portfolio", "Project idea", "Budget"], ["Holly Herndon", "Arca"], "Great fit — you're a heavy Ableton user.", "Grant"),
    ("SoundBetter Producer Grant", "SoundBetter", "Industry funding", "Producer", 12000, "2026-05-15", "Producers with 5+ credits", "Global", 55, 8, 82, ["Portfolio", "Project pitch"], ["Illangelo", "Jack Antonoff"], "Rolling window — apply any time.", "Grant"),
    ("Amazon Music Breakthrough Prize", "Amazon Music", "Competitions", "Emerging Artist", 30000, "2026-05-20", "Emerging artist, min. 100K streams", "Global", 76, 15, 79, ["EPK", "Streaming links", "Bio"], ["Muni Long", "Coco Jones"], "Winner gets label services + distribution.", "Competition"),
    ("Kickstarter Music Vertical", "Kickstarter", "Crowdfunding", "Fan-Funded", 60000, "Rolling", "Any creator", "Global", 45, 60, 92, ["Video pitch", "Reward tiers", "Budget"], ["Amanda Palmer ($1.2M)", "TWRP ($800K)"], "You have the audience for this. High confidence.", "Crowdfunding"),
    ("ASCAP Foundation Grant", "ASCAP Foundation", "Music industry funding", "Songwriter", 15000, "2026-02-28", "ASCAP-affiliated songwriter", "United States", 58, 12, 93, ["Songs (5)", "Statement", "Bio"], ["Nia Whitfield", "Ari Kite"], "You're ASCAP-affiliated — natural fit.", "Grant"),
    ("BMI Foundation John Lennon Award", "BMI Foundation", "Music industry funding", "Songwriter", 20000, "2026-03-31", "BMI-affiliated, 15-24 years old", "United States", 66, 10, 71, ["Original composition", "Bio"], ["Yebba", "Amber Mark"], "Age eligibility check — verify.", "Award"),
    ("Grammy Museum Innovation Grant", "Grammy Museum Foundation", "Music industry funding", "Music Tech", 25000, "2026-07-14", "Music + tech project", "Global", 71, 25, 80, ["Prototype", "Business plan", "Team"], ["Splice", "Landr"], "Angle: Vualta as a creator finance platform.", "Grant"),
    ("Fulbright Creative Arts Fellowship", "US Department of State", "International grants", "International", 55000, "2026-10-15", "US citizen, host country partner", "International", 87, 80, 76, ["Project proposal", "Host letter", "References"], ["Colson Whitehead"], "9-month international project.", "Fellowship"),
    ("PRS Foundation UK Grants", "PRS Foundation", "International grants", "UK/EU", 28000, "2026-06-01", "PRS-affiliated or UK-based", "United Kingdom", 64, 20, 68, ["Work samples", "Budget", "Timeline"], ["FKA twigs", "Little Simz"], "Requires UK partner.", "Grant"),
    ("Canada Council for the Arts", "Canada Council", "International grants", "Canada", 32000, "2026-08-20", "Canadian citizen or PR", "Canada", 62, 22, 55, ["Portfolio", "Project", "Budget"], ["Arcade Fire", "Feist"], "Requires Canadian citizenship.", "Grant"),
    ("Y Combinator W26 (Creator OS)", "Y Combinator", "Accelerator programs", "Tech", 500000, "2026-03-15", "Tech startup, creator-focused", "Global", 96, 100, 68, ["Application", "Founder video", "Traction"], ["Reddit", "Airbnb", "Stripe"], "Long shot — pitch Vualta itself.", "Accelerator"),
    ("Techstars Music Accelerator", "Techstars", "Accelerator programs", "Music Tech", 120000, "2026-04-30", "Music tech startup", "Global", 91, 60, 74, ["Deck", "Traction", "Team"], ["Amper Music", "Chartmetric"], "3-month intensive + $120K.", "Accelerator"),
    ("Sequoia Capital — Arc", "Sequoia Capital", "Venture funding", "Seed", 1000000, "Rolling", "Ambitious founders", "Global", 98, 200, 42, ["Deck", "Data room", "Team"], ["Zoom", "Stripe", "Nubank"], "For if Vualta becomes a company.", "Venture"),
    ("Angel List Rolling Fund", "AngelList", "Angel investors", "Seed", 250000, "Rolling", "Any startup", "Global", 82, 40, 62, ["Deck", "Financials", "Cap table"], ["Various"], "Rolling window.", "Angel"),
    ("Knight Foundation Arts Grant", "John S. and James L. Knight Foundation", "Foundation funding", "Community Arts", 75000, "2026-05-30", "Community-focused arts project", "Select US cities", 79, 45, 83, ["Project narrative", "Community partners", "Budget"], ["Sundance", "PBS"], "Community angle is critical.", "Grant"),
    ("Ford Foundation JustFilms", "Ford Foundation", "Foundation funding", "Film/Media", 100000, "2026-11-01", "Film/media on justice", "Global", 90, 80, 78, ["Treatment", "Team", "Budget", "Distribution"], ["Ava DuVernay", "Raoul Peck"], "Justice-oriented storytelling.", "Grant"),
    ("Mellon Foundation Arts & Humanities", "Andrew W. Mellon Foundation", "Foundation funding", "Arts/Humanities", 200000, "2026-09-20", "Nonprofit or institutional partnership", "US", 88, 60, 71, ["Institutional partner", "Project", "Budget"], ["Multiple institutions"], "Requires 501(c)(3) partner.", "Grant"),
    ("Doris Duke Artist Award", "Doris Duke Charitable Foundation", "Foundation funding", "Jazz/Theatre/Dance", 275000, "By nomination", "Nominated artist", "US", 94, 0, 65, ["Nomination only"], ["Rhiannon Giddens", "Vijay Iyer"], "By nomination only — cultivate.", "Award"),
    ("The Recording Academy Grant", "Recording Academy", "Nonprofit funding", "Music Preservation", 20000, "2026-06-15", "Music research/preservation", "US", 68, 25, 80, ["Research proposal", "Team", "Budget"], ["Multiple archivists"], "Preservation of your work qualifies.", "Grant"),
    ("Berklee Popular Music Scholarship", "Berklee College of Music", "Scholarships", "Merit", 12000, "2026-05-01", "Enrolled or accepted student", "Boston, MA", 55, 6, 90, ["Application", "Portfolio", "Recommendations"], ["Multiple"], "ANCRA-aligned.", "Scholarship"),
    ("Full Sail University Scholarship", "Full Sail University", "Scholarships", "Merit", 8000, "2026-06-30", "Enrolled student", "Winter Park, FL", 42, 4, 76, ["FAFSA", "Application"], ["Multiple"], "Merit + need.", "Scholarship"),
    ("The Music Alliance Pitch Awards", "The Music Alliance", "Pitch opportunities", "Emerging", 50000, "2026-04-10", "Emerging artist/producer", "Global", 82, 20, 84, ["Pitch deck", "Live performance", "Bio"], ["Multiple"], "Live pitch to industry panel.", "Pitch"),
    ("MIDEM Pitch Session", "MIDEM", "Pitch opportunities", "International", 35000, "2026-03-01", "Music professionals", "Cannes, France", 75, 15, 72, ["Pitch", "EPK"], ["Multiple"], "Global music industry pitch.", "Pitch"),
    ("SXSW Music Emerging Talent", "SXSW", "Competitions", "Emerging", 25000, "2026-02-15", "Emerging artist", "Austin, TX", 78, 12, 88, ["Application", "Music", "Bio"], ["Billie Eilish", "Bruno Mars"], "Excellent industry showcase.", "Competition"),
]

# Sample applications (some in-progress, some submitted, some awarded, some rejected)
FUNDING_APPLICATIONS_SAMPLE = [
    # (opp_name, status, submitted_date, decision_date, amount_awarded, progress, notes)
    ("NYSCA Individual Artist Grant", "Awarded", "2024-04-10", "2024-07-15", 25000, 100, "Won! Funded 'The Overnight' album mixing."),
    ("ASCAP Foundation Grant", "Awarded", "2025-02-20", "2025-05-10", 15000, 100, "Awarded — used for songwriter session in LA."),
    ("Ableton Loop Artist Grant", "Submitted", "2026-01-14", None, None, 100, "Under review. Decision expected Feb 2026."),
    ("Sundance Composer Fellowship", "In Progress", None, None, None, 65, "Waiting on 3rd recommendation letter."),
    ("Kickstarter Music Vertical", "In Progress", None, None, None, 40, "Draft video pitch complete. Reward tiers next."),
    ("MacDowell Fellowship", "In Progress", None, None, None, 25, "Statement draft in review with mentor."),
    ("Grammy Museum Innovation Grant", "In Progress", None, None, None, 15, "Team assembly stage."),
    ("SXSW Music Emerging Talent", "Rejected", "2024-02-10", "2024-04-01", 0, 100, "Not selected. Will reapply."),
    ("Amazon Music Breakthrough Prize", "Rejected", "2024-05-15", "2024-08-20", 0, 100, "Feedback: increase streaming numbers."),
    ("Berklee Popular Music Scholarship", "Awarded", "2023-04-25", "2023-06-15", 12000, 100, "Merit scholarship — first year Berklee."),
    ("NEA Grants for Arts Projects", "In Progress", None, None, None, 30, "Fiscal sponsor secured. Narrative in draft."),
    ("California Creative Corps", "In Progress", None, None, None, 55, "Community proposal complete. Budget in review."),
]

PROJECT_MODELS = [
    # Tour: 'Obsidian Hours Tour — East Coast'
    {
        "name": "Obsidian Hours Tour — East Coast",
        "type": "Tour",
        "status": "Active",
        "start_date": "2026-04-08",
        "end_date": "2026-06-14",
        "location": "12 cities · East Coast USA",
        "shows": 18,
        "capacity_avg": 1400,
        "ticket_price_avg": 42,
        "revenue": {
            "Ticket Sales":     540000,
            "Performance Fees":  75000,
            "Merchandise":      148000,
            "VIP Packages":      92000,
            "Sponsorships":      65000,
            "Streaming Bump":    28000,
            "Licensing":         12000,
            "Royalties (tour-linked)": 8400,
        },
        "expenses": {
            "Flights":            42000,
            "Hotels":             68000,
            "Ground Transport":   38000,
            "Per Diem":           24800,
            "Payroll (band)":    120000,
            "Crew":               74000,
            "Equipment":          22000,
            "Backline Rental":    18000,
            "Venue Costs":        84000,
            "Insurance":           7200,
            "Marketing":          48000,
            "Production":         62000,
            "Taxes (est.)":       48000,
            "Contingency (7%)":   42000,
        },
        "milestones": [
            {"date": "2026-04-08", "city": "Boston · Roadrunner", "revenue": 58200, "cost": 34400, "status": "Confirmed"},
            {"date": "2026-04-12", "city": "New York · Terminal 5", "revenue": 82500, "cost": 46200, "status": "Confirmed"},
            {"date": "2026-04-19", "city": "Philadelphia · Franklin Music Hall", "revenue": 54200, "cost": 32800, "status": "Confirmed"},
            {"date": "2026-04-24", "city": "Washington DC · 9:30 Club", "revenue": 52100, "cost": 30400, "status": "Confirmed"},
            {"date": "2026-05-02", "city": "Atlanta · The Eastern", "revenue": 60800, "cost": 34700, "status": "Confirmed"},
            {"date": "2026-05-08", "city": "Nashville · Marathon Music", "revenue": 48600, "cost": 28900, "status": "Confirmed"},
            {"date": "2026-05-14", "city": "Charlotte · The Underground", "revenue": 42100, "cost": 26800, "status": "Hold"},
            {"date": "2026-05-20", "city": "Miami · Fillmore", "revenue": 66200, "cost": 39200, "status": "Confirmed"},
            {"date": "2026-05-30", "city": "Chicago · Riviera Theatre", "revenue": 72400, "cost": 42800, "status": "Confirmed"},
        ],
        "risks": [
            {"risk": "Radius clause conflict — Boston/Providence", "severity": "Medium", "mitigation": "Renegotiate radius or add Providence"},
            {"risk": "Merch margin under target (28% vs 34%)", "severity": "Low", "mitigation": "Add higher-margin vinyl bundles"},
            {"risk": "Insurance quote pending for large venues", "severity": "Medium", "mitigation": "Lock policy 4 weeks before tour start"},
        ],
        "notes": "Bloomberg-terminal financial view of the full tour. Numbers auto-sync from Vualta transactions when actualized.",
    },
    # Album: The Overnight
    {
        "name": "Album: 'The Overnight'",
        "type": "Album",
        "status": "Active",
        "start_date": "2025-11-01",
        "end_date": "2026-08-15",
        "location": "Electric Lady + Jungle City + Vault Studios",
        "shows": 0,
        "capacity_avg": 0,
        "ticket_price_avg": 0,
        "revenue": {
            "Streaming":         182000,
            "Publishing":         64000,
            "Sync":              124000,
            "Vinyl Sales":        58000,
            "Digital Sales":      22000,
            "Playlisting Bump":   14000,
        },
        "expenses": {
            "Studio Time":        68000,
            "Producer Fees":      42000,
            "Mixing":             18400,
            "Mastering":           8200,
            "Session Musicians":  22400,
            "Marketing":          38000,
            "PR & Publicist":     16000,
            "Distribution":        4200,
            "Vinyl Manufacturing":24000,
            "Video Content":      32000,
        },
        "milestones": [
            {"date": "2025-11-15", "city": "Recording begins", "revenue": 0, "cost": 24000, "status": "Complete"},
            {"date": "2026-01-30", "city": "Mixing session", "revenue": 0, "cost": 18400, "status": "Complete"},
            {"date": "2026-03-14", "city": "Album release", "revenue": 84000, "cost": 12000, "status": "Confirmed"},
            {"date": "2026-05-01", "city": "Vinyl drop", "revenue": 58000, "cost": 24000, "status": "Confirmed"},
        ],
        "risks": [
            {"risk": "Vinyl manufacturing lead time (16 weeks)", "severity": "High", "mitigation": "Lock order by 2026-01-15"},
            {"risk": "Sync clearance for 3 tracks pending", "severity": "Medium", "mitigation": "Backup versions ready"},
        ],
        "notes": "Album P&L including recording, marketing, and expected streaming/sync/vinyl revenue over 12 months.",
    },
    # Film Score
    {
        "name": "Film Score: 'Room 402' (A24)",
        "type": "Film",
        "status": "Active",
        "start_date": "2026-02-15",
        "end_date": "2026-06-30",
        "location": "Remote + Electric Lady",
        "shows": 0,
        "capacity_avg": 0,
        "ticket_price_avg": 0,
        "revenue": {
            "Composer Fee":       85000,
            "Publishing (sync)":  22000,
            "Soundtrack Sales":   18000,
            "Streaming Score":     8400,
        },
        "expenses": {
            "Orchestra Sessions": 24000,
            "Studio Time":         8200,
            "Assistant Composer":  9600,
            "Software Licenses":   1200,
            "Mixing":              4800,
        },
        "milestones": [
            {"date": "2026-02-15", "city": "Spotting session", "revenue": 0, "cost": 800, "status": "Complete"},
            {"date": "2026-04-01", "city": "Orchestra recording", "revenue": 0, "cost": 24000, "status": "Confirmed"},
            {"date": "2026-06-30", "city": "Final delivery", "revenue": 85000, "cost": 0, "status": "Confirmed"},
        ],
        "risks": [
            {"risk": "Delivery deadline tight (3 weeks post-lock)", "severity": "Medium", "mitigation": "Pre-compose main themes now"},
        ],
        "notes": "A24 film score commission with backend soundtrack participation.",
    },
    # Writing Camp
    {
        "name": "Writing Camp — Costa Rica",
        "type": "Writing Camp",
        "status": "Planned",
        "start_date": "2026-07-10",
        "end_date": "2026-07-24",
        "location": "Nosara, Costa Rica",
        "shows": 0,
        "capacity_avg": 0,
        "ticket_price_avg": 0,
        "revenue": {
            "Publisher Advance": 40000,
            "Publishing (est. cuts)": 60000,
            "Sync Placements":   32000,
        },
        "expenses": {
            "Flights (12 writers)":  9600,
            "Villa Rental":         22000,
            "Catering":              8400,
            "Studio Equipment":      4200,
            "Ground Transport":      1800,
            "Session Musicians":     6800,
            "Merch (souvenirs)":     1200,
        },
        "milestones": [
            {"date": "2026-07-10", "city": "Camp begins", "revenue": 40000, "cost": 22000, "status": "Confirmed"},
            {"date": "2026-07-24", "city": "Demos delivered", "revenue": 60000, "cost": 8400, "status": "Projected"},
        ],
        "risks": [
            {"risk": "Weather (rainy season) — outdoor sessions", "severity": "Low", "mitigation": "Indoor studio contingency"},
            {"risk": "Song delivery timeline overlap w/ tour", "severity": "Medium", "mitigation": "Buffer 3 weeks post-camp"},
        ],
        "notes": "Two-week writing camp with 12 songwriters. Publisher-backed with cuts to follow.",
    },
    # Festival Curation
    {
        "name": "Festival: 'Obsidian Nights' (Curated)",
        "type": "Festival",
        "status": "Planned",
        "start_date": "2026-09-04",
        "end_date": "2026-09-06",
        "location": "Brooklyn, NY",
        "shows": 1,
        "capacity_avg": 4500,
        "ticket_price_avg": 85,
        "revenue": {
            "Ticket Sales":     382500,
            "VIP Packages":     108000,
            "Sponsorships":     180000,
            "Merch":             48000,
            "F&B Commission":    28000,
        },
        "expenses": {
            "Talent (Artists)": 220000,
            "Production":        84000,
            "Venue":             68000,
            "Marketing":         52000,
            "Staffing":          32000,
            "Insurance":         12000,
            "Permits":            8400,
            "Security":          18000,
            "Sound & Lights":    24000,
        },
        "milestones": [
            {"date": "2026-06-01", "city": "Talent announced", "revenue": 0, "cost": 8000, "status": "Planned"},
            {"date": "2026-07-15", "city": "Tickets on sale", "revenue": 240000, "cost": 12000, "status": "Planned"},
            {"date": "2026-09-04", "city": "Day 1 · Festival", "revenue": 224000, "cost": 148000, "status": "Planned"},
            {"date": "2026-09-06", "city": "Day 3 · Festival", "revenue": 282500, "cost": 158400, "status": "Planned"},
        ],
        "risks": [
            {"risk": "Talent cancellations", "severity": "High", "mitigation": "Contract 2 backup headliners"},
            {"risk": "Weather (outdoor stage)", "severity": "Medium", "mitigation": "Tented main stage + insurance"},
        ],
        "notes": "Curated 3-day festival launching Sable Row's cultural imprint.",
    },
]


async def seed_grants_and_projects(db, owner_id: str):
    """Called from server startup after core seed to add grants + projects."""
    now = datetime.now(timezone.utc)

    # Grants: replace old funding_opportunities with the richer set
    existing = await db.grant_opportunities.count_documents({})
    if existing == 0:
        opps = []
        for (name, org, cat, sub, amount, deadline, elig, loc, diff, hrs,
             match, docs, prev, notes, ftype) in FUNDING_OPPORTUNITIES_FULL:
            opps.append({
                "id": str(uuid.uuid4()),
                "name": name, "organization": org,
                "category": cat, "subcategory": sub,
                "amount": amount, "deadline": deadline,
                "eligibility": elig, "location": loc,
                "difficulty_score": diff,
                "estimated_hours": hrs,
                "ai_match_score": match,
                "documents_required": docs,
                "previous_winners": prev,
                "notes": notes,
                "funding_type": ftype,
                "created_at": now.isoformat(),
            })
        await db.grant_opportunities.insert_many(opps)

    # Applications (per user)
    existing_apps = await db.grant_applications.count_documents({"owner_id": owner_id})
    if existing_apps == 0:
        apps = []
        for opp_name, status, submitted, decision, awarded, progress, notes in FUNDING_APPLICATIONS_SAMPLE:
            apps.append({
                "id": str(uuid.uuid4()),
                "owner_id": owner_id,
                "opportunity_name": opp_name,
                "status": status,
                "submitted_date": submitted,
                "decision_date": decision,
                "amount_awarded": awarded,
                "progress": progress,
                "notes": notes,
                "created_at": now.isoformat(),
            })
        await db.grant_applications.insert_many(apps)

    # Projects (P&L)
    existing_proj = await db.projects.count_documents({"owner_id": owner_id})
    if existing_proj == 0:
        projects = []
        for p in PROJECT_MODELS:
            proj = dict(p)
            proj["id"] = str(uuid.uuid4())
            proj["owner_id"] = owner_id
            proj["created_at"] = now.isoformat()
            projects.append(proj)
        await db.projects.insert_many(projects)
