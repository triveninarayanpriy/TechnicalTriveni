const fs = require('fs');

let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace(
  "import Icon from '../../components/Icon.astro';",
  "import Icon from '../../components/Icon.astro';\nimport BomTable from '../../components/BomTable.astro';\nimport StageCard from '../../components/StageCard.astro';\nimport TroubleTable from '../../components/TroubleTable.astro';"
);

c = c.replace(
  "const descHtml = renderMarkdown(project.description);",
  "const descHtml = renderMarkdown(project.description).replace(/^<h2[^>]*>\\\\s*Overview\\\\s*<\\/h2>\\\\s*/i, '');\nconst safetyHtml = project.safety_note ? renderMarkdown(project.safety_note) : '';\nconst creditsHtml = project.credits ? renderMarkdown(project.credits) : '';\n\nconst coreCost = project.bom.reduce((sum, b) => {\n  if (b.is_required === 0) return sum;\n  const q = parseInt(b.qty, 10);\n  const qty = Number.isFinite(q) && q > 0 ? q : 1;\n  return sum + (b.unit_price_inr > 0 ? b.unit_price_inr * qty : 0);\n}, 0);\nconst fullCost = project.bom.reduce((sum, b) => {\n  const q = parseInt(b.qty, 10);\n  const qty = Number.isFinite(q) && q > 0 ? q : 1;\n  return sum + (b.unit_price_inr > 0 ? b.unit_price_inr * qty : 0);\n}, 0);\nconst displayCost = project.cost_override > 0 ? project.cost_override : coreCost;\nconst hasAffiliate = project.bom.some((b) => b.is_affiliate === 1 && b.affiliate_url);"
);

c = c.replace(
  "{project.build_time && <span class=\"chip\"><Icon name=\"clock\" size={13} /> {project.build_time}</span>}",
  "{project.build_time && <span class=\"chip\"><Icon name=\"clock\" size={13} /> {project.build_time}</span>}\n          {displayCost > 0 && <span class=\"chip\"><Icon name=\"cart\" size={13} /> ~&#8377;{displayCost.toLocaleString('en-IN')} build cost</span>}"
);

c = c.replace(
  "<div class=\"prose\" set:html={descHtml} />",
  "{(project.arch_svg || project.arch_image_url) && (\n        <section class=\"sec\" id=\"architecture\">\n          <h2 class=\"sec__title\"><Icon name=\"layers\" size={18} /> Architecture</h2>\n          {project.arch_svg ? (\n            <div class=\"arch-svg-wrapper\" style=\"overflow-x: auto; -webkit-overflow-scrolling: touch;\">\n              <div style=\"min-width: 900px;\" set:html={project.arch_svg}></div>\n            </div>\n          ) : (\n            <figure style=\"margin: 0;\">\n              <img src={project.arch_image_url} alt={project.arch_alt || 'Architecture diagram'} style=\"width: 100%; height: auto; border-radius: var(--r-md); border: 1px solid var(--border);\" />\n              {project.arch_alt && <figcaption style=\"margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-muted); text-align: center;\">{project.arch_alt}</figcaption>}\n            </figure>\n          )}\n        </section>\n      )}\n\n      <section class=\"sec\" id=\"overview\">\n        <h2 class=\"sec__title\"><Icon name=\"info\" size={18} /> Overview</h2>\n        <div class=\"prose\" set:html={descHtml} />\n      </section>"
);

c = c.replace(
  "<!-- Replace with interactive BOM -->\n        <div class=\"prose\">\n          <p>Parts list goes here...</p>\n        </div>",
  "<BomTable items={project.bom} overrideTotal={project.cost_override} />\n            {hasAffiliate && (\n              <p class=\"affiliate-note dim\"><Icon name=\"tag\" size={12} /> Links marked \"ad\" are affiliate — we may earn a small commission at no extra cost to you.</p>\n            )}"
);

c = c.replace(
  "<!-- Replace with Build Steps component -->\n        <div class=\"prose\">\n          <p>Steps go here...</p>\n        </div>",
  "<div class=\"steps-list\">\n              {project.steps && project.steps.map((step, i) => (\n                <StageCard step={step} index={i} />\n              ))}\n            </div>"
);

c = c.replace(
  "<!-- Replace with Troubleshooting component -->\n        <div class=\"prose\">\n          <p>Troubleshooting goes here...</p>\n        </div>",
  "<TroubleTable items={project.troubleshooting} />"
);

c = c.replace(
  ".proj-sidebar-inner {\n      position: sticky;",
  ".proj-sidebar-inner {\n      /* removed sticky per request */"
);

c = c.replace(
  /cta-card\s*\{[^}]*position:\s*sticky;[^}]*}/,
  "cta-card { padding: 1.25rem; margin-top: 0.25rem; }"
);

c = c.replace(
  ".content {\n    grid-area: content;\n    display: flex;",
  ".content {\n    grid-area: content;\n    min-width: 0;\n    display: flex;"
);

fs.writeFileSync('src/pages/projects/[slug].astro', c);
