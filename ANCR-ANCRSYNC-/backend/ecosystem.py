"""Ecosystem integration layer for ANCRLaunch™.

ANCRLaunch does NOT duplicate ecosystem data. It consumes verified records
from ANCRID™, ANCRA™, ANCRLAB™, ANCRSync™, COHEIR™, INHEIRA™, Vaulta™,
ANCRMEDIA™, and ANCRD™.

Each ecosystem service is exposed here as an async provider interface.
For demonstration, providers return seeded data from Mongo collections
prefixed with the ecosystem name (e.g. ancrid_users, ancrlab_projects).
To go live, swap `SeededProvider` for a `LiveHttpProvider` — the rest of
the application never changes.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional


class EcosystemProvider:
    """Base provider — swap the implementation for live HTTP calls later."""

    name: str = "ecosystem"

    def __init__(self, db):
        self.db = db

    async def _find_one(self, coll: str, ancrid: str) -> Optional[Dict[str, Any]]:
        return await self.db[coll].find_one({"ancrid": ancrid}, {"_id": 0})

    async def _find_many(self, coll: str, ancrid: str) -> List[Dict[str, Any]]:
        cur = self.db[coll].find({"ancrid": ancrid}, {"_id": 0})
        return await cur.to_list(500)


class ANCRIDProvider(EcosystemProvider):
    """Identity, verification, permissions."""
    name = "ANCRID"

    async def get_identity(self, ancrid: str) -> Optional[Dict[str, Any]]:
        return await self._find_one("ancrid_users", ancrid)


class ANCRAProvider(EcosystemProvider):
    """Academic transcripts, faculty endorsements."""
    name = "ANCRA"

    async def transcript(self, ancrid: str) -> Optional[Dict[str, Any]]:
        return await self._find_one("ancra_transcripts", ancrid)

    async def faculty_recommendations(self, ancrid: str) -> List[Dict[str, Any]]:
        return await self._find_many("ancra_recommendations", ancrid)


class ANCRLABProvider(EcosystemProvider):
    """Creative labs — projects, sessions, collaborations."""
    name = "ANCRLAB"

    async def projects(self, ancrid: str) -> List[Dict[str, Any]]:
        return await self._find_many("ancrlab_projects", ancrid)

    async def collaborations(self, ancrid: str) -> List[Dict[str, Any]]:
        return await self._find_many("ancrlab_collaborations", ancrid)


class ANCRSyncProvider(EcosystemProvider):
    """Sync/licensing opportunities and placements."""
    name = "ANCRSync"

    async def opportunities(self, ancrid: str) -> List[Dict[str, Any]]:
        return await self._find_many("ancrsync_opportunities", ancrid)


class COHEIRProvider(EcosystemProvider):
    """Industry endorsements, mentorship, professional reputation."""
    name = "COHEIR"

    async def industry_recommendations(self, ancrid: str) -> List[Dict[str, Any]]:
        return await self._find_many("coheir_recommendations", ancrid)

    async def reputation(self, ancrid: str) -> Optional[Dict[str, Any]]:
        return await self._find_one("coheir_reputation", ancrid)


class INHEIRAProvider(EcosystemProvider):
    """Publishing and rights administration."""
    name = "INHEIRA"

    async def publishing(self, ancrid: str) -> List[Dict[str, Any]]:
        return await self._find_many("inheira_publishing", ancrid)


class VaultaProvider(EcosystemProvider):
    """Creator Passport™ + verified credentials."""
    name = "Vaulta"

    async def creator_passport(self, ancrid: str) -> Optional[Dict[str, Any]]:
        return await self._find_one("vaulta_passports", ancrid)


class ANCRMEDIAProvider(EcosystemProvider):
    """Music, video, media releases."""
    name = "ANCRMEDIA"

    async def media(self, ancrid: str) -> List[Dict[str, Any]]:
        return await self._find_many("ancrmedia_releases", ancrid)


class ANCRDProvider(EcosystemProvider):
    """Booking, touring, travel readiness."""
    name = "ANCRD"

    async def booking_packet(self, ancrid: str) -> Optional[Dict[str, Any]]:
        return await self._find_one("ancrd_booking_packets", ancrid)

    async def travel_readiness(self, ancrid: str) -> Optional[Dict[str, Any]]:
        return await self._find_one("ancrd_travel", ancrid)


class Ecosystem:
    """Aggregated ecosystem consumer used by ANCRLaunch services."""

    def __init__(self, db):
        self.ancrid = ANCRIDProvider(db)
        self.ancra = ANCRAProvider(db)
        self.ancrlab = ANCRLABProvider(db)
        self.ancrsync = ANCRSyncProvider(db)
        self.coheir = COHEIRProvider(db)
        self.inheira = INHEIRAProvider(db)
        self.vaulta = VaultaProvider(db)
        self.ancrmedia = ANCRMEDIAProvider(db)
        self.ancrd = ANCRDProvider(db)

    async def assemble_portfolio(self, ancrid: str) -> Dict[str, Any]:
        """Portfolio is not stored — it is assembled from verified sources."""
        identity = await self.ancrid.get_identity(ancrid) or {}
        return {
            "ancrid": ancrid,
            "identity": identity,
            "biography": identity.get("biography", ""),
            "projects": await self.ancrlab.projects(ancrid),
            "collaborations": await self.ancrlab.collaborations(ancrid),
            "media": await self.ancrmedia.media(ancrid),
            "publishing": await self.inheira.publishing(ancrid),
            "creator_passport": await self.vaulta.creator_passport(ancrid),
            "booking_packet": await self.ancrd.booking_packet(ancrid),
            "travel_readiness": await self.ancrd.travel_readiness(ancrid),
            "reputation": await self.coheir.reputation(ancrid),
            "faculty_recommendations": await self.ancra.faculty_recommendations(ancrid),
            "industry_recommendations": await self.coheir.industry_recommendations(ancrid),
            "transcript": await self.ancra.transcript(ancrid),
            "sync_opportunities": await self.ancrsync.opportunities(ancrid),
        }
