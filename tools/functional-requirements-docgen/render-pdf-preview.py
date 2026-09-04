import pathlib
import sys

import pymupdf


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit("Usage: render-pdf-preview.py input.pdf output-prefix [page ...]")
    source = pathlib.Path(sys.argv[1])
    prefix = pathlib.Path(sys.argv[2])
    document = pymupdf.open(source)
    pages = [int(value) for value in sys.argv[3:]] if len(sys.argv) > 3 else [1]
    for page_number in pages:
        page = document[page_number - 1]
        pixmap = page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False)
        output = prefix.parent / f"{prefix.name}-p{page_number}.png"
        pixmap.save(output)
        print(output)


if __name__ == "__main__":
    main()
