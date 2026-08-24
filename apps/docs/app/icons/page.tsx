"use client";

/**
 * /docs/icons — friendly shorthand people type by hand. The site is a
 * static export (no server redirects), so this stub forwards to the
 * real icons page on the client, with a plain link as the no-JS path.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IconsIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/icons/icon/");
  }, [router]);
  return (
    <p style={{ color: "var(--muted)", fontSize: 14 }}>
      Taking you to the icon library… <a href="/docs/icons/icon/" style={{ color: "var(--orange)" }}>open it directly</a>
    </p>
  );
}
