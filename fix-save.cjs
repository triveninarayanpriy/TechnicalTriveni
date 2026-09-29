const fs = require('fs');
let c = fs.readFileSync('src/pages/api/admin/project/save.ts', 'utf8');

const replacement = `
    sort: intField(form, 'sort', 0),
    meta_title: strField(form, 'meta_title', 140),
    meta_description: strField(form, 'meta_description', 500),
    og_image: strField(form, 'og_image', 500),
    arch_svg: strField(form, 'arch_svg', 100000),
    arch_image_url,
    arch_alt: strField(form, 'arch_alt', 300),
  };
`;

c = c.replace(/sort:\s*intField\(form,\s*'sort',\s*0\),\s*\};/g, replacement);

fs.writeFileSync('src/pages/api/admin/project/save.ts', c);
