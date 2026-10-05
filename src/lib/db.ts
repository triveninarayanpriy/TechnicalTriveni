/**
 * Typed data-access layer over Cloudflare D1.
 * All SQL is parameterized (never string-interpolated) to prevent injection.
 */

/* --------------------------------------------------------------- types --- */
export interface Project {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  difficulty: string;
  cover_image: string;
  video_url: string;
  model_url: string;
  is_new: number;
  tags: string;
  build_time: string;
  outcome_line: string;
  cost_override: number;
  cost_checked: string;
  safety_note: string;
  license: string;
  credits: string;
  code_repo_url: string;
  price_inr: number;
  combo_enabled: number;
  combo_title: string;
  combo_description: string;
  featured: number;
  published: number;
  sort: number;
  meta_title: string;
  meta_description: string;
  og_image: string;
  arch_svg: string;
  arch_image_url: string;
  arch_alt: string;
  layout_version: number;
  prereqs_json: string;
  not_included_json: string;
  outcomes_json: string;
  faq_json: string;
  changelog: string;
  created_at: number;
  updated_at: number;
}

export interface Component {
  id: number; name: string; store: string; buy_url: string; is_affiliate: number;
  unit_price_inr: number; price_checked: string; notes: string; created_at: number; updated_at: number;
}

export interface Page {
  slug: string; title: string; content_md: string; image_url: string; updated_at: number;
}

export interface ProjectImage {
  id: number; project_id: number; url: string; caption: string; sort: number; kind: string;
}
export interface ProjectFile {
  id: number; project_id: number; label: string; kind: string; r2_key: string;
  filename: string; size_bytes: number; is_free: number; in_combo: number; sort: number; created_at: number;
}
export interface BomItem {
  id: number; project_id: number; name: string; qty: string; notes: string;
  store: string; affiliate_url: string; unit_price_inr: number; sort: number;
  price_checked: string; is_affiliate: number; component_id: number; is_required: number; group_name: string; stage_tag: string;
}
export interface ProjectStep {
  id: number; project_id: number; title: string; body: string; why: string; image_url: string; sort: number;
  goal: string; time_est: string; parts_needed: string; file_id: number | null; expected_res: string; if_fails: string; video_ts: string;
}
export interface ProjectWiringDiagram {
  id: number; project_id: number; url: string; label: string; module: string; sort: number;
}

export interface ProjectPin {
  id: number; project_id: number; from_pin: string; to_pin: string; note: string; module: string; sort: number;
}
export interface Troubleshoot {
  id: number; project_id: number; symptom: string; fix: string; sort: number;
}
export interface ProjectLink {
  id: number; project_id: number; label: string; url: string; kind: string; sort: number;
}
export interface Order {
  id: string; project_id: number; project_title: string; email: string;
  amount_inr: number; currency: string; status: string;
  razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
  download_token: string; created_at: number; paid_at: number | null;
}
export interface ContactMessage {
  id: number; name: string; email: string; subject: string; message: string;
  handled: number; created_at: number;
}

export interface ProjectFull extends Project {
  images: ProjectImage[];
  files: ProjectFile[];
  bom: BomItem[];
  links: ProjectLink[];
  steps: ProjectStep[];
  pins: ProjectPin[];
  wiring_diagrams: ProjectWiringDiagram[];
  troubleshooting: Troubleshoot[];
}

const now = () => Math.floor(Date.now() / 1000);

/* ------------------------------------------------------------ projects --- */

export interface ListOpts {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'featured' | 'newest';
}

function buildWhere(opts: ListOpts): { clause: string; binds: unknown[] } {
  const where: string[] = [];
  const binds: unknown[] = [];
  if (opts.publishedOnly) where.push('published = 1');
  if (opts.featuredOnly) where.push('featured = 1');
  if (opts.category && opts.category !== 'All') { where.push('category = ?'); binds.push(opts.category); }
  if (opts.search) {
    where.push('(title LIKE ? OR summary LIKE ? OR tags LIKE ?)');
    const s = `%${opts.search}%`;
    binds.push(s, s, s);
  }
  return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', binds };
}

