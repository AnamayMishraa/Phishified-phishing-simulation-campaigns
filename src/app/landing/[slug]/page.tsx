"use client";

import { useState, useEffect, useRef } from "react";
import { API_URL } from "@/lib/api/client";

interface LandingPageData {
  name: string;
  slug: string;
  category: string;
  html_content: string;
  css_content: string;
}

// Derive the Django root from API_URL by stripping /api/v1
const DJANGO_BASE_URL = API_URL.replace(/\/api\/v1\/?$/, "");

function collectFieldNames(root: HTMLElement, source?: EventTarget | null): string[] {
  if (source) {
    const form = (source as HTMLElement).closest("form");
    if (form) {
      return [...(form as HTMLFormElement).elements]
        .filter((el) => (el as HTMLInputElement).name && (el as HTMLInputElement).type !== "submit")
        .map((el) => (el as HTMLInputElement).name);
    }
  }

  return [...root.querySelectorAll<HTMLInputElement>("input[name], select[name], textarea[name]")]
    .filter((el) => el.type !== "submit")
    .map((el) => el.name);
}

export default function LandingSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [aid, setAid] = useState<string | null>(null);
  const [page, setPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setAid(sp.get("aid"));
  }, []);

  useEffect(() => {
    if (!slug) return;
      fetch(`${DJANGO_BASE_URL}/api/v1/public/pages/${slug}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Page not found");
        return res.json();
      })
      .then((data: LandingPageData) => setPage(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!page || !contentRef.current || !aid) return;

    const root = contentRef.current;

    const submitCredentials = async (source?: EventTarget | null) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      const fieldNames = collectFieldNames(root, source);

      try {
        const res = await fetch(`${DJANGO_BASE_URL}/api/v1/track/submit/${aid}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submitted_fields: fieldNames }),
        });

        if (res.redirected) {
          window.location.href = res.url;
        } else {
          const data = await res.json();
          window.location.href = data.redirect_url || "/completion/";
        }
      } catch {
        window.location.href = "/completion/";
      }
    };

    const cleanup: (() => void)[] = [];

    const forms = root.querySelectorAll("form");
    const formHandler = (e: Event) => {
      e.preventDefault();
      submitCredentials(e.target);
    };
    forms.forEach((form) => {
      form.addEventListener("submit", formHandler);
      cleanup.push(() => form.removeEventListener("submit", formHandler));
    });

    const buttons = root.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
      'button[type="submit"], input[type="submit"], button:not([type])'
    );
    const clickHandler = (e: Event) => {
      if ((e.currentTarget as HTMLElement).closest("form")) return;
      e.preventDefault();
      submitCredentials(e.currentTarget);
    };
    buttons.forEach((btn) => {
      btn.addEventListener("click", clickHandler);
      cleanup.push(() => btn.removeEventListener("click", clickHandler));
    });

    const inputs = root.querySelectorAll<HTMLInputElement>(
      'input[type="email"], input[type="password"], input[name="email"], input[name="password"], input[name="username"]'
    );
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if ((e.currentTarget as HTMLElement).closest("form")) return;
      e.preventDefault();
      submitCredentials(e.currentTarget);
    };
    inputs.forEach((input) => {
      input.addEventListener("keydown", keyHandler);
      cleanup.push(() => input.removeEventListener("keydown", keyHandler));
    });

    return () => {
      cleanup.forEach((fn) => fn());
    };
  }, [page, aid]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: "#888", fontSize: "14px" }}>
        Loading...
      </div>
    );
  }

  if (error || !page) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>404</h1>
          <p style={{ color: "#888", fontSize: "14px" }}>Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {page.css_content && <style>{page.css_content}</style>}
      <div ref={contentRef} dangerouslySetInnerHTML={{ __html: page.html_content }} />
    </>
  );
}
