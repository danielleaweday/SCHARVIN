"""Rich seed data for ANCRMEDIA™ — Global Creative Network of CCDP."""
from datetime import datetime, timezone, timedelta
import random
import uuid

# Deterministic seed
random.seed(20260101)

# ---------- INSTITUTIONS ----------
INSTITUTIONS = [
    {"slug": "berklee", "name": "Berklee College of Music", "city": "Boston", "country": "USA", "flag": "🇺🇸", "coords": [42.3467, -71.0872], "founded": 1945, "brand_color": "#DA291C",
     "cover": "https://images.unsplash.com/photo-1519683384663-1a71084c5c33?auto=format&fit=crop&w=1600&q=80",
     "logo": "BC", "students_count": 8400, "tagline": "Where the world's musicians come to level up."},
    {"slug": "howard", "name": "Howard University", "city": "Washington DC", "country": "USA", "flag": "🇺🇸", "coords": [38.9223, -77.0195], "founded": 1867, "brand_color": "#003A63",
     "cover": "https://images.unsplash.com/photo-1541519481457-763224276691?auto=format&fit=crop&w=1600&q=80",
     "logo": "HU", "students_count": 12200, "tagline": "Truth and Service since 1867."},
    {"slug": "usc-thornton", "name": "USC Thornton School of Music", "city": "Los Angeles", "country": "USA", "flag": "🇺🇸", "coords": [34.0224, -118.2851], "founded": 1884, "brand_color": "#990000",
     "cover": "https://images.unsplash.com/photo-1499415479124-43c32433a620?auto=format&fit=crop&w=1600&q=80",
     "logo": "USC", "students_count": 1050, "tagline": "The creative capital of the West Coast."},
    {"slug": "nyu-tisch", "name": "NYU Tisch School of the Arts", "city": "New York", "country": "USA", "flag": "🇺🇸", "coords": [40.7295, -73.9965], "founded": 1965, "brand_color": "#57068C",
     "cover": "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1600&q=80",
     "logo": "NYU", "students_count": 5300, "tagline": "Storytelling in the city that never sleeps."},
    {"slug": "full-sail", "name": "Full Sail University", "city": "Winter Park", "country": "USA", "flag": "🇺🇸", "coords": [28.6011, -81.3096], "founded": 1979, "brand_color": "#B01E28",
     "cover": "https://images.unsplash.com/photo-1598519502497-f2b17d0be2f5?auto=format&fit=crop&w=1600&q=80",
     "logo": "FS", "students_count": 20000, "tagline": "Real world education for the entertainment industry."},
    {"slug": "belmont", "name": "Belmont University", "city": "Nashville", "country": "USA", "flag": "🇺🇸", "coords": [36.1330, -86.7955], "founded": 1890, "brand_color": "#CE1141",
     "cover": "https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?auto=format&fit=crop&w=1600&q=80",
     "logo": "BU", "students_count": 8800, "tagline": "Music City's home for artists."},
    {"slug": "juilliard", "name": "The Juilliard School", "city": "New York", "country": "USA", "flag": "🇺🇸", "coords": [40.7737, -73.9827], "founded": 1905, "brand_color": "#8A1538",
     "cover": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
     "logo": "JU", "students_count": 850, "tagline": "The world's leading performing arts conservatory."},
    {"slug": "trinity-laban", "name": "Trinity Laban Conservatoire", "city": "London", "country": "UK", "flag": "🇬🇧", "coords": [51.4826, -0.0077], "founded": 1872, "brand_color": "#000000",
     "cover": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80",
     "logo": "TL", "students_count": 1050, "tagline": "London's home for music and dance."},
    {"slug": "royal-college", "name": "Royal College of Music", "city": "London", "country": "UK", "flag": "🇬🇧", "coords": [51.4995, -0.1776], "founded": 1882, "brand_color": "#1E4783",
     "cover": "https://images.unsplash.com/photo-1477922076731-b90a6a5f4e70?auto=format&fit=crop&w=1600&q=80",
     "logo": "RCM", "students_count": 900, "tagline": "One of the world's great conservatoires."},
    {"slug": "toho-gakuen", "name": "Toho Gakuen School of Music", "city": "Tokyo", "country": "Japan", "flag": "🇯🇵", "coords": [35.7057, 139.5514], "founded": 1955, "brand_color": "#BC002D",
     "cover": "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1600&q=80",
     "logo": "TG", "students_count": 720, "tagline": "Tokyo's premier music conservatory."},
    {"slug": "sydney-con", "name": "Sydney Conservatorium of Music", "city": "Sydney", "country": "Australia", "flag": "🇦🇺", "coords": [-33.8642, 151.2135], "founded": 1915, "brand_color": "#E32118",
     "cover": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80",
     "logo": "SC", "students_count": 850, "tagline": "Australia's oldest music school."},
    {"slug": "sae-lagos", "name": "SAE Institute Lagos", "city": "Lagos", "country": "Nigeria", "flag": "🇳🇬", "coords": [6.4550, 3.4064], "founded": 1976, "brand_color": "#000000",
     "cover": "https://images.unsplash.com/photo-1610027716482-8a4c8dae1049?auto=format&fit=crop&w=1600&q=80",
     "logo": "SAE", "students_count": 620, "tagline": "West Africa's creative media college."},
    {"slug": "kaya-nairobi", "name": "Kaya College of Creative Arts", "city": "Nairobi", "country": "Kenya", "flag": "🇰🇪", "coords": [-1.2864, 36.8172], "founded": 2005, "brand_color": "#008751",
     "cover": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80",
     "logo": "KC", "students_count": 480, "tagline": "East Africa's contemporary arts academy."},
    {"slug": "edna-manley", "name": "Edna Manley College", "city": "Kingston", "country": "Jamaica", "flag": "🇯🇲", "coords": [18.0179, -76.8099], "founded": 1950, "brand_color": "#009A44",
     "cover": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
     "logo": "EM", "students_count": 380, "tagline": "The Caribbean's home for visual and performing arts."},
    {"slug": "sao-paulo-con", "name": "São Paulo State Conservatory", "city": "São Paulo", "country": "Brazil", "flag": "🇧🇷", "coords": [-23.5505, -46.6333], "founded": 1909, "brand_color": "#009C3B",
     "cover": "https://images.unsplash.com/photo-1518803194621-27188ba362c9?auto=format&fit=crop&w=1600&q=80",
     "logo": "SPC", "students_count": 1200, "tagline": "Brazil's premier public music school."},
    {"slug": "humber", "name": "Humber College Music", "city": "Toronto", "country": "Canada", "flag": "🇨🇦", "coords": [43.7292, -79.6070], "founded": 1967, "brand_color": "#003C71",
     "cover": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=80",
     "logo": "HC", "students_count": 33000, "tagline": "Canada's polytechnic for contemporary arts."},
]

