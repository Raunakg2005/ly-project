"""
Phishing & Cyber-Safety Detection Module
=========================================
Layer 1 — Regex URL extraction from document text
Layer 2 — Local heuristic pattern matching (no API key needed)
Layer 3 — Google Safe Browsing API (optional, if GOOGLE_SAFE_BROWSING_KEY is set)
"""

import re
import os
import hashlib
import httpx
from typing import List, Dict
from urllib.parse import urlparse

# ─── Known-bad patterns ───────────────────────────────────────────────────────

# High-risk TLDs frequently abused in phishing
SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq",   # Free Freenom TLDs
    ".xyz", ".top", ".club", ".work",
    ".loan", ".win", ".download", ".review",
    ".stream", ".gdn", ".men", ".date"
}

# URL shorteners — often used to hide destination
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
    "is.gd", "buff.ly", "adf.ly", "bc.vc", "clck.ru",
    "shorte.st", "linktr.ee", "rb.gy", "cutt.ly"
}

# Suspicious keywords in URL paths (do NOT include brand names — they appear in legit URLs too)
PHISHING_KEYWORDS = [
    "login", "signin", "sign-in", "verify",
    "account-update", "confirm", "banking", "password",
    "credential", "validate", "suspend", "alert",
    "webscr", "cmd=_login", "update-billing", "secure-alert"
]

# Brand-spoofing patterns (legit brand + extra chars in domain)
BRAND_SPOOF_PATTERNS = [
    r"paypa[l1]",
    r"amaz[o0]n",
    r"micros[o0]ft",
    r"g[o0]{2}gle",
    r"app[l1]e",
    r"netf[l1]ix",
    r"[l1]inked[i1]n",
    r"[i1]nstagram",
    r"faceb[o0]{2}k",
    r"tw[i1]tter",
    r"dropb[o0]x",
]

# ─── URL Extractor ─────────────────────────────────────────────────────────────

URL_REGEX = re.compile(
    r"(?:https?://|www\.)"           # scheme or www
    r"[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+"  # URL chars
    r"(?<![.,;:!?\"\'])",            # don't include trailing punctuation
    re.IGNORECASE
)

def extract_urls(text: str) -> List[str]:
    """Extract all URLs from text."""
    urls = URL_REGEX.findall(text)
    # Normalize — add scheme if missing
    normalized = []
    for url in urls:
        if url.startswith("www."):
            url = "http://" + url
        normalized.append(url.strip())
    return list(set(normalized))  # deduplicate


# ─── Heuristic Scorer ─────────────────────────────────────────────────────────

def analyze_url_heuristic(url: str) -> Dict:
    """
    Score a single URL for phishing risk.
    Returns: { url, risk, reasons }
    """
    reasons = []
    risk_score = 0

    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        path = (parsed.path + "?" + parsed.query).lower()
        full = url.lower()
    except Exception:
        return {"url": url, "risk": "unknown", "reasons": ["Could not parse URL"]}

    # 1. Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            reasons.append(f"Suspicious TLD: {tld}")
            risk_score += 30
            break

    # 2. URL shortener (exact domain match — not substring)
    domain_root = domain.split(":")[0]  # strip port if any
    for shortener in URL_SHORTENERS:
        if domain_root == shortener or domain_root.endswith("." + shortener):
            reasons.append(f"URL shortener used: {shortener}")
            risk_score += 25
            break

    # 3. IP address as hostname (e.g. http://192.168.1.1/login)
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
        reasons.append("IP address used as hostname")
        risk_score += 40

    # 4. Excessive subdomains (e.g. secure.login.paypal.com.evil.com)
    subdomain_count = domain.count(".")
    if subdomain_count >= 4:
        reasons.append(f"Excessive subdomains ({subdomain_count})")
        risk_score += 20

    # 5. Phishing keywords in path
    matched_kws = [kw for kw in PHISHING_KEYWORDS if kw in path]
    if matched_kws:
        reasons.append(f"Phishing keywords in URL: {', '.join(matched_kws[:3])}")
        risk_score += 15 * min(len(matched_kws), 3)

    # 6. Brand spoofing in domain
    # Only flag if the domain is NOT the real brand's official domain
    REAL_BRAND_DOMAINS = {
        "microsoft.com", "apple.com", "google.com", "paypal.com",
        "amazon.com", "netflix.com", "linkedin.com", "instagram.com",
        "facebook.com", "twitter.com", "x.com", "dropbox.com",
    }
    is_real_brand = any(domain == bd or domain.endswith("." + bd) for bd in REAL_BRAND_DOMAINS)
    if not is_real_brand:
        for pattern in BRAND_SPOOF_PATTERNS:
            if re.search(pattern, domain):
                reasons.append(f"Possible brand spoofing in domain: {domain}")
                risk_score += 35
                break

    # 7. Very long URL (common in phishing to obscure destination)
    if len(url) > 100:
        reasons.append(f"Unusually long URL ({len(url)} chars)")
        risk_score += 10

    # 8. Mismatched HTTPS — using http:// for sensitive keywords
    if url.startswith("http://") and any(kw in full for kw in ["login", "secure", "banking", "account"]):
        reasons.append("Sensitive page served over HTTP (not HTTPS)")
        risk_score += 20

    # Determine risk level
    if risk_score >= 50:
        risk = "high"
    elif risk_score >= 25:
        risk = "medium"
    elif risk_score > 0:
        risk = "low"
    else:
        risk = "clean"

    return {
        "url": url,
        "risk": risk,
        "score": risk_score,
        "reasons": reasons
    }


