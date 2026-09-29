const fs = require('fs');
let c = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

function wrapWithPreview(nameMatch, placeholderMatch) {
  const re = new RegExp(`<textarea class="textarea" name="${nameMatch}"[^>]*>[\\s\\S]*?<\\/textarea>`);
  const match = c.match(re);
  if (!match) return;
  const originalTextarea = match[0].replace('class="textarea"', `class="textarea" data-md-input="${nameMatch}"`);
  
  const wrapper = `<div class="md-editor">
    <div class="md-tabs">
      <button type="button" class="md-tab is-active" data-md-tab="edit" data-md-target="${nameMatch}">Edit</button>
      <button type="button" class="md-tab" data-md-tab="preview" data-md-target="${nameMatch}">Preview</button>
    </div>
    <div class="md-pane is-active" data-md-pane="edit" data-md-for="${nameMatch}">
      ${originalTextarea}
    </div>
    <div class="md-pane prose" data-md-pane="preview" data-md-for="${nameMatch}" style="padding: 1rem; border: 1px solid var(--border); border-radius: 0 0 var(--r-sm) var(--r-sm); background: var(--bg-2); min-height: 100px;">
      <span class="dim">Loading preview...</span>
    </div>
  </div>`;
  
  c = c.replace(match[0], wrapper);
}

wrapWithPreview("description", "Project story & description");
wrapWithPreview("safety_note", "Safety warnings");
wrapWithPreview("credits", "Credits");
wrapWithPreview("body", "Instruction \\(Markdown\\)");

if (c.includes('md-editor')) {
  c = c.replace(/<\/style>/, 
  `.md-editor { display: flex; flex-direction: column; }
  .md-tabs { display: flex; gap: 2px; }
  .md-tab { padding: 0.4rem 1rem; font-size: var(--fs-xs); background: var(--surface-2); border: 1px solid var(--border); border-bottom: none; border-radius: var(--r-sm) var(--r-sm) 0 0; cursor: pointer; color: var(--text-muted); }
  .md-tab.is-active { background: var(--bg); color: var(--text); font-weight: 500; position: relative; top: 1px; border-bottom: 1px solid var(--bg); }
  .md-pane { display: none; }
  .md-pane.is-active { display: block; }
  .md-pane[data-md-pane="edit"] .textarea { border-top-left-radius: 0; }
  </style>`);

  c = c.replace(/<script>/, `<script>
  import { marked } from 'marked';

  document.querySelectorAll('.md-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-md-target');
      const tabType = btn.getAttribute('data-md-tab');
      const container = btn.closest('.md-editor');
      
      // Update tabs
      container.querySelectorAll('.md-tab').forEach(b => b.classList.toggle('is-active', b === btn));
      
      // Update panes
      container.querySelectorAll('.md-pane').forEach(p => {
        p.classList.toggle('is-active', p.getAttribute('data-md-pane') === tabType);
      });
      
      // Render markdown if preview
      if (tabType === 'preview') {
        const input = container.querySelector('[data-md-input]');
        const preview = container.querySelector('[data-md-pane="preview"]');
        if (input && preview) {
          preview.innerHTML = marked.parse(input.value || '*No content*');
        }
      }
    });
  });`);
}

fs.writeFileSync('src/components/ProjectEditor.astro', c);
