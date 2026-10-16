"""
ComplyNext - Live Circular Change Monitor.

Kaam: RBI sources ko dobara scrape karke dekho content badla ya nahi.
Har source ke chunks ka SHA-256 hash SourceSnapshot me stored hai;
naya hash != purana hash -> ChangeAlert row banao.

Yeh sirf DETECT karta hai - DB ke chunks overwrite nahi karta.
Overwrite existing POST /api/circulars/scrape karta hai, user ke control me,
taaki monitor kabhi bina bole corpus na badal de.
"""

import hashlib
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from src.db.models import SourceSnapshot, ChangeAlert
from src.scraper.rbi_scraper import SOURCES, fetch_circular_text, chunk_text


def _content_hash(chunks: list[str]) -> str:
    """Chunks ke clean text ka stable SHA-256 (order preserved)."""
    joined = "\n".join(c.strip() for c in chunks)
    return hashlib.sha256(joined.encode("utf-8")).hexdigest()


def check_for_updates(db: Session) -> list[dict]:
    """
    Har configured RBI source ko scrape karo, hash compare karo.
    Returns: naye alerts ki list (khaali = koi change nahi).
    Pehli run pe sirf baseline snapshot banta hai, alert nahi banta.
    """
    new_alerts: list[dict] = []

    for source_name, url in SOURCES.items():
        try:
            text = fetch_circular_text(url)
            chunks = chunk_text(text)
        except Exception as e:
            print(f"[MONITOR] {source_name}: fetch failed ({e}) - skipping")
            continue

        new_hash = _content_hash(chunks)
        snapshot = (
            db.query(SourceSnapshot)
            .filter(SourceSnapshot.source_name == source_name)
            .first()
        )

        if snapshot is None:
            # Pehli baar: baseline banao, alert mat banao
            db.add(
                SourceSnapshot(
                    source_name=source_name,
                    source_url=url,
                    content_hash=new_hash,
                    chunk_count=len(chunks),
                )
            )
            print(f"[MONITOR] {source_name}: baseline snapshot created ({len(chunks)} chunks)")
        elif snapshot.content_hash != new_hash:
            summary = f"Content changed: {snapshot.chunk_count} -> {len(chunks)} chunks"
            db.add(ChangeAlert(source_name=source_name, source_url=url, summary=summary))
            snapshot.content_hash = new_hash
            snapshot.chunk_count = len(chunks)
            snapshot.checked_at = datetime.now(timezone.utc)
            new_alerts.append({"source_name": source_name, "summary": summary})
            print(f"[MONITOR] {source_name}: CHANGE DETECTED - {summary}")
        else:
            snapshot.checked_at = datetime.now(timezone.utc)
            print(f"[MONITOR] {source_name}: no change")

    db.commit()
    return new_alerts
