const fs = require("fs");

let idAstro = fs.readFileSync("src/pages/admin/projects/[id].astro", "utf8");
idAstro = idAstro.replace(/import \{ getProjectFullById, listComponents \} from '..\/..\/..\/lib\/db';/, "import { getProjectFullById, listComponents, listCategories, listTags } from '../../../lib/db';");
idAstro = idAstro.replace(/const components = await listComponents\(env\.DB\);/, "const components = await listComponents(env.DB);\nconst categories = await listCategories(env.DB);\nconst tags = await listTags(env.DB);");
idAstro = idAstro.replace(/<ProjectEditor project=\{project\} csrf=\{csrf\} components=\{components\} \/>/, "<ProjectEditor project={project} csrf={csrf} components={components} categories={categories} tags={tags} />");
fs.writeFileSync("src/pages/admin/projects/[id].astro", idAstro);

let newAstro = fs.readFileSync("src/pages/admin/projects/new.astro", "utf8");
newAstro = newAstro.replace(/import \{ listComponents \} from '..\/..\/..\/lib\/db';/, "import { listComponents, listCategories, listTags } from '../../../lib/db';");
newAstro = newAstro.replace(/const components = await listComponents\(env\.DB\);/, "const components = await listComponents(env.DB);\nconst categories = await listCategories(env.DB);\nconst tags = await listTags(env.DB);");
newAstro = newAstro.replace(/<ProjectEditor project=\{null\} csrf=\{csrf\} components=\{components\} \/>/, "<ProjectEditor project={null} csrf={csrf} components={components} categories={categories} tags={tags} />");
fs.writeFileSync("src/pages/admin/projects/new.astro", newAstro);
