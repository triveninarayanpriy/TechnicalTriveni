const fs = require('fs');
let c = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

c = c.replace(/components\?: Component\[\];\n\}/, "components?: Component[];\n  categories?: string[];\n  tags?: string[];\n}");
c = c.replace(/const \{ project, csrf, components = \[\] \} = Astro.props;/, "const { project, csrf, components = [], categories = [], tags = [] } = Astro.props;");

c = c.replace(/<input class="input" name="category" placeholder="Category" value=\{val\(p\?\.category\)\} list="cat-list" required \/>[\s\S]*?<\/datalist>/, 
`<select class="select" name="category" required>
  <option value="">— Select Category —</option>
  {[...new Set(["Robotics", "IoT & Smart Home", "Audio & Synth", "Wearables", "Tools & Jigs", ...categories])].map(cat => (
    <option value={cat} selected={p?.category === cat}>{cat}</option>
  ))}
</select>`);

c = c.replace(/<input class="input" name="tags" placeholder="arduino, drone, 3d-printing" value=\{val\(p\?\.tags\)\} \/>/, 
`<div class="tag-input" data-tags-wrapper>
  <input type="hidden" name="tags" value={val(p?.tags)} data-tags-hidden />
  <div class="tag-chips" data-tags-chips></div>
  <input class="input" type="text" placeholder="Type a tag & press Enter..." list="tag-suggestions" data-tags-input autocomplete="off" />
  <datalist id="tag-suggestions">
    {tags.map(t => <option value={t}></option>)}
  </datalist>
</div>`);

if (c.includes("data-tags-wrapper")) {
  c = c.replace(/<\/style>/, 
  `.tag-input { display: flex; flex-direction: column; gap: 0.5rem; }
  .tag-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  .tag-chip { display: inline-flex; align-items: center; gap: 0.25rem; background: var(--surface-2); padding: 0.2rem 0.6rem; border-radius: var(--r-full); font-size: var(--fs-xs); color: var(--text); border: 1px solid var(--border); }
  .tag-chip__del { cursor: pointer; color: var(--text-muted); display: grid; place-items: center; width: 14px; height: 14px; border-radius: 50%; }
  .tag-chip__del:hover { background: var(--danger); color: white; }
  </style>`);

  c = c.replace(/<\/script>/, 
  `// --- Tag Chips ---
  const tagsWrap = document.querySelector('[data-tags-wrapper]');
  if (tagsWrap) {
    const hidden = tagsWrap.querySelector('[data-tags-hidden]') as HTMLInputElement;
    const chips = tagsWrap.querySelector('[data-tags-chips]') as HTMLElement;
    const input = tagsWrap.querySelector('[data-tags-input]') as HTMLInputElement;
    
    let currentTags = hidden.value.split(',').map(t => t.trim()).filter(Boolean);
    
    function renderTags() {
      chips.innerHTML = '';
      hidden.value = currentTags.join(', ');
      currentTags.forEach((t, i) => {
        const span = document.createElement('span');
        span.className = 'tag-chip';
        span.textContent = t;
        const del = document.createElement('span');
        del.className = 'tag-chip__del';
        del.innerHTML = '&times;';
        del.onclick = () => { currentTags.splice(i, 1); renderTags(); };
        span.appendChild(del);
        chips.appendChild(span);
      });
    }
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = input.value.trim().replace(/,/g, '');
        if (val && !currentTags.includes(val)) {
          currentTags.push(val);
          renderTags();
        }
        input.value = '';
      }
    });
    
    renderTags();
  }
  </script>`);
}

fs.writeFileSync('src/components/ProjectEditor.astro', c);
