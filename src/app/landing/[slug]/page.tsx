"use client";

import { useState, useEffect, useRef } from "react";

interface LandingPageData {
  name: string;
  slug: string;
  category: string;
  html_content: string;
  css_content: string;
}

export default function LandingSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [aid, setAid] = useState<string | null>(null);
  const [page, setPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setAid(sp.get("aid"));
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/v1/public/pages/${slug}/`)
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

    const forms = contentRef.current.querySelectorAll("form");
    const handlers: Array<[HTMLFormElement, (e: Event) => void]> = [];

    forms.forEach((form) => {
      const handler = async (e: Event) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);

        const fieldNames: string[] = [];
        const elements = (e.target as HTMLFormElement).elements;
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (el.name && el.type !== "submit") {
            fieldNames.push(el.name);
          }
        }

        try {
          const res = await fetch(`/api/v1/track/submit/${aid}/`, {
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

      form.addEventListener("submit", handler);
      handlers.push([form, handler]);
    });

    return () => {
      handlers.forEach(([form, handler]) => {
        form.removeEventListener("submit", handler);
      });
    };
  }, [page, aid, submitting]);

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
