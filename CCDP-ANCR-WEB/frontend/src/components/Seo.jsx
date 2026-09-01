import { useEffect } from "react";

const SITE = "CCDP — Contemporary Creative Development Program";
const OG_IMAGE =
  "https://static.prod-images.emergentagent.com/jobs/ffec5a16-d22c-4836-8acc-763a7361cdbe/images/ff9e4b55e3ce932c328b940eb6fcfd3989adbed4ba7fd0492597005a9cbb0cdc.png";

const setMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

// Lightweight, dependency-free per-page SEO / social metadata.
export const Seo = ({ title, description, noindex = false }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} — CCDP` : SITE;
    document.title = fullTitle;

    const url = `${window.location.origin}${window.location.pathname}`;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", OG_IMAGE);
    setLink("canonical", url);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
  }, [title, description, noindex]);

  return null;
};
