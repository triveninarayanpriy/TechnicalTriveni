const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace(
  /\.proj-layout \{\s*display: grid;\s*grid-template-columns: 1fr 340px;\s*grid-template-areas:[^}]+}/m,
  .proj-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    grid-template-areas:
      "title title"
      "media media"
      "facts sidebar"
      "content sidebar";
    gap: 1.5rem 2.5rem;
    align-items: start;
  }
);

c = c.replace(
  /@media \(max-width: 900px\) \{\s*\.proj-layout \{\s*grid-template-columns: 1fr;\s*grid-template-areas:[^}]+}/m,
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
);

c = c.replace(
  /\.content \{\s*grid-area: content;\s*display: flex;/m,
  .content { grid-area: content; min-width: 0; display: flex;
);

fs.writeFileSync('src/pages/projects/[slug].astro', c);
