const fs = require('fs');
let c = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

c = c.replace(/const tabOk = \{/, `
const checklist = [
  { ok: !!p?.cover_image, text: "Cover image uploaded" },
  { ok: !!p?.summary, text: "Short summary written" },
  { ok: !!p?.category, text: "Category selected" },
  { ok: (p?.bom?.length || 0) > 0, text: "Parts list (BOM) added" },
  { ok: (p?.steps?.length || 0) > 0, text: "Build steps written" },
  { ok: !!p?.meta_title || !!p?.title, text: "SEO title set" }
];
const canPublish = p ? checklist.every(c => c.ok) : false;

const tabOk = {`);

c = c.replace(/<div class="panel" data-panel="seo" hidden>/, `<div class="panel" data-panel="seo" hidden>
    {p && (
      <div class="publish-checklist">
        <h3><Icon name="check-circle" size={16} /> Pre-publish checklist</h3>
        <ul style="list-style: none; padding: 0; margin: 0.5rem 0 1.5rem 0; font-size: var(--fs-sm);">
          {checklist.map(c => (
            <li style={{ color: c.ok ? "var(--success)" : "var(--text-muted)", display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
              <Icon name={c.ok ? "check-circle" : "circle"} size={14} /> {c.text}
            </li>
          ))}
        </ul>
        {!canPublish && p.published === 1 && (
          <p class="dim" style="color: var(--danger); font-size: 0.85em;">Warning: Project is published but missing required fields.</p>
        )}
      </div>
    )}`);

fs.writeFileSync('src/components/ProjectEditor.astro', c);
