"use client";
import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";

const LINKS: Array<{ href: string; label: string }> = [
  { href: "#how", label: "How" },
  { href: "#features", label: "Features" },
  { href: "#agent", label: "AI mode" },
  { href: "/docs/getting-started/playground/", label: "Playground" },
  { href: "/docs/", label: "Docs" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Close the menu on hash-link click and on resize-to-desktop
  useEffect(() => {
    if (!open) return;
    const closeOnAnchor = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === "A") setOpen(false);
    };
    const closeOnResize = () => {
      if (window.innerWidth >= 720) setOpen(false);
    };
    document.addEventListener("click", closeOnAnchor);
    window.addEventListener("resize", closeOnResize);
    return () => {
      document.removeEventListener("click", closeOnAnchor);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [open]);

  return (
    <div className="nav">
      <div className="nav-inner">
        <a href="#top" className="nav-brand">
          <BrandMark size={32} />
          <span className="nav-name">plyxui</span>
          <span className="nav-beta">BETA</span>
        </a>

        {/* Desktop links */}
        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="muted nav-link">
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/vineethpawar/plyxui"
            target="_blank"
            rel="noopener"
            aria-label="View source on GitHub"
            className="muted nav-link nav-github"
          >
            <GithubIcon />
          </a>
          <a href="#install" className="cta nav-cta">
            Get started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      <div className="nav-panel" data-open={open}>
        <div className="nav-panel-inner">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-panel-link">
              {l.label}
            </a>
          ))}
          <a
            href="https://github.com/vineethpawar/plyxui"
            target="_blank"
            rel="noopener"
            className="nav-panel-link"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <GithubIcon /> GitHub
          </a>
          <a href="#install" className="cta" style={{ marginTop: 6 }}>
            Get started
          </a>
        </div>
      </div>
    </div>
  );
}

function GithubIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.91c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.77.12 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.26 5.69.42.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}
