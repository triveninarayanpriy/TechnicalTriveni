const fs = require("fs");
let c = fs.readFileSync("src/components/ProjectEditor.astro", "utf8");

// BOM reorder
c = c.replace(/<form method="post" action="\/api\/admin\/bom\/delete" class="inline-form">/, 
`{["up", "down"].map((dir) => (
  <form method="post" action="/api/admin/bom/move" class="inline-form">
    <input type="hidden" name="csrf" value={csrf} />
    <input type="hidden" name="id" value={b.id} />
    <input type="hidden" name="project_id" value={p.id} />
    <input type="hidden" name="dir" value={dir} />
    <button class="btn btn-ghost btn-xs" type="submit"><Icon name={dir === "up" ? "chevron-up" : "chevron-down"} size={13} /></button>
  </form>
))}
<form method="post" action="/api/admin/bom/delete" class="inline-form">`);

// Wiring Diagrams reorder
c = c.replace(/<form method="post" action="\/api\/admin\/wiring\/delete" class="inline-form">/, 
`{["up", "down"].map((dir) => (
  <form method="post" action="/api/admin/wiring/move" class="inline-form">
    <input type="hidden" name="csrf" value={csrf} />
    <input type="hidden" name="id" value={w.id} />
    <input type="hidden" name="project_id" value={p.id} />
    <input type="hidden" name="dir" value={dir} />
    <button class="btn btn-ghost btn-xs" type="submit"><Icon name={dir === "up" ? "chevron-up" : "chevron-down"} size={13} /></button>
  </form>
))}
<form method="post" action="/api/admin/wiring/delete" class="inline-form">`);

// Pins reorder
c = c.replace(/<form method="post" action="\/api\/admin\/pin\/delete" class="inline-form">/, 
`{["up", "down"].map((dir) => (
  <form method="post" action="/api/admin/pin/move" class="inline-form">
    <input type="hidden" name="csrf" value={csrf} />
    <input type="hidden" name="id" value={pin.id} />
    <input type="hidden" name="project_id" value={p.id} />
    <input type="hidden" name="dir" value={dir} />
    <button class="btn btn-ghost btn-xs" type="submit"><Icon name={dir === "up" ? "chevron-up" : "chevron-down"} size={13} /></button>
  </form>
))}
<form method="post" action="/api/admin/pin/delete" class="inline-form">`);

fs.writeFileSync("src/components/ProjectEditor.astro", c);
