"""
ComplyNext - RBI Circular Scraper (ingestion layer).

Design decision: using plain `requests` + BeautifulSoup instead of a
headless browser (Playwright), because RBI's notification pages are
server-rendered HTML - no JavaScript rendering needed for the text content.
This keeps the ingestion pipeline lightweight and fast.
"""

import requests
from bs4 import BeautifulSoup

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
    Raises an exception if the request fails (caller handles it).
    """
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()   # raises an error for 4xx/5xx responses

    soup = BeautifulSoup(resp.text, "html.parser")

    # RBI's older notification pages put the actual circular text inside
    # a div with id="content". This may need adjusting per page -
    # inspect the actual DOM in browser dev tools if this returns empty.
    content_div = soup.find("div", {"id": "content"}) or soup.find("body")

    return content_div.get_text(separator="\n", strip=True)


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
    Runs the full ingestion step across all configured sources.
    Returns a dict of {source_name: [chunks]} - this is what the
    embedding step (next increment) will consume.
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


if __name__ == "__main__":
    ingest_all_sources()