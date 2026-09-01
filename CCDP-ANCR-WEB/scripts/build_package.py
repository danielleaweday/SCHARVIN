import os, io, base64
from PIL import Image, ImageFont

BRAND = "/app/frontend/public/brand"
OUT = os.path.join(BRAND, "lockup")
for sub in ["png", "web", "svg"]:
    os.makedirs(os.path.join(OUT, sub), exist_ok=True)

FONT_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

def trim(im):
    im = im.convert("RGBA")
    b = im.getchannel("A").getbbox()
    return im.crop(b) if b else im

CCDP = trim(Image.open(os.path.join(BRAND, "ccdp-mark.png")))
_af = trim(Image.open(os.path.join(BRAND, "ancr.png")))
ANCR = trim(_af.crop((0, 0, _af.width, 356)))

def save_png(im, path):
    im.save(path, optimize=True)

def resize_h(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)

def resize_w(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)

# ---- Load transparent masters ----
seal = Image.open(os.path.join(OUT, "ccdp-ancr-seal-square-transparent.png")).convert("RGBA")
lock = Image.open(os.path.join(OUT, "ccdp-ancr-lockup-transparent.png")).convert("RGBA")

# ---- Square seal fixed sizes ----
for s in (512, 1024, 1600):
    save_png(resize_w(seal, s), os.path.join(OUT, "png", f"ccdp-ancr-seal-{s}.png"))

# ---- Square seal web @1x/@2x/@3x (256/512/768) ----
for mult, s in ((1, 256), (2, 512), (3, 768)):
    save_png(resize_w(seal, s), os.path.join(OUT, "web", f"ccdp-ancr-seal@{mult}x.png"))

# ---- Vertical lockup: 800px tall for nav/presentations ----
save_png(resize_h(lock, 800), os.path.join(OUT, "png", "ccdp-ancr-lockup-800h.png"))

# ---- Vertical lockup web @1x/@2x/@3x (400/800/1200 tall) ----
for mult, h in ((1, 400), (2, 800), (3, 1200)):
    save_png(resize_h(lock, h), os.path.join(OUT, "web", f"ccdp-ancr-lockup@{mult}x.png"))

# ---- SVG builder (vector layout + embedded official logos + live taglines) ----
def b64(im):
    buf = io.BytesIO(); im.save(buf, "PNG"); return base64.b64encode(buf.getvalue()).decode()

CCDP_B64, ANCR_B64 = b64(CCDP), b64(ANCR)

def make_svg(path, CW, CH, ccdp_w, ancr_w, tag_size, div_w, g):
    ccdp_h = ccdp_w * CCDP.height / CCDP.width
    ancr_h = ancr_w * ANCR.height / ANCR.width
    line_h = tag_size * 1.36
    track = round(tag_size * 0.28)
    ctag = ["CONTEMPORARY CREATIVE", "DEVELOPMENT PROGRAM"]
    atag = ["ARTIST DISCOVERY &", "DEVELOPMENT NETWORK"]
    block_h = ccdp_h + g[0] + line_h * 2 + g[1] + 3 + g[2] + ancr_h + g[3] + line_h * 2
    y = (CH - block_h) / 2
    cx = CW / 2
    el = []
    el.append(f'<image x="{cx-ccdp_w/2:.1f}" y="{y:.1f}" width="{ccdp_w}" height="{ccdp_h:.1f}" '
              f'xlink:href="data:image/png;base64,{CCDP_B64}"/>')
    y += ccdp_h + g[0]
    def texts(lines, top):
        out = []
        ty = top + tag_size * 0.82
        for ln in lines:
            esc = ln.replace("&", "&amp;")
            out.append(f'<text x="{cx:.1f}" y="{ty:.1f}" text-anchor="middle" '
                       f'font-family="Arial, Helvetica, sans-serif" font-weight="700" '
                       f'font-size="{tag_size}" letter-spacing="{track}" fill="#ffffff">{esc}</text>')
            ty += line_h
        return out
    el += texts(ctag, y); y += line_h * 2 + g[1]
    el.append(f'<rect x="{cx-div_w/2:.1f}" y="{y:.1f}" width="{div_w}" height="3" rx="1.5" '
              f'fill="url(#divg)"/>')
    y += 3 + g[2]
    el.append(f'<image x="{cx-ancr_w/2:.1f}" y="{y:.1f}" width="{ancr_w}" height="{ancr_h:.1f}" '
              f'xlink:href="data:image/png;base64,{ANCR_B64}"/>')
    y += ancr_h + g[3]
    el += texts(atag, y)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{CW}" height="{CH}" viewBox="0 0 {CW} {CH}">
  <defs>
    <linearGradient id="divg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e8ecf5" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#e8ecf5" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#e8ecf5" stop-opacity="0"/>
    </linearGradient>
  </defs>
  {chr(10).join("  " + e for e in el)}
</svg>'''
    with open(path, "w") as f:
        f.write(svg)

make_svg(os.path.join(OUT, "svg", "ccdp-ancr-lockup.svg"),
         2000, 3000, 1420, 1500, 56, 640, (90, 120, 120, 80))
make_svg(os.path.join(OUT, "svg", "ccdp-ancr-seal-square.svg"),
         2400, 2400, 1680, 1780, 60, 760, (96, 130, 130, 86))

# ---- Manifest ----
manifest = """CCDP + ANCR — Brand Lockup Asset Package
=========================================
Built from the official CCDP and ANCR logos (unmodified proportions & colors).

MASTERS (full resolution)
  ccdp-ancr-lockup-transparent.png      2000x3000  vertical lockup, transparent
  ccdp-ancr-lockup-dark.png             2000x3000  vertical, dark presentation bg
  ccdp-ancr-lockup-white.png            2000x3000  vertical, white presentation (dark card)
  ccdp-ancr-seal-square-transparent.png 2400x2400  square seal, transparent
  ccdp-ancr-seal-square-dark.png        2400x2400  square seal, dark
  ccdp-ancr-seal-square-white.png       2400x2400  square seal, white

png/  (fixed sizes)
  ccdp-ancr-seal-512.png    512x512    email signature / profile
  ccdp-ancr-seal-1024.png   1024x1024  social / slides
  ccdp-ancr-seal-1600.png   1600x1600  high-res square
  ccdp-ancr-lockup-800h.png 800px tall vertical lockup (nav / presentations)

web/  (responsive @1x/@2x/@3x, optimized)
  ccdp-ancr-seal@1x.png     256   @2x 512   @3x 768
  ccdp-ancr-lockup@1x.png   400h  @2x 800h  @3x 1200h

svg/  (scalable; official logos embedded, taglines as live text)
  ccdp-ancr-lockup.svg
  ccdp-ancr-seal-square.svg

Base URL: https://studio-ancr.preview.emergentagent.com/brand/lockup/
"""
with open(os.path.join(OUT, "README.txt"), "w") as f:
    f.write(manifest)

def tree(p, ind=""):
    for n in sorted(os.listdir(p)):
        fp = os.path.join(p, n)
        if os.path.isdir(fp):
            print(ind + n + "/"); tree(fp, ind + "  ")
        else:
            print(f"{ind}{n:40s} {os.path.getsize(fp)//1024}KB")

tree(OUT)
