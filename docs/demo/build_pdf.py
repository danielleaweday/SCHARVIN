"""Render ANCR_Roadmap_and_Demo_Strategy.html to PDF.

The cover is printed on its own zero-margin page so it bleeds to the paper edge,
then merged in front of the body, which keeps normal print margins. Chrome cannot
do both in one pass -- a full-bleed first page forces it to shrink-to-fit every
other page.

Usage:  python build_pdf.py
Needs:  pip install pymupdf   (plus Chrome or Edge on the default install path)
"""
from __future__ import annotations

import io
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "ANCR_Roadmap_and_Demo_Strategy.html")
OUT = os.path.join(HERE, "ANCR_Roadmap_and_Demo_Strategy.pdf")

COVER_MARK = "<!-- ================= COVER ================= -->"
BODY_MARK = "<!-- ================= 01 EXEC SUMMARY ================= -->"

BROWSERS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def find_browser() -> str:
    for path in BROWSERS:
        if os.path.exists(path):
            return path
    found = shutil.which("chrome") or shutil.which("msedge")
    if found:
        return found
    sys.exit("No Chrome or Edge found -- install one or add it to PATH.")


def split_source() -> tuple[str, str]:
    """Write _cover.html (zero page margin) and _body.html (normal margins)."""
    src = io.open(SRC, encoding="utf-8").read()
    head, rest = src.split(COVER_MARK)
    cover, body = rest.split(BODY_MARK)

    cover_html = head.replace(
        "@page { size: Letter; margin: 16mm 15mm 16mm 15mm; }",
        "@page { size: Letter; margin: 0; }",
    ) + cover + "</body></html>"

    cover_path = os.path.join(HERE, "_cover.html")
    body_path = os.path.join(HERE, "_body.html")
    io.open(cover_path, "w", encoding="utf-8").write(cover_html)
    io.open(body_path, "w", encoding="utf-8").write(head + BODY_MARK + body)
    return cover_path, body_path


def print_pdf(browser: str, html_path: str, pdf_path: str) -> None:
    url = "file:///" + html_path.replace("\\", "/")
    subprocess.run(
        [
            browser,
            "--headless",
            "--disable-gpu",
            "--no-pdf-header-footer",
            "--virtual-time-budget=6000",
            f"--print-to-pdf={pdf_path}",
            url,
        ],
        capture_output=True,
        check=False,
    )
    if not os.path.exists(pdf_path):
        sys.exit(f"Chrome produced no PDF for {html_path}")


def main() -> None:
    import pymupdf

    browser = find_browser()
    cover_html, body_html = split_source()
    cover_pdf = os.path.join(HERE, "_cover.pdf")
    body_pdf = os.path.join(HERE, "_body.pdf")

    print_pdf(browser, cover_html, cover_pdf)
    print_pdf(browser, body_html, body_pdf)

    cover, body = pymupdf.open(cover_pdf), pymupdf.open(body_pdf)
    doc = pymupdf.open()
    doc.insert_pdf(cover, to_page=0)
    doc.insert_pdf(body)
    doc.set_metadata(
        {
            "title": "ANCR - Product Roadmap & Demo Strategy",
            "author": "ANCR",
            "subject": "ANCR-ROADMAP-1.0",
            "keywords": "roadmap, demo strategy, ANCR, CCDP, federation",
        }
    )
    doc.save(OUT)
    pages = doc.page_count
    doc.close(); cover.close(); body.close()

    for tmp in (cover_html, body_html, cover_pdf, body_pdf):
        os.remove(tmp)

    print(f"{OUT}  ({pages} pages, {os.path.getsize(OUT) // 1024} KB)")


if __name__ == "__main__":
    main()
