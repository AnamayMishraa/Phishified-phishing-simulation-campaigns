export default async function CompletionSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", padding: "24px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>Thank You</h1>
        <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
          Your request has been submitted successfully.
        </p>
      </div>
    </div>
  );
}
