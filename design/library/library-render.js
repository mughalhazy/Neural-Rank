(function renderLibraryPage() {
  const root = document.getElementById("app");
  if (!root || !window.LIBRARY_DATA) {
    return;
  }

  const archetype = root.dataset.archetype;
  const bucket = root.dataset.bucket;
  const meta = window.LIBRARY_DATA.meta[archetype];
  const bucketData = window.LIBRARY_DATA.buckets[archetype]?.[bucket] || [];

  if (!meta) {
    root.innerHTML = "<div class='empty'><strong>Missing archetype metadata.</strong></div>";
    return;
  }

  document.title = `${meta.title} Inspiration Library`;
  document.documentElement.style.setProperty("--accent", meta.accent);
  document.documentElement.style.setProperty("--accent-soft", `${meta.accent}1f`);

  const bucketLinks = [
    { key: "new", label: "New" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" }
  ];

  const cards = bucketData.length
    ? `<div class="card-grid">${bucketData
        .map((item, index) => {
          const preview = window.CAPTURE_MANIFEST?.[`${archetype}/${bucket}/${index}`] || "";
          return `
            <article class="source-card">
              <div class="preview">
                <span class="badge">${bucket.toUpperCase()} ${String(index + 1).padStart(2, "0")}</span>
                ${preview
                  ? `<img src="${preview}" alt="${item.title}" loading="lazy" />`
                  : `<div class="missing">Static capture missing</div>`}
              </div>
              <div class="content">
                <h3>${item.title}</h3>
                <p>${item.note}</p>
                <div class="meta-row">
                  <span class="pill">Source: Dribbble</span>
                  <span class="pill">Bucket: ${bucket}</span>
                </div>
                <a class="footer-link" href="${item.source}" target="_blank" rel="noreferrer">Open source ↗</a>
              </div>
            </article>
          `;
        })
        .join("")}</div>`
    : `
      <div class="empty">
        <strong>${meta.title} / ${bucket}</strong>
        <p style="margin-top:10px;">This bucket is ready. Move reviewed screens here after approval or rejection.</p>
      </div>
    `;

  root.innerHTML = `
    <div class="shell">
      <div class="topbar">
        <div class="brand">Neural Rank / Inspiration Library</div>
        <div class="topnav">
          <a href="../index.html">Library index</a>
          <a href="../../html-mockups-archetypes-v2/index.html">Archetype mockups</a>
          <a href="../../docs/frontend/FRONTEND_SCREEN_ARCHETYPES.md">Archetype doc</a>
        </div>
      </div>

      <div class="hero">
        <div class="eyebrow">${meta.title}</div>
        <h1>${meta.title} inspiration intake</h1>
        <p>Source review board for this archetype. Use <code>new</code> to screen candidates, then move approved references into <code>approved</code> and weak fits into <code>rejected</code>.</p>
      </div>

      <div class="bucket-bar">
        ${bucketLinks
          .map(
            (entry) => `
              <a class="bucket-link ${entry.key === bucket ? "active" : ""}" href="./${entry.key}.html">
                <strong>${entry.label}</strong>
                <span>${window.LIBRARY_DATA.buckets[archetype][entry.key].length} references</span>
              </a>
            `
          )
          .join("")}
      </div>

      ${cards}
    </div>
  `;
})();