export async function listProjects(db: D1Database, opts: ListOpts = {}): Promise<Project[]> {
  const { clause, binds } = buildWhere(opts);
  const order =
    opts.orderBy === 'newest'
      ? 'ORDER BY created_at DESC, id DESC'
      : 'ORDER BY featured DESC, sort ASC, created_at DESC';
  let tail = '';
  if (opts.limit) {
    tail = `LIMIT ${Math.max(1, Math.min(100, opts.limit | 0))}`;
    if (opts.offset && opts.offset > 0) tail += ` OFFSET ${opts.offset | 0}`;
  }
  const sql = `SELECT * FROM projects ${clause} ${order} ${tail}`;
  const res = await db.prepare(sql).bind(...binds).all<Project>();
  return res.results ?? [];
}

export async function countProjects(db: D1Database, opts: ListOpts = {}): Promise<number> {
  const { clause, binds } = buildWhere(opts);
  const row = await db.prepare(`SELECT COUNT(*) AS n FROM projects ${clause}`).bind(...binds).first<{ n: number }>();
  return row?.n ?? 0;
}

export async function getProjectBySlug(
  db: D1Database, slug: string, includeUnpublished = false,
): Promise<Project | null> {
  const sql = includeUnpublished
    ? 'SELECT * FROM projects WHERE slug = ?'
    : 'SELECT * FROM projects WHERE slug = ? AND published = 1';
  return (await db.prepare(sql).bind(slug).first<Project>()) ?? null;
}

export async function getProjectById(db: D1Database, id: number): Promise<Project | null> {
  return (await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<Project>()) ?? null;
}

export async function getProjectFull(
  db: D1Database, slug: string, includeUnpublished = false,
): Promise<ProjectFull | null> {
  const project = await getProjectBySlug(db, slug, includeUnpublished);
  if (!project) return null;
  return withChildren(db, project);
}

async function withChildren(db: D1Database, project: Project): Promise<ProjectFull> {
  const id = project.id;
  const [images, files, bom, links, steps, pins, trouble, wiring] = await Promise.all([
    db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort').bind(id).all<ProjectImage>(),
    db.prepare('SELECT * FROM project_files WHERE project_id = ? ORDER BY sort').bind(id).all<ProjectFile>(),
    db.prepare('SELECT * FROM bom_items WHERE project_id = ? ORDER BY sort').bind(id).all<BomItem>(),
    db.prepare('SELECT * FROM project_links WHERE project_id = ? ORDER BY sort').bind(id).all<ProjectLink>(),
    db.prepare('SELECT * FROM project_steps WHERE project_id = ? ORDER BY sort, id').bind(id).all<ProjectStep>(),
    db.prepare('SELECT * FROM project_pins WHERE project_id = ? ORDER BY sort, id').bind(id).all<ProjectPin>(),
    db.prepare('SELECT * FROM project_troubleshooting WHERE project_id = ? ORDER BY sort, id').bind(id).all<Troubleshoot>(),
    db.prepare('SELECT * FROM project_wiring_diagrams WHERE project_id = ? ORDER BY sort, id').bind(id).all<ProjectWiringDiagram>(),
  ]);
  // Resolve library components → live price / link / name reflect everywhere.
  let bomRows = bom.results ?? [];
  const refIds = [...new Set(bomRows.filter((b) => b.component_id > 0).map((b) => b.component_id))];
  if (refIds.length) {
    const placeholders = refIds.map(() => '?').join(',');
    const comps = await db.prepare(`SELECT * FROM components WHERE id IN (${placeholders})`).bind(...refIds).all<Component>();
    const map = new Map((comps.results ?? []).map((c) => [c.id, c]));
    bomRows = bomRows.map((b) => {
      const c = b.component_id > 0 ? map.get(b.component_id) : undefined;
      return c
        ? { ...b, name: c.name, store: c.store, affiliate_url: c.buy_url, unit_price_inr: c.unit_price_inr, price_checked: c.price_checked, is_affiliate: c.is_affiliate }
        : b;
    });
  }

  return {
    ...project,
    images: images.results ?? [],
    files: files.results ?? [],
    bom: bomRows,
    links: links.results ?? [],
    steps: steps.results ?? [],
    pins: pins.results ?? [],
    troubleshooting: trouble.results ?? [],
    wiring_diagrams: wiring.results ?? [],
  };
}