# ---------- CREATOR NAMES (by school region) ----------
CREATOR_POOLS = {
    "USA": [("Maya","Okafor"),("Noah","Bennett"),("Ava","Rodriguez"),("Ethan","Kim"),("Zoe","Washington"),("Liam","Foster"),("Isla","Nguyen"),("Jaden","Carter"),("Sofia","Reyes"),("Amir","Johnson"),("Camille","Brooks"),("Devon","Hayes"),("Rae","Sinclair"),("Marcus","Ellis"),("Priya","Shah"),("Kai","Anderson"),("Simone","Baker"),("Tobias","Wu"),("Nia","Coleman"),("Julian","Ortega")],
    "UK": [("Zara","Adebayo"),("Ollie","Whitfield"),("Nia","Bennett"),("Freddie","Sinclair"),("Aisha","Rahman"),("Theo","Barnes"),("Poppy","Grant"),("Rufus","Hollingworth")],
    "Japan": [("Kenji","Aoki"),("Yuki","Tanaka"),("Rin","Nakamura"),("Sora","Fujita"),("Aiko","Matsuda"),("Haruto","Sato")],
    "Australia": [("Hunter","Walsh"),("Milla","Chen"),("Jax","O'Connor"),("Ivy","Sullivan")],
    "Nigeria": [("Chidera","Eze"),("Adaeze","Okonkwo"),("Tunde","Balogun"),("Ifeoma","Nwosu"),("Femi","Adeyemi"),("Bola","Adegoke")],
    "Kenya": [("Wanjiru","Kamau"),("Otieno","Odhiambo"),("Amani","Mwangi"),("Zawadi","Njoroge")],
    "Jamaica": [("Kymani","Brown"),("Shanice","Campbell"),("Rohan","Palmer"),("Tamika","Grant")],
    "Brazil": [("Luca","Ferreira"),("Isabela","Costa"),("Rafael","Souza"),("Beatriz","Almeida"),("Gabriel","Oliveira")],
    "Canada": [("Emmett","Tremblay"),("Nova","Beaulieu"),("Kai","Mackenzie"),("Elise","Lavoie")],
}

