"""Test infrastructure: ensure /app/backend is importable by tests that do
`import evidence` / `import media_evidence` / `import server`.

Previous iterations relied on pytest's rootdir auto-inserting the backend dir
into sys.path; making it explicit here guarantees the behaviour regardless of
invocation cwd or plugin ordering.
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
