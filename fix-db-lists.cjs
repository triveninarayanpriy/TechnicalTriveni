const fs = require("fs");
let c = fs.readFileSync("src/lib/db.ts", "utf8");

const funcs = `
export async function listCategories(db: D1Database): Promise<string[]> {
  const res = await db.prepare("SELECT DISTINCT category FROM projects WHERE category != ' ORDER BY category ASC").all<{ category: string }>();
  return (res.results ?? []).map(r => r.category);
}
export async function listTags(db: D1Database): Promise<string[]> {
  const res = await db.prepare("SELECT tags FROM projects WHERE tags != '").all<{ tags: string }>();
  const allTags = new Set<string>();
  for (const r of res.results ?? []) {
    for (const t of r.tags.split(",")) {
      if (t.trim()) allTags.add(t.trim());
    }
  }
  return Array.from(allTags).sort();
}
`;

c = c + funcs;
fs.writeFileSync("src/lib/db.ts", c);