DISCIPLINES = ["Songwriter", "Producer", "Vocalist", "Guitarist", "Drummer", "Filmmaker", "Podcaster", "DJ", "Beatmaker", "Composer", "Cinematographer", "Multi-Instrumentalist"]
GENRES = ["Hip-Hop", "R&B", "Pop", "Afrobeats", "Jazz", "Neo-Soul", "Electronic", "Alt-Rock", "Reggae", "Bossa Nova", "Ambient", "Lo-Fi", "House", "Drum & Bass", "Folk", "Classical Contemporary"]
COHORTS = ["2024", "2025", "2026", "2027"]

AVATAR_SEEDS = [
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1502378735452-bc7d86632805?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1546456073-92b9f0a8d413?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
]

COVER_ART_POOL = [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1508973371-45cf3e7c9e0f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1483000805330-4eaf0e0742b7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520869562399-e772f042f422?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1470019693664-1d202d2c0907?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1487537023671-8dce1a785863?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516981879613-9f5da904015f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1499415479124-43c32433a620?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1461784121038-f088ca1e7714?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1462965326201-d02e4f455804?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571974599782-87624638275e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1445375011782-2384686778a0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541689221361-ad95003448dc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80",
]

VIDEO_THUMBS = [
    "https://images.unsplash.com/photo-1598935888738-cd2dfe1c5f79?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1621993646147-8cde7b9cc031?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1626197031507-c17099753214?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1481886756534-97af88ccb438?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1489599162946-648f5ac10ebe?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1571974599782-87624638275e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
]

# Real royalty-free audio (SoundHelix)
AUDIO_POOL = [f"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{i}.mp3" for i in range(1, 17)]

# Real royalty-free videos (Google Sample bucket)
VIDEO_POOL = [
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 596),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 653),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 15),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", 15),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", 60),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", 15),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", 15),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", 888),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", 734),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", 594),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4", 60),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", 47),
    ("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4", 60),
]

ALBUM_TITLES = [
    "Obsidian Dreams", "Neon Vespers", "Late Night Codeine", "Golden Hour", "Kingston Sessions",
    "Tokyo After Dark", "Cathedral of Sound", "Sao Paulo Nocturne", "Winter Grammar", "Sunfire",
    "The Lagos Tapes", "Blue Static", "Cabin Session", "Hymns for the Restless", "Waves & Wires",
    "Empty Rooms", "Slow Cinema", "Mirror Runway", "The Long Way Home", "Basement Church",
    "Silvertongue", "Northern Lights EP", "Manhattan Mornings", "Analog Ghost", "Wildflower Radio",
    "Hollow Bones", "Paper Airplanes", "Halcyon", "Static & Bloom", "Departures",
    "Living Room Sessions", "Highwire", "Undertones", "The Kingston Broadcast", "Concrete Sunlight",
    "Fade to Copper", "Amaranth", "Ivory Tower Blues", "Skyline Reverie", "Slow Bloom",
]

