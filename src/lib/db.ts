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
  tags: string;
  build_time: string;
  price_inr: number;
  combo_enabled: number;
  combo_title: string;
  combo_description: string;
  featured: number;
  published: number;
  sort: number;
  created_at: number;
  updated_at: number;
}

export interface ProjectImage {
  id: number; project_id: number; url: string; caption: string; sort: number;
}
export interface ProjectFile {
  id: number; project_id: number; label: string; kind: string; r2_key: string;
  filename: string; size_bytes: number; is_free: number; in_combo: number; sort: number; created_at: number;
}
export interface BomItem {
  id: number; project_id: number; name: string; qty: string; notes: string;
  store: string; affiliate_url: string; unit_price_inr: number; sort: number;
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
}

const now = () => Math.floor(Date.now() / 1000);

/* ------------------------------------------------------------ projects --- */

export async function listProjects(
  db: D1Database,
  opts: { publishedOnly?: boolean; featuredOnly?: boolean; category?: string; limit?: number; search?: string } = {},
): Promise<Project[]> {
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
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const limit = opts.limit ? `LIMIT ${Math.max(1, Math.min(100, opts.limit | 0))}` : '';
  const sql = `SELECT * FROM projects ${clause} ORDER BY featured DESC, sort ASC, created_at DESC ${limit}`;
  const res = await db.prepare(sql).bind(...binds).all<Project>();
  return res.results ?? [];
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
  const [images, files, bom, links] = await Promise.all([
    db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort').bind(project.id).all<ProjectImage>(),
    db.prepare('SELECT * FROM project_files WHERE project_id = ? ORDER BY sort').bind(project.id).all<ProjectFile>(),
    db.prepare('SELECT * FROM bom_items WHERE project_id = ? ORDER BY sort').bind(project.id).all<BomItem>(),
    db.prepare('SELECT * FROM project_links WHERE project_id = ? ORDER BY sort').bind(project.id).all<ProjectLink>(),
  ]);
  return {
    ...project,
    images: images.results ?? [],
    files: files.results ?? [],
    bom: bom.results ?? [],
    links: links.results ?? [],
  };
}

export async function getProjectFullById(db: D1Database, id: number): Promise<ProjectFull | null> {
  const project = await getProjectById(db, id);
  if (!project) return null;
  const [images, files, bom, links] = await Promise.all([
    db.prepare('SELECT * FROM project_images WHERE project_id = ? ORDER BY sort').bind(id).all<ProjectImage>(),
    db.prepare('SELECT * FROM project_files WHERE project_id = ? ORDER BY sort').bind(id).all<ProjectFile>(),
    db.prepare('SELECT * FROM bom_items WHERE project_id = ? ORDER BY sort').bind(id).all<BomItem>(),
    db.prepare('SELECT * FROM project_links WHERE project_id = ? ORDER BY sort').bind(id).all<ProjectLink>(),
  ]);
  return {
    ...project,
    images: images.results ?? [],
    files: files.results ?? [],
    bom: bom.results ?? [],
    links: links.results ?? [],
  };
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
      (slug,title,summary,description,category,difficulty,cover_image,video_url,tags,build_time,
       price_inr,combo_enabled,combo_title,combo_description,featured,published,sort,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).bind(
    p.slug, p.title, p.summary ?? '', p.description ?? '', p.category ?? 'Electronics',
    p.difficulty ?? 'Beginner', p.cover_image ?? '', p.video_url ?? '', p.tags ?? '', p.build_time ?? '',
    p.price_inr ?? 0, p.combo_enabled ?? 0, p.combo_title ?? 'Complete Project Combo',
    p.combo_description ?? '', p.featured ?? 0, p.published ?? 0, p.sort ?? 0, t, t,
  ).run();
  return res.meta.last_row_id as number;
}

export async function updateProject(db: D1Database, id: number, p: Partial<Project>): Promise<void> {
  const fields = [
    'slug', 'title', 'summary', 'description', 'category', 'difficulty', 'cover_image',
    'video_url', 'tags', 'build_time', 'price_inr', 'combo_enabled', 'combo_title',
    'combo_description', 'featured', 'published', 'sort',
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

export async function addImage(db: D1Database, projectId: number, url: string, caption = '', sort = 0) {
  await db.prepare('INSERT INTO project_images (project_id,url,caption,sort) VALUES (?,?,?,?)')
    .bind(projectId, url, caption, sort).run();
}
export async function deleteImage(db: D1Database, id: number) {
  await db.prepare('DELETE FROM project_images WHERE id = ?').bind(id).run();
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
    'INSERT INTO bom_items (project_id,name,qty,notes,store,affiliate_url,unit_price_inr,sort) VALUES (?,?,?,?,?,?,?,?)',
  ).bind(b.project_id, b.name, b.qty, b.notes, b.store, b.affiliate_url, b.unit_price_inr, b.sort).run();
}
export async function deleteBom(db: D1Database, id: number) {
  await db.prepare('DELETE FROM bom_items WHERE id = ?').bind(id).run();
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
