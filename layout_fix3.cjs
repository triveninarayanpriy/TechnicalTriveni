const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace(/<header class="detail__head">[\\s\\S]*?<\\/header>/, '');
c = c.replace(/<nav class="crumbs"[\\s\\S]*?<\\/nav>/, '');
c = c.replace(/<div class="detail__grid">/,
  '<div class="container dp" style="padding-top: 1rem;">\\n' +
  '  <!-- Mobile Title -->\\n' +
  '  <div class="hide-md" style="margin-bottom: 1.5rem;">\\n' +
  '    <h1 style="font-size: 2rem;">{project.title}</h1>\\n' +
  '    <p class="muted" style="margin-top: 0.5rem;">{project.summary}</p>\\n' +
  '  </div>\\n' +
  '  <!-- MAIN CONTENT AREA -->\\n' +
  '  <div class="proj-layout">\\n'
);

c = c.replace(/<div class="detail__main">/,
  '    <!-- Desktop Title -->\\n' +
  '    <header class="proj-header hide-sm" style="grid-area: title;">\\n' +
  '      <nav class="crumbs hide-sm" aria-label="Breadcrumb" style="margin-bottom:1rem;">\\n' +
  '        <a href="/">Home</a> <span>/</span>\\n' +
  '        <a href="/projects">Projects</a> <span>/</span>\\n' +
  '        <span class="muted">{project.title}</span>\\n' +
  '      </nav>\\n' +
  '      <h1 style="font-size: clamp(2rem, 4vw, 3rem); line-height: 1.2; margin: 0;">{project.title}</h1>\\n' +
  '      <p class="detail__summary" style="font-size: 1.1rem; color: var(--text-muted); margin-top: 1rem; max-width: 65ch;">{project.summary}</p>\\n' +
  '    </header>\\n'
);

const factsStrip = '<!-- Facts Strip -->\\n' +
  '<div class="facts" style="grid-area: facts; display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 1.25rem; background: var(--surface-2); border-radius: var(--r-md); border: 1px solid var(--border); margin-top: 1rem;">\\n' +
  '  <div><span class="muted" style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">Category</span><strong style="display:flex; align-items:center; gap:0.4rem;"><Icon name="layers" size={14} /> {project.category}</strong></div>\\n' +
  '  <div><span class="muted" style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">Difficulty</span><strong class={difficultyClass(project.difficulty)} style="display:flex; align-items:center; gap:0.4rem;"><Icon name="zap" size={14} /> {project.difficulty}</strong></div>\\n' +
  '  {project.build_time && <div><span class="muted" style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">Build time</span><strong style="display:flex; align-items:center; gap:0.4rem;"><Icon name="clock" size={14} /> {project.build_time}</strong></div>}\\n' +
  '  <div><span class="muted" style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">Parts</span><strong style="display:flex; align-items:center; gap:0.4rem;"><Icon name="cart" size={14} /> {project.bom.length} items</strong></div>\\n' +
  '</div>\\n' +
  '<!-- Content Area -->\\n' +
  '<div class="content" style="grid-area: content; min-width: 0; display: flex; flex-direction: column; gap: 2.5rem; margin-top: 1rem;">\\n';

c = c.replace(/<!-- Video -->/, factsStrip + '\\n\\n        <!-- Video -->');

c = c.replace(/<!-- SIDEBAR -->/,
  '    </div> <!-- End Content -->\\n' +
  '    <!-- Sidebar -->\\n' +
  '    <aside class="proj-sidebar" style="grid-area: sidebar;">\\n' +
  '      <div class="proj-sidebar-inner" style="position: sticky; top: calc(var(--header-h) + 1.5rem); display: flex; flex-direction: column; gap: 1.5rem;">\\n'
);

c = c.replace(/<aside class="detail__side">/, '<!-- sidebar replaced -->');

c = c.replace(/<\\/aside>/,
  '        <nav class="toc hide-sm" aria-label="Table of contents" style="background: var(--surface-2); padding: 1.25rem; border-radius: var(--r-md); border: 1px solid var(--border);">\\n' +
  '          <span class="toc-title" style="font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">On this page</span>\\n' +
  '          <ul class="toc-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">\\n' +
  '            {descHtml && <li><a href="#overview" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Overview</a></li>}\\n' +
  '            {project.bom.length > 0 && <li><a href="#parts" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Components &amp; parts</a></li>}\\n' +
  '            {project.pins && project.pins.length > 0 && <li><a href="#wiring" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Wiring &amp; connections</a></li>}\\n' +
  '            {project.steps && project.steps.length > 0 && <li><a href="#build" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Step-by-step build</a></li>}\\n' +
  '            {project.troubleshooting && project.troubleshooting.length > 0 && <li><a href="#troubleshooting" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Troubleshooting</a></li>}\\n' +
  '          </ul>\\n' +
  '        </nav>\\n' +
  '      </div>\\n' +
  '    </aside>\\n  </div>\\n</div>\\n<!-- end .container.dp -->'
);

c = c.replace(/<\\/style>/,
  '  .proj-layout {\\n' +
  '    display: grid;\\n' +
  '    grid-template-columns: 1fr 340px;\\n' +
  '    grid-template-areas:\\n' +
  '      "title sidebar"\\n' +
  '      "media sidebar"\\n' +
  '      "facts sidebar"\\n' +
  '      "content sidebar";\\n' +
  '    gap: 1.5rem 2.5rem;\\n' +
  '    align-items: start;\\n' +
  '  }\\n' +
  '  @media (max-width: 900px) {\\n' +
  '    .proj-layout {\\n' +
  '      grid-template-columns: 1fr;\\n' +
  '      grid-template-areas:\\n' +
  '        "title"\\n' +
  '        "media"\\n' +
  '        "facts"\\n' +
  '        "content"\\n' +
  '        "sidebar";\\n' +
  '      gap: 1.5rem;\\n' +
  '    }\\n' +
  '    .proj-sidebar-inner { position: static !important; }\\n' +
  '  }\\n' +
  '  .model3d { grid-area: media; }\\n' +
  '  .gallery { grid-area: media; }\\n' +
  '  .hide-sm { display: none; }\\n' +
  '  @media (min-width: 901px) { .hide-sm { display: block; } }\\n' +
  '  .hide-md { display: none; }\\n' +
  '  @media (max-width: 900px) { .hide-md { display: block; } }\\n' +
  '</style>'
);

fs.writeFileSync('src/pages/projects/[slug].astro', c);