TRACK_TITLES = [
    "Lantern", "Undercurrent", "Slow Draft", "Fugitive", "Palindrome", "Cardinal Sin", "Almanac",
    "Silverbell", "Chapel Doors", "Cinnamon Sky", "Neon Ghost", "Half Light", "Longwave", "Nightingale",
    "Coyote", "Chariot", "Vagabond", "Loose Change", "Salt & Ash", "Constellation", "Tunnel Vision",
    "Kerosene", "The Understudy", "Amber Sun", "Foreign Rain", "Signal Flare", "Ivory Palms",
    "Northline", "Rambler", "Backroads", "Ocean Static", "Grand Piano", "Small Talk", "Postscript",
    "Hollow Season", "Papercuts", "Deadweight", "Cold Front", "Marble Halls", "Blueprint", "Wildfire",
    "Little Machine", "Passenger", "Riverbed", "The Unknown", "Cyanide Sky", "Waltz for Nobody",
    "Overture", "Aftertaste", "Slow Poison",
]

VIDEO_TITLES = [
    "Live at Berklee Hall B", "Masterclass: Harmony Beyond the Grid", "Behind the Scenes: Tokyo Sessions",
    "The Lagos Writing Camp Documentary", "Sundown at Sao Paulo Rooftop", "Podcast: The Art of Sampling",
    "Short Film — Cathedral Light", "Faculty Talk: Storytelling in Song", "Graduation Performance 2026",
    "Studio Session — Kingston to London", "The Composer's Room", "Podcast: Building a Sonic World",
    "Music Video — Slow Bloom", "Global Collab: Nairobi ↔ New York", "Capstone: A Portrait of Silence",
    "Industry Panel — The New Publishing Deal", "Open Mic Night — NYU Tisch", "Documentary: 24 Hours in Music City",
    "Music Video — Amber Sun", "Interview: The Producer's Journey", "Podcast: What Faculty Wish You Knew",
    "Live Concert — Trinity Laban Grand Hall", "Animation Reel — Class of 2026", "Behind The Song — Lantern",
    "Cinematography Reel — Semester Two",
]

PODCAST_TITLES = [
    "The CCDP Sessions", "Studio Chairs", "The Feedback Loop", "Faculty Office Hours",
    "Global Radio: London ↔ Lagos", "Cutting Room", "The Publishing Room",
    "First Take", "Late Passes", "Split Decisions",
]

CHALLENGE_TITLES = [
    ("Song of the Month — February", "song", "Submit an original song under 4 minutes. Global creator vote plus faculty jury."),
    ("Film Challenge — 24 Hour Doc", "film", "Shoot, edit, and deliver a documentary short in 24 hours."),
    ("Podcast Challenge — The Interview", "podcast", "Publish a 20-minute interview with a mentor."),
    ("Producer Challenge — Under 90 BPM", "producer", "Create an instrumental beat under 90 BPM using only three samples."),
    ("Writing Challenge — Verse & Chorus", "writing", "Co-write a chorus with a peer from a different school."),
    ("Animation Challenge — Loop of Ten", "animation", "10 seconds of looping animation to any CCDP track."),
]

CITY_COORDS_ADDL = [
    ("Nashville", "USA", 36.1627, -86.7816),
    ("Chicago", "USA", 41.8781, -87.6298),
    ("Miami", "USA", 25.7617, -80.1918),
    ("Nairobi", "Kenya", -1.2921, 36.8219),
    ("Johannesburg", "South Africa", -26.2041, 28.0473),
]

LYRICS_SAMPLE = """[Verse 1]
Slow lanterns down the avenue
Streetlights spelling out the truth
Every empty room I walked into
Was waiting on you

[Chorus]
Hold the line, hold the frame
Every city knows your name
We are the sound that stays the same
Underneath the flame

[Verse 2]
Cassette tape and a borrowed coat
Coffee cold in a paper note
Every letter that I never wrote
Was meant for the road"""


