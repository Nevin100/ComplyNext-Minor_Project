"""
ComplyNext - RBI Circular Scraper (ingestion layer).

Design decision: using plain `requests` + BeautifulSoup instead of a
headless browser (Playwright), because RBI's notification pages are
server-rendered HTML - no JavaScript rendering needed for the text content.
This keeps the ingestion pipeline lightweight and fast.
"""

import requests
from bs4 import BeautifulSoup
from src.db.database import SessionLocal
from src.db.models import Circular
from datetime import datetime, timezone   # add this import at the top of the file
import re

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; ComplyNextBot/1.0)"}

# Real RBI circulars, scoped to the categories mentioned in the proposal
# (KYC and NPA/asset classification). Each entry is a human-readable name
# mapped to the actual RBI notification URL.
SOURCES = {
    "IRACP_MASTER_CIRCULAR": "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12472&Mode=0",
    "KYC_MASTER_DIRECTION": "https://rbi.org.in/Scripts/NotificationUser.aspx?Id=11566&Mode=0",
}

def fetch_circular_text(url: str) -> str:
    """
    Downloads one circular page and extracts its readable text.

    Design note: RBI's page structure varies across notification pages,
    so instead of guessing a specific div id (which was pulling in the
    entire navigation menu as fallback), we extract ALL text and then
    trim everything before the circular's reference number - every RBI
    circular body starts with a reference like "RBI/2023-24/06", which
    reliably marks where the navigation/menu junk ends and the actual
    circular content begins.
    """
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    full_text = soup.get_text(separator="\n", strip=True)

    # Look for the RBI reference number pattern (e.g. "RBI/2023-24/06")
    # which marks the start of actual circular content.
    match = re.search(r"RBI/\d{4}-\d{2,4}/\d+", full_text)

    if match:
        return full_text[match.start():]
    else:
        # Fallback: couldn't find the marker, return full text with a
        # warning so we know this page needs manual inspection later.
        print(f"  [WARNING] Could not find RBI reference marker for {url} - using full page text (may include navigation clutter)")
        return full_text

def chunk_text(text: str, chunk_size: int = 300) -> list[str]:
    """
    Splits circular text into word-based chunks.
    Chunking (instead of embedding the whole document) is what will later
    let the RAG pipeline retrieve just the relevant paragraph for a query,
    instead of the entire circular.
    """
    words = text.split()
    return [
        " ".join(words[i:i + chunk_size])
        for i in range(0, len(words), chunk_size)
    ]

def ingest_all_sources() -> dict[str, list[str]]:
    """
    Runs the full ingestion step across all configured sources, WITHOUT
    saving anything - useful for quick testing/debugging of the scraper
    itself, independent of the database.
    Returns a dict of {source_name: [chunks]}.
    """
    ingested = {}
    for name, url in SOURCES.items():
        try:
            text = fetch_circular_text(url)
            chunks = chunk_text(text)
            ingested[name] = chunks
            print(f"[OK] {name}: {len(text)} chars -> {len(chunks)} chunks")
        except Exception as e:
            print(f"[FAILED] {name}: {e}")
    return ingested

def save_chunks_to_db(source_name: str, url: str, chunks: list[str]) -> None:
    """
    Persists chunks for one circular into the `circulars` table.
    Deletes any existing chunks for this source first, so re-running
    the scraper doesn't create duplicate rows - this keeps the table
    always reflecting the LATEST scrape of each circular.
    """
    db = SessionLocal()
    try:
        # Remove old chunks for this source before inserting fresh ones.
        db.query(Circular).filter(Circular.source_name == source_name).delete()
        now = datetime.now(timezone.utc)
        
        new_rows = [
            Circular(
                source_name=source_name,
                source_url=url,
                chunk_index=i,
                chunk_text=chunk,
                scraped_at=now,
            )
            for i, chunk in enumerate(chunks)
        ]
        db.add_all(new_rows)
        db.commit()
        print(f"  -> saved {len(new_rows)} chunks to DB for {source_name}")
    finally:
        db.close()

def ingest_and_persist_all_sources() -> None:
    """
    Full pipeline: scrape each source, chunk it, then persist to DB.
    This is the function that should actually be run/scheduled -
    ingest_all_sources() alone only prints, it doesn't save anything.
    """
    for name, url in SOURCES.items():
        try:
            text = fetch_circular_text(url)
            chunks = chunk_text(text)
            print(f"[OK] {name}: {len(text)} chars -> {len(chunks)} chunks")
            save_chunks_to_db(name, url, chunks)
        except Exception as e:
            print(f"[FAILED] {name}: {e}")

# if the file is runned direvtly -> call fn ingest_and_persist_all_sources
if __name__ == "__main__":
    ingest_and_persist_all_sources()