export async function getProjectFullById(db: D1Database, id: number): Promise<ProjectFull | null> {
  const project = await getProjectById(db, id);
  if (!project) return null;
  return withChildren(db, project);
}

export async function slugExists(db: D1Database, slug: string, exceptId = 0): Promise<boolean> {
  const row = await db.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').bind(slug, exceptId).first<{ id: number }>();
  return !!row;
}

export async function distinctCategories(db: D1Database): Promise<string[]> {
  const res = await db
    .prepare('SELECT DISTINCT category FROM projects WHERE published = 1 ORDER BY category')
    .all<{ category: string }>();
  return (res.results ?? []).map((r) => r.category);
}

export async function createProject(db: D1Database, p: Partial<Project> & { slug: string; title: string }): Promise<number> {
  const t = now();
  const res = await db.prepare(
    `INSERT INTO projects
      (slug,title,summary,description,category,difficulty,cover_image,video_url,model_url,is_new,tags,build_time,
       outcome_line,cost_override,cost_checked,safety_note,license,credits,code_repo_url,
       price_inr,combo_enabled,combo_title,combo_description,featured,published,sort,
       meta_title,meta_description,og_image,arch_svg,arch_image_url,arch_alt,layout_version,prereqs_json,not_included_json,outcomes_json,faq_json,changelog,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    p.slug, p.title, p.summary ?? '', p.description ?? '', p.category ?? 'Electronics',
    p.difficulty ?? 'Beginner', p.cover_image ?? '', p.video_url ?? '', p.model_url ?? '', p.is_new ?? 0,
    p.tags ?? '', p.build_time ?? '',
    p.outcome_line ?? '', p.cost_override ?? 0, p.cost_checked ?? '', p.safety_note ?? '',
    p.license ?? 'MIT', p.credits ?? '', p.code_repo_url ?? '',
    p.price_inr ?? 0, p.combo_enabled ?? 0, p.combo_title ?? 'Complete Project Combo',
    p.combo_description ?? '', p.featured ?? 0, p.published ?? 0, p.sort ?? 0,
    p.meta_title ?? '', p.meta_description ?? '', p.og_image ?? '', p.arch_svg ?? '', p.arch_image_url ?? '', p.arch_alt ?? '', p.layout_version ?? 1, p.prereqs_json ?? '[]', p.not_included_json ?? '[]', p.outcomes_json ?? '[]', p.faq_json ?? '[]', p.changelog ?? '', t, t,
  ).run();
  return res.meta.last_row_id as number;
}

export async function updateProject(db: D1Database, id: number, p: Partial<Project>): Promise<void> {
  const fields = [
    'slug', 'title', 'summary', 'description', 'category', 'difficulty', 'cover_image',
    'video_url', 'model_url', 'is_new', 'tags', 'build_time',
    'outcome_line', 'cost_override', 'cost_checked', 'safety_note', 'license', 'credits', 'code_repo_url',
    'price_inr', 'combo_enabled', 'combo_title',
    'combo_description', 'featured', 'published', 'sort',
    'meta_title', 'meta_description', 'og_image', 'arch_svg', 'arch_image_url', 'arch_alt', 'layout_version', 'prereqs_json', 'not_included_json', 'outcomes_json', 'faq_json', 'changelog',
  ] as const;
  const sets: string[] = [];
  const binds: unknown[] = [];
  for (const f of fields) {
    if (p[f] !== undefined) { sets.push(`${f} = ?`); binds.push(p[f]); }
  }
  sets.push('updated_at = ?'); binds.push(now());
  binds.push(id);
  await db.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run();
}

export async function deleteProject(db: D1Database, id: number): Promise<void> {
  // Children cascade via FK; also delete explicitly for engines without cascade.
  await db.batch([
    db.prepare('DELETE FROM project_images WHERE project_id = ?').bind(id),
    db.prepare('DELETE FROM project_files WHERE project_id = ?').bind(id),
    db.prepare('DELETE FROM bom_items WHERE project_id = ?').bind(id),
    db.prepare('DELETE FROM project_links WHERE project_id = ?').bind(id),
    db.prepare('DELETE FROM projects WHERE id = ?').bind(id),
  ]);
}

/* ------------------------------------------------------ child records ---- */

export async function addImage(db: D1Database, projectId: number, url: string, caption = '', kind = 'image') {
  const row = await db.prepare('SELECT COALESCE(MAX(sort),-1)+1 AS n FROM project_images WHERE project_id = ?')
    .bind(projectId).first<{ n: number }>();
  const sort = row?.n ?? 0;
  await db.prepare('INSERT INTO project_images (project_id,url,caption,sort,kind) VALUES (?,?,?,?,?)')
    .bind(projectId, url, caption, sort, kind).run();
}
export async function deleteImage(db: D1Database, id: number) {
  await db.prepare('DELETE FROM project_images WHERE id = ?').bind(id).run();
}
export async function updateImageKind(db: D1Database, id: number, kind: string) {
  await db.prepare('UPDATE project_images SET kind = ? WHERE id = ?').bind(kind, id).run();
}

export async function addWiringDiagram(db: D1Database, project_id: number, url: string, label: string, module: string) {
  const row = await db.prepare('SELECT COALESCE(MAX(sort),-1)+1 AS n FROM project_wiring_diagrams WHERE project_id = ?').bind(project_id).first<{ n: number }>();
  await db.prepare('INSERT INTO project_wiring_diagrams (project_id,url,label,module,sort) VALUES (?,?,?,?,?)')
    .bind(project_id, url, label, module, row?.n ?? 0).run();
}
export async function deleteWiringDiagram(db: D1Database, id: number) {
  await db.prepare('DELETE FROM project_wiring_diagrams WHERE id = ?').bind(id).run();
}
export async function getImages(db: D1Database, projectId: number): Promise<ProjectImage[]> {
  const res = await db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort, id')
    .bind(projectId).all<ProjectImage>();
  return res.results ?? [];
}
/** Swap a gallery item's order with its neighbour ('up' = earlier). */
export async function moveImage(db: D1Database, id: number, projectId: number, dir: 'up' | 'down') {
  const items = await getImages(db, projectId);
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const swapWith = dir === 'up' ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= items.length) return;
  const a = items[idx];
  const b = items[swapWith];
  await db.batch([
    db.prepare('UPDATE project_images SET sort = ? WHERE id = ?').bind(b.sort, a.id),
    db.prepare('UPDATE project_images SET sort = ? WHERE id = ?').bind(a.sort, b.id),
  ]);
}
/**
 * Derive the project's cover + 3D model from the ordered gallery:
 *   cover_image = first image · model_url = first 3D model.
 * The first item overall is the "lead" media (a 3D leads when it's first).
 */
export async function syncProjectMedia(db: D1Database, projectId: number) {
  const items = await getImages(db, projectId);
  const firstImage = items.find((i) => i.kind !== 'model');
  const firstModel = items.find((i) => i.kind === 'model');
  await db.prepare('UPDATE projects SET cover_image = ?, model_url = ?, updated_at = ? WHERE id = ?')
    .bind(firstImage?.url ?? '', firstModel?.url ?? '', Math.floor(Date.now() / 1000), projectId)
    .run();
}

export async function addFile(db: D1Database, f: Omit<ProjectFile, 'id' | 'created_at'>) {
  await db.prepare(
    `INSERT INTO project_files (project_id,label,kind,r2_key,filename,size_bytes,is_free,in_combo,sort,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
  ).bind(f.project_id, f.label, f.kind, f.r2_key, f.filename, f.size_bytes, f.is_free, f.in_combo, f.sort, now()).run();
}
export async function getFileById(db: D1Database, id: number): Promise<ProjectFile | null> {
  return (await db.prepare('SELECT * FROM project_files WHERE id = ?').bind(id).first<ProjectFile>()) ?? null;
}
export async function deleteFile(db: D1Database, id: number) {
  await db.prepare('DELETE FROM project_files WHERE id = ?').bind(id).run();
}
export async function getComboFiles(db: D1Database, projectId: number): Promise<ProjectFile[]> {
  const res = await db.prepare('SELECT * FROM project_files WHERE project_id = ? AND in_combo = 1 ORDER BY sort')
    .bind(projectId).all<ProjectFile>();
  return res.results ?? [];
}

export async function addBom(db: D1Database, b: Omit<BomItem, 'id'>) {
  await db.prepare(
    'INSERT INTO bom_items (project_id,name,qty,notes,store,affiliate_url,unit_price_inr,price_checked,is_affiliate,component_id,is_required,group_name,stage_tag,sort) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  ).bind(b.project_id, b.name, b.qty, b.notes, b.store, b.affiliate_url, b.unit_price_inr, b.price_checked ?? '', b.is_affiliate ?? 0, b.component_id ?? 0, b.is_required ?? 1, b.group_name ?? '', b.stage_tag ?? '', b.sort).run();
}

/* -------------------------------------------------- component library ---- */
export async function listComponents(db: D1Database): Promise<Component[]> {
  const res = await db.prepare('SELECT * FROM components ORDER BY name').all<Component>();
  return res.results ?? [];
}
export async function getComponent(db: D1Database, id: number): Promise<Component | null> {
  return (await db.prepare('SELECT * FROM components WHERE id = ?').bind(id).first<Component>()) ?? null;
}
export async function addComponent(db: D1Database, c: Partial<Component> & { name: string }): Promise<number> {
  const t = now();
  const res = await db.prepare(
    'INSERT INTO components (name,store,buy_url,is_affiliate,unit_price_inr,price_checked,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
  ).bind(c.name, c.store ?? '', c.buy_url ?? '', c.is_affiliate ?? 0, c.unit_price_inr ?? 0, c.price_checked ?? '', c.notes ?? '', t, t).run();
  return res.meta.last_row_id as number;
}
export async function updateComponent(db: D1Database, id: number, c: Partial<Component>): Promise<void> {
  const fields = ['name', 'store', 'buy_url', 'is_affiliate', 'unit_price_inr', 'price_checked', 'notes'] as const;
  const sets: string[] = []; const binds: unknown[] = [];
  for (const f of fields) if (c[f] !== undefined) { sets.push(`${f} = ?`); binds.push(c[f]); }
  if (!sets.length) return;
  sets.push('updated_at = ?'); binds.push(now()); binds.push(id);
  await db.prepare(`UPDATE components SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run();
}
export async function deleteComponent(db: D1Database, id: number): Promise<void> {
  // Detach any BOM rows that referenced it (keep their last-known values).
  await db.batch([
    db.prepare('UPDATE bom_items SET component_id = 0 WHERE component_id = ?').bind(id),
    db.prepare('DELETE FROM components WHERE id = ?').bind(id),
  ]);
}

export async function updateBom(db: D1Database, id: number, b: Partial<BomItem>) {
  const fields = ['name', 'qty', 'notes', 'store', 'affiliate_url', 'unit_price_inr', 'price_checked', 'is_affiliate', 'component_id', 'is_required', 'group_name', 'stage_tag', 'sort'];
  const sets = [];
  const binds = [];
  for (const f of fields) {
    if (b[f] !== undefined) {
      sets.push(f + ' = ?');
      binds.push(b[f]);
    }
  }
  if (sets.length === 0) return;
  binds.push(id);
  await db.prepare('UPDATE bom_items SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}

export async function updateStep(db: D1Database, id: number, b: Partial<ProjectStep>) {
  const fields = ['title', 'body', 'why', 'image_url', 'goal', 'time_est', 'parts_needed', 'file_id', 'expected_res', 'if_fails', 'video_ts', 'sort'];
  const sets = [];
  const binds = [];
  for (const f of fields) {
    if (b[f] !== undefined) {
      sets.push(f + ' = ?');
      binds.push(b[f]);
    }
  }
  if (sets.length === 0) return;
  binds.push(id);
  await db.prepare('UPDATE project_steps SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}

export async function updateTrouble(db: D1Database, id: number, b: any) {
  const fields = ['symptom', 'fix', 'sort'];
  const sets = [];
  const binds = [];
  for (const f of fields) {
    if (b[f] !== undefined) {
      sets.push(f + ' = ?');
      binds.push(b[f]);
    }
  }
  if (sets.length === 0) return;
  binds.push(id);
  await db.prepare('UPDATE project_troubleshooting SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}

export async function updatePin(db: D1Database, id: number, b: Partial<ProjectPin>) {
  const fields = ['from_pin', 'to_pin', 'note', 'module', 'sort'];
  const sets = [];
  const binds = [];
  for (const f of fields) {
    if (b[f] !== undefined) {
      sets.push(f + ' = ?');
      binds.push(b[f]);
    }
  }
  if (sets.length === 0) return;
  binds.push(id);
  await db.prepare('UPDATE project_pins SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}

export async function updateFile(db: D1Database, id: number, b: Partial<ProjectFile>) {
  const fields = ['label', 'kind', 'is_free', 'in_combo', 'sort'];
  const sets = [];
  const binds = [];
  for (const f of fields) {
    if (b[f] !== undefined) {
      sets.push(f + ' = ?');
      binds.push(b[f]);
    }
  }
  if (sets.length === 0) return;
  binds.push(id);
  await db.prepare('UPDATE project_files SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}

export async function deleteBom(db: D1Database, id: number) {
  await db.prepare('DELETE FROM bom_items WHERE id = ?').bind(id).run();
}

/* --- build steps --- */
export async function addStep(db: D1Database, s: Omit<ProjectStep, "id" | "sort">) {
  const row = await db.prepare("SELECT COALESCE(MAX(sort),-1)+1 AS n FROM project_steps WHERE project_id = ?").bind(s.project_id).first();
  await db.prepare("INSERT INTO project_steps (project_id,title,body,why,image_url,sort,goal,time_est,parts_needed,file_id,expected_res,if_fails,video_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .bind(s.project_id, s.title, s.body || "", s.why || "", s.image_url || "", (row && row.n) ? row.n : 0, s.goal || "", s.time_est || "", s.parts_needed || "", s.file_id || null, s.expected_res || "", s.if_fails || "", s.video_ts || "").run();
}
export async function deleteStep(db: D1Database, id: number) {
  await db.prepare('DELETE FROM project_steps WHERE id = ?').bind(id).run();
}
export async function moveStep(db: D1Database, id: number, projectId: number, dir: 'up' | 'down') {
  await swapSort(db, 'project_steps', id, projectId, dir);
}

/* --- pin connections --- */
export async function addPin(db: D1Database, p: Omit<ProjectPin, 'id' | 'sort'>) {
  const row = await db.prepare('SELECT COALESCE(MAX(sort),-1)+1 AS n FROM project_pins WHERE project_id = ?').bind(p.project_id).first<{ n: number }>();
  await db.prepare('INSERT INTO project_pins (project_id,from_pin,to_pin,note,sort) VALUES (?,?,?,?,?)')
    .bind(p.project_id, p.from_pin, p.to_pin, p.note, row?.n ?? 0).run();
}
export async function deletePin(db: D1Database, id: number) {
  await db.prepare('DELETE FROM project_pins WHERE id = ?').bind(id).run();
}

/* --- troubleshooting --- */
export async function addTrouble(db: D1Database, t: Omit<Troubleshoot, 'id' | 'sort'>) {
  const row = await db.prepare('SELECT COALESCE(MAX(sort),-1)+1 AS n FROM project_troubleshooting WHERE project_id = ?').bind(t.project_id).first<{ n: number }>();
  await db.prepare('INSERT INTO project_troubleshooting (project_id,symptom,fix,sort) VALUES (?,?,?,?)')
    .bind(t.project_id, t.symptom, t.fix, row?.n ?? 0).run();
}
export async function deleteTrouble(db: D1Database, id: number) {
  await db.prepare('DELETE FROM project_troubleshooting WHERE id = ?').bind(id).run();
}

/** Swap a row's sort with its neighbour in any ordered child table. */
export async function swapSort(db: D1Database, table: string, id: number, projectId: number, dir: 'up' | 'down') {
  const res = await db.prepare(`SELECT id, sort FROM ${table} WHERE project_id = ? ORDER BY sort, id`).bind(projectId).all<{ id: number; sort: number }>();
  const items = res.results ?? [];
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const j = dir === 'up' ? idx - 1 : idx + 1;
  if (j < 0 || j >= items.length) return;
  await db.batch([
    db.prepare(`UPDATE ${table} SET sort = ? WHERE id = ?`).bind(items[j].sort, items[idx].id),
    db.prepare(`UPDATE ${table} SET sort = ? WHERE id = ?`).bind(items[idx].sort, items[j].id),
  ]);
}

export async function addLink(db: D1Database, l: Omit<ProjectLink, 'id'>) {
  await db.prepare('INSERT INTO project_links (project_id,label,url,kind,sort) VALUES (?,?,?,?,?)')
    .bind(l.project_id, l.label, l.url, l.kind, l.sort).run();
}
export async function deleteLink(db: D1Database, id: number) {
  await db.prepare('DELETE FROM project_links WHERE id = ?').bind(id).run();
}

/* -------------------------------------------------------------- orders --- */

export async function createOrder(db: D1Database, o: {
  id: string; project_id: number; project_title: string; email: string; amount_inr: number;
}): Promise<void> {
  await db.prepare(
    `INSERT INTO orders (id,project_id,project_title,email,amount_inr,status,created_at)
     VALUES (?,?,?,?,?,'created',?)`,
  ).bind(o.id, o.project_id, o.project_title, o.email, o.amount_inr, now()).run();
}
export async function getOrder(db: D1Database, id: string): Promise<Order | null> {
  return (await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first<Order>()) ?? null;
}
export async function getOrderByRazorpayId(db: D1Database, rzpOrderId: string): Promise<Order | null> {
  return (await db.prepare('SELECT * FROM orders WHERE razorpay_order_id = ?').bind(rzpOrderId).first<Order>()) ?? null;
}
export async function setOrderRazorpayId(db: D1Database, id: string, rzpOrderId: string): Promise<void> {
  await db.prepare('UPDATE orders SET razorpay_order_id = ? WHERE id = ?').bind(rzpOrderId, id).run();
}
export async function markOrderPaid(
  db: D1Database, id: string, paymentId: string, signature: string, downloadToken: string,
): Promise<void> {
  await db.prepare(
    `UPDATE orders SET status='paid', razorpay_payment_id=?, razorpay_signature=?, download_token=?, paid_at=?
     WHERE id = ?`,
  ).bind(paymentId, signature, downloadToken, now(), id).run();
}
export async function listRecentOrders(db: D1Database, limit = 100): Promise<Order[]> {
  const res = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?')
    .bind(Math.min(500, limit)).all<Order>();
  return res.results ?? [];
}
export async function getOrdersByEmail(db: D1Database, email: string): Promise<Order[]> {
  const res = await db.prepare("SELECT * FROM orders WHERE email = ? AND status='paid' ORDER BY created_at DESC")
    .bind(email).all<Order>();
  return res.results ?? [];
}

/* ------------------------------------------------------------ settings --- */

export async function getSetting(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value ?? null;
}
export async function getSettings(db: D1Database): Promise<Record<string, string>> {
  const res = await db.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
  const out: Record<string, string> = {};
  for (const r of res.results ?? []) out[r.key] = r.value;
  return out;
}
export async function setSetting(db: D1Database, key: string, value: string): Promise<void> {
  await db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .bind(key, value).run();
}

/* ------------------------------------------------------------ contact ---- */

export async function addContactMessage(db: D1Database, m: {
  name: string; email: string; subject: string; message: string;
}): Promise<void> {
  await db.prepare('INSERT INTO contact_messages (name,email,subject,message,created_at) VALUES (?,?,?,?,?)')
    .bind(m.name, m.email, m.subject, m.message, now()).run();
}
export async function listContactMessages(db: D1Database, limit = 100): Promise<ContactMessage[]> {
  const res = await db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ?')
    .bind(Math.min(500, limit)).all<ContactMessage>();
  return res.results ?? [];
}
export async function setMessageHandled(db: D1Database, id: number, handled: number): Promise<void> {
  await db.prepare('UPDATE contact_messages SET handled = ? WHERE id = ?').bind(handled, id).run();
}
export async function deleteMessage(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM contact_messages WHERE id = ?').bind(id).run();
}

/* --------------------------------------------------------------- stats --- */

export async function adminStats(db: D1Database) {
  const [projects, published, orders, revenue, messages] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS n FROM projects').first<{ n: number }>(),
    db.prepare('SELECT COUNT(*) AS n FROM projects WHERE published = 1').first<{ n: number }>(),
    db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status='paid'").first<{ n: number }>(),
    db.prepare("SELECT COALESCE(SUM(amount_inr),0) AS n FROM orders WHERE status='paid'").first<{ n: number }>(),
    db.prepare('SELECT COUNT(*) AS n FROM contact_messages WHERE handled = 0').first<{ n: number }>(),
  ]);
  return {
    projects: projects?.n ?? 0,
    published: published?.n ?? 0,
    orders: orders?.n ?? 0,
    revenue: revenue?.n ?? 0,
    unreadMessages: messages?.n ?? 0,
  };
}

/* --------------------------------------------------------------- Pages --- */
export async function getPage(db: D1Database, slug: string): Promise<Page | null> {
  return db.prepare('SELECT * FROM pages WHERE slug = ?').bind(slug).first<Page>();
}

export async function getAllPages(db: D1Database): Promise<Page[]> {
  const { results } = await db.prepare('SELECT * FROM pages ORDER BY title ASC').all<Page>();
  return results;
}

export async function upsertPage(db: D1Database, page: Partial<Page> & { slug: string }): Promise<void> {
  const existing = await getPage(db, page.slug);
  const now = Math.floor(Date.now() / 1000);
  if (existing) {
    await db.prepare(
      'UPDATE pages SET title = ?, content_md = ?, image_url = ?, updated_at = ? WHERE slug = ?'
    ).bind(
      page.title ?? existing.title,
      page.content_md ?? existing.content_md,
      page.image_url ?? existing.image_url,
      now,
      page.slug
    ).run();
  } else {
    await db.prepare(
      'INSERT INTO pages (slug, title, content_md, image_url, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      page.slug,
      page.title ?? '',
      page.content_md ?? '',
      page.image_url ?? '',
      now
    ).run();
  }
}









export async function listCategories(db: D1Database): Promise<string[]> {
  const res = await db.prepare("SELECT DISTINCT category FROM projects WHERE category IS NOT NULL AND category != '' ORDER BY category ASC").all<{ category: string }>();
  return (res.results ?? []).map(r => r.category);
}
export async function listTags(db: D1Database): Promise<string[]> {
  const res = await db.prepare("SELECT tags FROM projects WHERE tags IS NOT NULL AND tags != ''").all<{ tags: string }>();
  const allTags = new Set<string>();
  for (const r of res.results ?? []) {
    if (r.tags) {
      for (const t of r.tags.split(",")) {
        if (t.trim()) allTags.add(t.trim());
      }
    }
  }
  return Array.from(allTags).sort();
}