def build_seed():
    """Return dict of all seed collections."""
    now = datetime.now(timezone.utc)
    institutions = []
    for i, inst in enumerate(INSTITUTIONS):
        institutions.append({
            "id": inst["slug"],
            **inst,
            "created_at": (now - timedelta(days=800 - i * 10)).isoformat(),
        })

    creators = []
    used_avatars = 0
    # Guaranteed demo creators by institution (must exist for demo login)
    DEMO_FIRSTS = {"berklee": "Maya", "toho-gakuen": "Kenji", "trinity-laban": "Zara",
                    "sao-paulo-con": "Luca", "usc-thornton": "Noah"}
    for inst in INSTITUTIONS:
        country = inst["country"]
        pool = CREATOR_POOLS.get(country, CREATOR_POOLS["USA"])
        n = min(len(pool), 6 if country == "USA" else 4)
        # If this institution has a demo first name, force-include that creator
        demo_first = DEMO_FIRSTS.get(inst["slug"])
        forced = [p for p in pool if demo_first and p[0] == demo_first]
        remaining_pool = [p for p in pool if not (demo_first and p[0] == demo_first)]
        rest_count = max(0, n - len(forced))
        chosen = forced + (random.sample(remaining_pool, rest_count) if len(remaining_pool) >= rest_count else remaining_pool[:rest_count])
        for (first, last) in chosen:
            disc = random.choice(DISCIPLINES)
            genre_list = random.sample(GENRES, 3)
            avatar = AVATAR_SEEDS[used_avatars % len(AVATAR_SEEDS)]
            used_avatars += 1
            handle = f"{first.lower()}{last.lower()}.{inst['slug']}".replace("'", "")
            email = f"{first.lower()}@ancrmedia.com" if first in ("Maya", "Kenji", "Zara", "Luca", "Noah") else f"{handle}@ancrmedia.demo"
            creators.append({
                "id": f"creator-{handle}",
                "handle": handle,
                "name": f"{first} {last}",
                "email": email,
                "avatar": avatar,
                "cover": random.choice(COVER_ART_POOL),
                "institution_id": inst["slug"],
                "institution_name": inst["name"],
                "country": country,
                "city": inst["city"],
                "flag": inst["flag"],
                "coords": inst["coords"],
                "discipline": disc,
                "genres": genre_list,
                "cohort": random.choice(COHORTS),
                "role": "student",
                "verified": True,
                "bio": f"{disc} from {inst['city']}. Currently at {inst['name']}. Working on {random.choice(['a debut album','a documentary short','a monthly podcast','a live series','a producer collective'])}.",
                "followers": random.randint(120, 42000),
                "following": random.randint(20, 800),
                "monthly_listeners": random.randint(500, 210000),
                "created_at": (now - timedelta(days=random.randint(30, 900))).isoformat(),
            })

    # Add a couple of faculty
    faculty_defs = [
        ("prof.hayes", "Amelia Hayes", "berklee", "Songwriting Faculty"),
        ("prof.iwata", "Ren Iwata", "toho-gakuen", "Composition Faculty"),
        ("prof.duval", "Andre Duval", "howard", "Production Faculty"),
    ]
    for handle, name, inst_slug, disc in faculty_defs:
        inst = next(i for i in INSTITUTIONS if i["slug"] == inst_slug)
        creators.append({
            "id": f"creator-{handle.replace('.','-')}",
            "handle": handle,
            "name": f"Prof. {name}",
            "email": f"{handle}@ancrmedia.com",
            "avatar": AVATAR_SEEDS[used_avatars % len(AVATAR_SEEDS)],
            "cover": random.choice(COVER_ART_POOL),
            "institution_id": inst["slug"],
            "institution_name": inst["name"],
            "country": inst["country"],
            "city": inst["city"],
            "flag": inst["flag"],
            "coords": inst["coords"],
            "discipline": disc,
            "genres": random.sample(GENRES, 3),
            "cohort": "Faculty",
            "role": "faculty",
            "verified": True,
            "bio": f"{disc} at {inst['name']}. Curating faculty picks and hosting weekly office hours across the CCDP.",
            "followers": random.randint(4000, 90000),
            "following": random.randint(50, 400),
            "monthly_listeners": random.randint(20000, 400000),
            "created_at": (now - timedelta(days=random.randint(400, 1500))).isoformat(),
        })
        used_avatars += 1

    # ---------- ALBUMS + TRACKS ----------
    albums = []
    tracks = []
    for idx, title in enumerate(ALBUM_TITLES):
        artist = creators[idx % len(creators)]
        cover = COVER_ART_POOL[idx % len(COVER_ART_POOL)]
        release = now - timedelta(days=random.randint(1, 400))
        album_id = f"album-{idx+1}"
        n_tracks = random.choice([3, 4, 5, 6, 8, 10])
        album_track_ids = []
        total_dur = 0
        for t in range(n_tracks):
            audio_url = AUDIO_POOL[(idx * 3 + t) % len(AUDIO_POOL)]
            duration = random.randint(140, 320)
            total_dur += duration
            t_title = TRACK_TITLES[(idx * 3 + t) % len(TRACK_TITLES)]
            track_id = f"track-{album_id}-{t+1}"
            tracks.append({
                "id": track_id,
                "album_id": album_id,
                "title": t_title,
                "artist_id": artist["id"],
                "artist_name": artist["name"],
                "artist_avatar": artist["avatar"],
                "institution_id": artist["institution_id"],
                "cover": cover,
                "audio_url": audio_url,
                "duration_seconds": duration,
                "isrc": f"ANCR{20260000 + idx*100 + t}",
                "producers": [creators[(idx + t + 3) % len(creators)]["name"]],
                "songwriters": [artist["name"], creators[(idx + t + 7) % len(creators)]["name"]],
                "publishing": "ANCRMEDIA Publishing / CCDP Rights",
                "splits": [{"role":"Artist","name":artist["name"],"pct":50},{"role":"Producer","name":creators[(idx+t+3)%len(creators)]["name"],"pct":30},{"role":"Songwriter","name":creators[(idx+t+7)%len(creators)]["name"],"pct":20}],
                "lyrics": LYRICS_SAMPLE if t == 0 else None,
                "genres": artist["genres"],
                "release_date": release.isoformat(),
                "streams": random.randint(4000, 2400000),
                "listeners": random.randint(1000, 900000),
                "countries_count": random.randint(6, 84),
                "schools_count": random.randint(2, 16),
            })
            album_track_ids.append(track_id)
        albums.append({
            "id": album_id,
            "title": title,
            "artist_id": artist["id"],
            "artist_name": artist["name"],
            "artist_avatar": artist["avatar"],
            "institution_id": artist["institution_id"],
            "institution_name": artist["institution_name"],
            "cover": cover,
            "release_date": release.isoformat(),
            "genres": artist["genres"],
            "kind": random.choice(["Album","EP","Single","Project","Instrumentals"]) if n_tracks > 1 else "Single",
            "track_count": n_tracks,
            "duration_seconds": total_dur,
            "track_ids": album_track_ids,
            "streams": sum(random.randint(20000, 200000) for _ in range(n_tracks)),
            "credits_note": "Recorded at Institution Studios · Mixed by CCDP Peers",
            "description": f"A {n_tracks}-track {random.choice(['collection','statement','journey','experiment'])} from {artist['name']} of {artist['institution_name']}.",
        })

    # ---------- VIDEOS ----------
    videos = []
    for idx, vtitle in enumerate(VIDEO_TITLES):
        artist = creators[(idx * 3) % len(creators)]
        thumb = VIDEO_THUMBS[idx % len(VIDEO_THUMBS)]
        url, dur = VIDEO_POOL[idx % len(VIDEO_POOL)]
        kind = random.choice(["Music Video","Live Performance","Masterclass","Podcast","Short Film","Documentary","Interview","Behind The Scenes","Capstone Project"])
        videos.append({
            "id": f"video-{idx+1}",
            "title": vtitle,
            "kind": kind,
            "artist_id": artist["id"],
            "artist_name": artist["name"],
            "artist_avatar": artist["avatar"],
            "institution_id": artist["institution_id"],
            "institution_name": artist["institution_name"],
            "thumbnail": thumb,
            "video_url": url,
            "duration_seconds": dur,
            "views": random.randint(2000, 1600000),
            "subscribers": random.randint(500, 90000),
            "watch_time_hours": random.randint(120, 42000),
            "release_date": (now - timedelta(days=random.randint(1, 300))).isoformat(),
            "description": f"{kind} by {artist['name']} — {artist['institution_name']}",
            "series": random.choice(["Masterclass Series","Studio Sessions","Faculty Voices","Global Collabs", None, None]),
            "is_live": False,
        })

    # ---------- PODCASTS (channels/series style) ----------
    podcasts = []
    for idx, ptitle in enumerate(PODCAST_TITLES):
        host = creators[(idx * 5) % len(creators)]
        podcasts.append({
            "id": f"podcast-{idx+1}",
            "title": ptitle,
            "host_id": host["id"],
            "host_name": host["name"],
            "cover": COVER_ART_POOL[(idx * 2) % len(COVER_ART_POOL)],
            "institution_id": host["institution_id"],
            "episodes": random.randint(6, 42),
            "subscribers": random.randint(1200, 55000),
            "latest_release": (now - timedelta(days=random.randint(1, 14))).isoformat(),
            "description": f"Hosted by {host['name']} from {host['institution_name']}. A CCDP conversation series.",
        })

    # ---------- LIVESTREAMS ----------
    livestreams = []
    live_titles = [
        ("Berklee Songwriting Session — LIVE","Live Writing Camp","berklee"),
        ("Tokyo Composition Studio — Open Session","Studio Session","toho-gakuen"),
        ("Lagos Producer Cypher","Producer Cypher","sae-lagos"),
        ("Trinity Laban Faculty Recital","Faculty Recital","trinity-laban"),
        ("Kingston Rooftop Concert","Concert","edna-manley"),
        ("USC Thornton Industry Panel","Industry Panel","usc-thornton"),
        ("NYU Tisch Graduation Live","Graduation","nyu-tisch"),
        ("Sydney Con Open Mic Night","Open Mic","sydney-con"),
    ]
    for idx, (lt, cat, ins_slug) in enumerate(live_titles):
        artist = next(c for c in creators if c["institution_id"] == ins_slug)
        inst = next(i for i in INSTITUTIONS if i["slug"] == ins_slug)
        starts = now + timedelta(hours=random.randint(-2, 96))
        livestreams.append({
            "id": f"live-{idx+1}",
            "title": lt,
            "category": cat,
            "host_id": artist["id"],
            "host_name": artist["name"],
            "institution_id": ins_slug,
            "institution_name": inst["name"],
            "thumbnail": VIDEO_THUMBS[idx % len(VIDEO_THUMBS)],
            "starts_at": starts.isoformat(),
            "duration_min": random.choice([45, 60, 90, 120]),
            "is_live_now": idx < 3,
            "viewers_now": random.randint(240, 8400) if idx < 3 else 0,
            "video_url": VIDEO_POOL[idx % len(VIDEO_POOL)][0],
            "country": inst["country"],
            "city": inst["city"],
        })

    # ---------- PLAYLISTS ----------
    playlist_defs = [
        ("Faculty Picks: February 2026", "Curated by ANCRMEDIA faculty across all CCDP schools.", "faculty"),
        ("New CCDP: Fresh Releases", "The freshest drops from CCDP creators this week.", "editorial"),
        ("Lo-Fi Study Hall", "For late nights in the practice room.", "mood"),
        ("Global Afrobeats", "From Lagos to Nairobi to Kingston.", "genre"),
        ("Neo-Soul After Dark", "Slow tempos. Big feelings.", "mood"),
        ("Producer Beat Tape", "Instrumentals from CCDP producers worldwide.", "genre"),
        ("Songwriter Sessions", "Voice-and-guitar writing camps.", "genre"),
        ("Graduation 2026", "The Class of '26 releases.", "editorial"),
        ("Berklee Rising", "Featured Berklee student releases.", "school"),
        ("NYU Tisch Storytellers", "Original scores by Tisch composers.", "school"),
        ("Trinity Laban Live", "Recent live recordings from London.", "school"),
        ("Fastest Growing", "Tracks catching fire this week.", "editorial"),
        ("Late Night Ambient", "Soft edges. Wide rooms.", "mood"),
        ("Writing Camp Highlights", "The rooms behind the record.", "editorial"),
        ("International Discoveries", "Outside the US, inside the network.", "editorial"),
    ]
    playlists = []
    for idx, (pt, pd, ptype) in enumerate(playlist_defs):
        chosen_tracks = random.sample([t["id"] for t in tracks], k=min(len(tracks), random.randint(10, 22)))
        curator = creators[(idx * 7) % len(creators)]
        playlists.append({
            "id": f"playlist-{idx+1}",
            "title": pt,
            "description": pd,
            "kind": ptype,
            "cover": COVER_ART_POOL[(idx * 3 + 1) % len(COVER_ART_POOL)],
            "track_ids": chosen_tracks,
            "curator_id": curator["id"],
            "curator_name": curator["name"] if ptype != "editorial" else "ANCRMEDIA Editorial",
            "followers": random.randint(1200, 82000),
            "updated_at": (now - timedelta(days=random.randint(0, 14))).isoformat(),
        })

    # ---------- CHALLENGES ----------
    challenges = []
    for idx, (ct, ckind, cdesc) in enumerate(CHALLENGE_TITLES):
        deadline = now + timedelta(days=random.randint(6, 24))
        challenges.append({
            "id": f"challenge-{idx+1}",
            "title": ct,
            "kind": ckind,
            "description": cdesc,
            "cover": VIDEO_THUMBS[(idx + 4) % len(VIDEO_THUMBS)],
            "deadline": deadline.isoformat(),
            "submissions": random.randint(180, 2400),
            "prize": random.choice(["Featured on ANCRMEDIA Home","$5,000 grant","Placement in Faculty Playlist","Mentorship with Artist in Residence","Studio time at partner facility"]),
            "sponsor": random.choice(["ANCRMEDIA Editorial","INHEIRA Publishing","ANCRLAB","COHEIR Faculty Board","Vaulta"]),
        })

    # ---------- EVENTS ----------
    events = []
    ev_defs = [
        ("Berklee Writing Camp Live", "Live Writing Camp", "berklee"),
        ("Tokyo Season Concert", "Concert", "toho-gakuen"),
        ("Howard Homecoming Showcase", "Showcase", "howard"),
        ("Belmont Songwriter Roundtable", "Roundtable", "belmont"),
        ("São Paulo Bossa Sessions", "Live Session", "sao-paulo-con"),
        ("Lagos Beat Battle Finals", "Competition", "sae-lagos"),
        ("Kingston Reggae Symposium", "Symposium", "edna-manley"),
        ("Full Sail Producer Summit", "Summit", "full-sail"),
    ]
    for idx, (et, ek, ins) in enumerate(ev_defs):
        inst = next(i for i in INSTITUTIONS if i["slug"] == ins)
        events.append({
            "id": f"event-{idx+1}",
            "title": et,
            "kind": ek,
            "institution_id": ins,
            "institution_name": inst["name"],
            "city": inst["city"],
            "country": inst["country"],
            "cover": VIDEO_THUMBS[(idx + 2) % len(VIDEO_THUMBS)],
            "starts_at": (now + timedelta(days=random.randint(2, 60))).isoformat(),
            "rsvp_count": random.randint(240, 3800),
            "description": f"{ek} hosted at {inst['name']}. Open to the global CCDP community via ANCRMEDIA Live.",
        })

    return {
        "institutions": institutions,
        "creators": creators,
        "albums": albums,
        "tracks": tracks,
        "videos": videos,
        "podcasts": podcasts,
        "livestreams": livestreams,
        "playlists": playlists,
        "challenges": challenges,
        "events": events,
    }
