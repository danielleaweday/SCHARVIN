import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

BRAND = "/app/frontend/public/brand"
OUT = os.path.join(BRAND, "lockup")
os.makedirs(OUT, exist_ok=True)

FONT_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
BLUE = (46, 123, 255)
PURPLE = (122, 63, 242)
ORANGE = (245, 165, 36)

def trim(im):
    im = im.convert("RGBA")
    bbox = im.getchannel("A").getbbox()
    return im.crop(bbox) if bbox else im

def scaled(im, target_w):
    r = target_w / im.width
    return im.resize((int(target_w), int(im.height * r)), Image.LANCZOS)

def draw_tracked(draw, s, font, cx, y, fill, track):
    total = sum(draw.textlength(c, font=font) for c in s) + track * (len(s) - 1)
    x = cx - total / 2
    for c in s:
        draw.text((x, y), c, font=font, fill=fill)
        x += draw.textlength(c, font=font) + track

def soft_line(w, h, color=(255, 255, 255), max_alpha=120):
    img = Image.new("RGBA", (w, h), color + (255,))
    fade = np.ones(w)
    edge = int(w * 0.16)
    fade[:edge] = np.linspace(0, 1, edge)
    fade[-edge:] = np.linspace(1, 0, edge)
    a = np.tile((fade * max_alpha).astype(np.uint8), (h, 1))
    img.putalpha(Image.fromarray(a))
    return img

# preload + trim logos once
CCDP = trim(Image.open(os.path.join(BRAND, "ccdp-mark.png")))
_ancr_full = trim(Image.open(os.path.join(BRAND, "ancr.png")))
ANCR = trim(_ancr_full.crop((0, 0, _ancr_full.width, 356)))  # wordmark only

def build_block(CW, CH, ccdp_w, ancr_w, tag_size, div_w, gaps):
    canvas = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    ccdp = scaled(CCDP, ccdp_w)
    ancr = scaled(ANCR, ancr_w)

    font = ImageFont.truetype(FONT_B, tag_size)
    track = int(tag_size * 0.28)
    line_h = int(tag_size * 1.36)
    ccdp_tag = ["CONTEMPORARY CREATIVE", "DEVELOPMENT PROGRAM"]
    ancr_tag = ["ARTIST DISCOVERY &", "DEVELOPMENT NETWORK"]
    ctag_h, atag_h = line_h * 2, line_h * 2

    block_h = (ccdp.height + gaps["g1"] + ctag_h + gaps["g2"] + 3 + gaps["g3"]
               + ancr.height + gaps["g4"] + atag_h)
    y = (CH - block_h) // 2
    cx = CW // 2

    def lines(ls, top):
        ty = top
        for ln in ls:
            draw_tracked(draw, ln, font, cx, ty, (255, 255, 255, 255), track)
            ty += line_h

    canvas.alpha_composite(ccdp, (cx - ccdp.width // 2, y)); y += ccdp.height + gaps["g1"]
    lines(ccdp_tag, y); y += ctag_h + gaps["g2"]
    ln = soft_line(div_w, 3, (232, 236, 245), 120)
    canvas.alpha_composite(ln, (cx - div_w // 2, y)); y += 3 + gaps["g3"]
    canvas.alpha_composite(ancr, (cx - ancr.width // 2, y)); y += ancr.height + gaps["g4"]
    lines(ancr_tag, y)
    return canvas

def radial_glow(CW, CH, center, radius, color, alpha):
    layer = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color + (alpha,))
    return layer.filter(ImageFilter.GaussianBlur(int(radius * 0.55)))

def make_dark(block):
    CW, CH = block.size
    bg = Image.new("RGBA", (CW, CH), (8, 8, 13, 255))
    bg.alpha_composite(radial_glow(CW, CH, (CW * 0.25, CH * 0.2), CW * 0.36, BLUE, 68))
    bg.alpha_composite(radial_glow(CW, CH, (CW * 0.8, CH * 0.5), CW * 0.35, PURPLE, 62))
    bg.alpha_composite(radial_glow(CW, CH, (CW * 0.35, CH * 0.85), CW * 0.32, ORANGE, 44))
    bg.alpha_composite(block)
    return bg.convert("RGB")

def make_white(block):
    CW, CH = block.size
    bg = Image.new("RGBA", (CW, CH), (255, 255, 255, 255))
    m = int(CW * 0.075)
    card = [m, m, CW - m, CH - m]
    shadow = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([m + 8, m + 22, CW - m + 8, CH - m + 22],
                                             radius=70, fill=(20, 20, 30, 120))
    bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(34)))
    card_layer = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    ImageDraw.Draw(card_layer).rounded_rectangle(card, radius=64, fill=(15, 16, 22, 255),
                                                 outline=(255, 255, 255, 26), width=2)
    card_layer.alpha_composite(radial_glow(CW, CH, (CW * 0.28, CH * 0.25), CW * 0.26, BLUE, 40))
    card_layer.alpha_composite(radial_glow(CW, CH, (CW * 0.75, CH * 0.72), CW * 0.26, PURPLE, 38))
    mask = Image.new("L", (CW, CH), 0)
    ImageDraw.Draw(mask).rounded_rectangle(card, radius=64, fill=255)
    bg.paste(card_layer, (0, 0), Image.composite(card_layer.getchannel("A"), Image.new("L", (CW, CH), 0), mask))
    bg.alpha_composite(block)
    return bg.convert("RGB")

def export(prefix, block):
    block.save(os.path.join(OUT, f"{prefix}-transparent.png"))
    make_dark(block).save(os.path.join(OUT, f"{prefix}-dark.png"))
    make_white(block).save(os.path.join(OUT, f"{prefix}-white.png"))

# 1) Vertical lockup (documents) — 2000x3000
vertical = build_block(2000, 3000, ccdp_w=1420, ancr_w=1500, tag_size=56, div_w=640,
                       gaps=dict(g1=90, g2=120, g3=120, g4=80))
export("ccdp-ancr-lockup", vertical)

# 2) Square executive seal — 2400x2400 (LinkedIn/PPT/email/PDF/decks)
square = build_block(2400, 2400, ccdp_w=1680, ancr_w=1780, tag_size=60, div_w=760,
                     gaps=dict(g1=96, g2=130, g3=130, g4=86))
export("ccdp-ancr-seal-square", square)

print("SAVED:", sorted(os.listdir(OUT)))
