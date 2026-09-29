const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

// 1. Remove detail__head entirely
c = c.replace(/<header class="detail__head">[\s\S]*?<\/header>/, '');

// 2. Change detail__grid to proj-layout
c = c.replace(/<div class="detail__grid">/, 
  <div class="container dp" style="padding-top: 1rem;">
    <!-- Mobile Title (only visible on mobile) -->
    <div class="hide-md" style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 2rem;">{project.title}</h1>
      <p class="muted" style="margin-top: 0.5rem;">{project.summary}</p>
    </div>

    <!-- MAIN CONTENT AREA -->
    <div class="proj-layout">
);

// 3. Instead of detail__main, we have the Title area, Media area, Facts area, Content area
c = c.replace(/<div class="detail__main">/, 
      <!-- Desktop Title -->
      <header class="proj-header hide-sm" style="grid-area: title;">
        <nav class="crumbs" aria-label="Breadcrumb" style="margin-bottom:1rem;">
          <a href="/">Home</a> <span>/</span>
          <a href="/projects">Projects</a> <span>/</span>
          <span class="muted">{project.title}</span>
        </nav>
        <h1 style="font-size: clamp(2rem, 4vw, 3rem); line-height: 1.2; margin: 0;">{project.title}</h1>
        <p class="detail__summary" style="font-size: 1.1rem; color: var(--text-muted); margin-top: 1rem; max-width: 65ch;">{project.summary}</p>
      </header>
);

// 4. Wrap everything after Media (which is the Gallery and Model) in the Content area, and add Facts
// The facts strip:
const factsStrip = 
      <!-- Facts Strip -->
      <div class="facts" style="grid-area: facts; display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 1.25rem; background: var(--surface-2); border-radius: var(--r-md); border: 1px solid var(--border); margin-top: 1rem;">
        <div><span class="muted" style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">Category</span><strong style="display:flex; align-items:center; gap:0.4rem;"><Icon name="layers" size={14} /> {project.category}</strong></div>
        <div><span class="muted" style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">Difficulty</span><strong class={difficultyClass(project.difficulty)} style="display:flex; align-items:center; gap:0.4rem;"><Icon name="zap" size={14} /> {project.difficulty}</strong></div>
        {project.build_time && <div><span class="muted" style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">Build time</span><strong style="display:flex; align-items:center; gap:0.4rem;"><Icon name="clock" size={14} /> {project.build_time}</strong></div>}
        <div><span class="muted" style="display:block; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">Parts</span><strong style="display:flex; align-items:center; gap:0.4rem;"><Icon name="cart" size={14} /> {project.bom.length} items</strong></div>
      </div>
      
      <!-- Content Area -->
      <div class="content" style="grid-area: content; min-width: 0; display: flex; flex-direction: column; gap: 2.5rem; margin-top: 1rem;">
;

// Find where video starts to insert facts Strip and content wrapper
c = c.replace(/<!-- Video -->/, factsStrip + '\n\n        <!-- Video -->');

// 5. Fix the sidebar!
c = c.replace(/<!-- SIDEBAR -->/, 
      </div> <!-- End Content -->

      <!-- Sidebar -->
      <aside class="proj-sidebar" style="grid-area: sidebar;">
        <div class="proj-sidebar-inner" style="position: sticky; top: calc(var(--header-h) + 1.5rem); display: flex; flex-direction: column; gap: 1.5rem;">
);

// 6. Close the sidebar properly and add TOC
// Wait, TOC goes under the buy card
c = c.replace(/<\/aside>/, 
          <nav class="toc hide-sm" aria-label="Table of contents" style="background: var(--surface-2); padding: 1.25rem; border-radius: var(--r-md); border: 1px solid var(--border);">
            <span class="toc-title" style="font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); display: block; margin-bottom: 0.75rem;">On this page</span>
            <ul class="toc-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
              {descHtml && <li><a href="#overview" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Overview</a></li>}
              {project.bom.length > 0 && <li><a href="#parts" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Components &amp; parts</a></li>}
              {project.pins && project.pins.length > 0 && <li><a href="#wiring" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Wiring &amp; connections</a></li>}
              {project.steps && project.steps.length > 0 && <li><a href="#build" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Step-by-step build</a></li>}
              {project.troubleshooting && project.troubleshooting.length > 0 && <li><a href="#troubleshooting" style="color: var(--text); text-decoration: none; font-size: 0.95rem;">Troubleshooting</a></li>}
            </ul>
          </nav>
        </div>
      </aside>
);

// 7. Remove the crumbs that were on top of the original grid
c = c.replace(/<nav class="crumbs"[\s\S]*?<\/nav>/, '');

// 8. Add the CSS for proj-layout
c = c.replace(/<\/style>/, 
  .proj-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    grid-template-areas:
      "title sidebar"
      "media sidebar"
      "facts sidebar"
      "content sidebar";
    gap: 1.5rem 2.5rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .proj-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "title"
        "media"
        "facts"
        "content"
        "sidebar";
      gap: 1.5rem;
    }
    .proj-sidebar-inner { position: static !important; }
  }
  .model3d { grid-area: media; }
  .gallery { grid-area: media; }
  .hide-sm { display: none; }
  @media (min-width: 901px) { .hide-sm { display: block; } }
  .hide-md { display: none; }
  @media (max-width: 900px) { .hide-md { display: block; } }
</style>);

fs.writeFileSync('src/pages/projects/[slug].astro', c);