# ─── Google Safe Browsing (Layer 3 — optional) ────────────────────────────────

SAFE_BROWSING_ENDPOINT = "https://safebrowsing.googleapis.com/v4/threatMatches:find"

async def check_google_safe_browsing(urls: List[str], api_key: str) -> Dict[str, bool]:
    """
    Check URLs against Google Safe Browsing API.
    Returns dict of { url: is_malicious }
    """
    if not urls or not api_key:
        return {}

    payload = {
        "client": {"clientId": "docshield", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": u} for u in urls]
        }
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{SAFE_BROWSING_ENDPOINT}?key={api_key}",
                json=payload
            )
            data = response.json()

        flagged = {}
        for match in data.get("matches", []):
            flagged_url = match.get("threat", {}).get("url", "")
            if flagged_url:
                flagged[flagged_url] = True
        return flagged

    except Exception as e:
        print(f"⚠️ Google Safe Browsing API error: {e}")
        return {}


# ─── Main Entry Point ─────────────────────────────────────────────────────────

async def scan_document_for_threats(text: str) -> Dict:
    """
    Full phishing/threat scan of document text.
    Returns:
        {
          urls_found: int,
          threats: [ { url, risk, reasons } ],
          high_risk_count: int,
          overall_threat_level: "none" | "low" | "medium" | "high",
          summary: str
        }
    """
    urls = extract_urls(text)

    if not urls:
        return {
            "urls_found": 0,
            "threats": [],
            "high_risk_count": 0,
            "overall_threat_level": "none",
            "summary": "No URLs found in document."
        }

    # Layer 2 — heuristic analysis
    results = [analyze_url_heuristic(url) for url in urls]

    # Layer 3 — Google Safe Browsing (if API key configured)
    gsb_key = os.environ.get("GOOGLE_SAFE_BROWSING_KEY", "")
    if gsb_key:
        flagged = await check_google_safe_browsing(urls, gsb_key)
        for r in results:
            if flagged.get(r["url"]):
                r["risk"] = "high"
                r["reasons"].insert(0, "⚠️ Confirmed by Google Safe Browsing")
                r["score"] = max(r.get("score", 0), 90)

    # Summarize
    threats = [r for r in results if r["risk"] != "clean"]
    high_risk = [r for r in results if r["risk"] == "high"]

    if high_risk:
        overall = "high"
    elif any(r["risk"] == "medium" for r in results):
        overall = "medium"
    elif threats:
        overall = "low"
    else:
        overall = "none"

    if overall == "none":
        summary = f"Scanned {len(urls)} URL(s) — no threats detected."
    elif overall == "high":
        summary = f"⚠️ {len(high_risk)} high-risk URL(s) detected out of {len(urls)} scanned. Possible phishing attempt."
    else:
        summary = f"Found {len(threats)} suspicious URL(s) out of {len(urls)} scanned — manual review recommended."

    return {
        "urls_found": len(urls),
        "threats": threats,
        "high_risk_count": len(high_risk),
        "overall_threat_level": overall,
        "summary": summary
    }
