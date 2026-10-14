import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createProjectSnapshot } from '../../../../lib/project-snapshot';
import { getOrInsertComponent } from '../../../../lib/component-matcher';
import type { AIDraftOutput } from '../../../../lib/ai-schema';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.admin) {
    return new Response(JSON.stringify({ ok: false, error: 'UNAUTHORIZED', message: 'Admin authentication required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'BAD_REQUEST', message: 'Invalid payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const projectId = Number(body.project_id || 0);
  const draft: AIDraftOutput = body.draft;
  const selections = body.selections || {}; // which sections/cards to apply { basics: true, bom: true, ... }
  const replaceFields = body.replace_fields || {}; // { title: true, summary: false, ... }
  const newComponentsToCreate = Array.isArray(body.new_components) ? body.new_components : [];
  const bomResolutions = Array.isArray(body.bom_resolutions) ? body.bom_resolutions : [];

  if (!draft) {
    return new Response(JSON.stringify({ ok: false, error: 'NO_DRAFT', message: 'No draft data provided.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. If project exists, take snapshot first before any changes
    let snapshotCreated = false;
    if (projectId > 0) {
      try {
        const snapRes = await createProjectSnapshot(env.DB, projectId);
        snapshotCreated = snapRes.ok;
      } catch (snapErr) {
        console.error('Snapshot creation failed, proceeding:', snapErr);
      }
    }

    const now = Math.floor(Date.now() / 1000);

    // 2. Process approved new components into library
    const createdComponentMap = new Map<number, number>(); // bomIndex -> component_id
    for (const comp of newComponentsToCreate) {
      try {
        const res = await getOrInsertComponent(env.DB, {
          name: comp.name,
          store: comp.store || 'Robu / Amazon',
          category: comp.category || 'Electronics',
          unit_price_inr: comp.unit_price_inr || 0,
          buy_url: comp.buy_url || '',
          notes: comp.notes || ''
        });
        if (comp.bom_index !== undefined) {
          createdComponentMap.set(comp.bom_index, res.id);
        }
        // If an affiliate link or price was provided, guarantee the component library record is synced
        if (comp.buy_url && comp.buy_url.trim()) {
          await env.DB.prepare(`
            UPDATE components
            SET buy_url = ?,
                is_affiliate = 1,
                unit_price_inr = CASE WHEN ? > 0 THEN ? ELSE unit_price_inr END,
                updated_at = ?
            WHERE id = ?
          `).bind(comp.buy_url.trim(), comp.unit_price_inr || 0, comp.unit_price_inr || 0, now, res.id).run();
        }
      } catch (e) {
        console.error('Error inserting/updating component in library:', e);
      }
    }

    // Also update any existing library components if the user updated their affiliate link or price
    for (const resObj of bomResolutions) {
      if (resObj.component_id > 0 && resObj.buy_url && typeof resObj.buy_url === 'string' && resObj.buy_url.trim()) {
        try {
          await env.DB.prepare(`
            UPDATE components
            SET buy_url = ?,
                is_affiliate = 1,
                unit_price_inr = CASE WHEN ? > 0 THEN ? ELSE unit_price_inr END,
                updated_at = ?
            WHERE id = ?
          `).bind(resObj.buy_url.trim(), resObj.unit_price_inr || 0, resObj.unit_price_inr || 0, now, resObj.component_id).run();
        } catch (e) {
          console.error('Error updating existing library component affiliate link:', e);
        }
      }
    }

    let appliedCount = 0;

    // 3. Update main projects table if project exists
    if (projectId > 0) {
      const projUpdates: string[] = [];
      const projBinds: any[] = [];

      // Basics section
      if (selections.basics) {
        if (replaceFields.title !== false && draft.title) {
          projUpdates.push('title = ?');
          projBinds.push(draft.title);
          appliedCount++;
        }
        if (replaceFields.slug !== false && draft.slug) {
          projUpdates.push('slug = ?');
          projBinds.push(draft.slug);
        }
        if (replaceFields.summary !== false && draft.summary) {
          projUpdates.push('summary = ?');
          projBinds.push(draft.summary);
          appliedCount++;
        }
        if (replaceFields.category !== false && draft.category) {
          projUpdates.push('category = ?');
          projBinds.push(draft.category);
          appliedCount++;
        }
        if (replaceFields.difficulty !== false && draft.difficulty) {
          projUpdates.push('difficulty = ?');
          projBinds.push(draft.difficulty);
          appliedCount++;
        }
        if (replaceFields.build_time !== false && draft.build_time) {
          projUpdates.push('build_time = ?');
          projBinds.push(draft.build_time);
          appliedCount++;
        }
      }

      // Description section
      if (selections.description) {
        if (replaceFields.description !== false && draft.description_markdown) {
          projUpdates.push('description = ?');
          projBinds.push(draft.description_markdown);
          appliedCount++;
        }
      }

      // SEO section
      if (selections.seo) {
        if (replaceFields.meta_title !== false && draft.seo?.meta_title) {
          projUpdates.push('meta_title = ?');
          projBinds.push(draft.seo.meta_title);
          appliedCount++;
        }
        if (replaceFields.meta_description !== false && draft.seo?.meta_description) {
          projUpdates.push('meta_description = ?');
          projBinds.push(draft.seo.meta_description);
          appliedCount++;
        }
        if (replaceFields.tags !== false && draft.tags?.length) {
          projUpdates.push('tags = ?');
          projBinds.push(draft.tags.join(','));
          appliedCount++;
        }
      }

      // Learning outcomes & FAQ
      if (selections.learning) {
        if (draft.outcomes?.length) {
          projUpdates.push('outcomes_json = ?');
          projBinds.push(JSON.stringify(draft.outcomes));
          appliedCount++;
        }
        if (draft.prerequisites?.length) {
          projUpdates.push('prereqs_json = ?');
          projBinds.push(JSON.stringify(draft.prerequisites));
          appliedCount++;
        }
        if (draft.not_included?.length) {
          projUpdates.push('not_included_json = ?');
          projBinds.push(JSON.stringify(draft.not_included));
          appliedCount++;
        }
        if (draft.faq?.length) {
          projUpdates.push('faq_json = ?');
          projBinds.push(JSON.stringify(draft.faq));
          appliedCount++;
        }
      }

      // Safety and Credits
      if (selections.safety_credits) {
        if (draft.safety_note_markdown) {
          projUpdates.push('safety_note = ?');
          projBinds.push(draft.safety_note_markdown);
          appliedCount++;
        }
        if (draft.credits_markdown) {
          projUpdates.push('credits = ?');
          projBinds.push(draft.credits_markdown);
          appliedCount++;
        }
      }

      if (projUpdates.length > 0) {
        projUpdates.push('updated_at = ?');
        projBinds.push(now);
        projBinds.push(projectId);
        await env.DB.prepare(`UPDATE projects SET ${projUpdates.join(', ')} WHERE id = ?`)
          .bind(...projBinds)
          .run();
      }

      // 4. BOM Items: merge into bom_items
      if (selections.bom && draft.bom?.length) {
        const existingBom = await env.DB.prepare('SELECT id, name FROM bom_items WHERE project_id = ?')
          .bind(projectId)
          .all<{ id: number; name: string }>();
        const existingRows = existingBom.results ?? [];

        const statements: any[] = [];
        for (let idx = 0; idx < draft.bom.length; idx++) {
          const item = draft.bom[idx];
          // Resolve component_id
          let compId = 0;
          const resObj = bomResolutions.find(r => r.bom_index === idx);
          if (resObj && resObj.component_id) {
            compId = resObj.component_id;
          } else if (createdComponentMap.has(idx)) {
            compId = createdComponentMap.get(idx)!;
          }

          const buyUrl = item.buy_url?.trim() || (resObj && resObj.buy_url ? String(resObj.buy_url).trim() : '');
          const price = item.approx_price_inr || (resObj && resObj.unit_price_inr ? Number(resObj.unit_price_inr) : 0);

          // If compId is still 0 or component not linked, auto-resolve or create in components library so affiliate marketing is 100% saved!
          if (!compId && item.name) {
            try {
              const compRes = await getOrInsertComponent(env.DB, {
                name: item.name,
                store: 'Robu / Amazon',
                category: 'Electronics',
                unit_price_inr: price,
                buy_url: buyUrl,
                notes: item.role || ''
              });
              compId = compRes.id;
            } catch (err) {}
          }

          // Always ensure the components master library has the latest affiliate link and price
          if (compId > 0 && buyUrl) {
            try {
              await env.DB.prepare(`
                UPDATE components
                SET buy_url = ?,
                    is_affiliate = 1,
                    unit_price_inr = CASE WHEN ? > 0 THEN ? ELSE unit_price_inr END,
                    updated_at = ?
                WHERE id = ?
              `).bind(buyUrl, price, price, now, compId).run();
            } catch (err) {}
          }

          const match = existingRows.find(e =>
            e.name.trim().toLowerCase() === item.name.trim().toLowerCase()
          );

          if (match) {
            // Merge / update existing BOM row
            statements.push(
              env.DB.prepare(
                `UPDATE bom_items SET
                   name = ?,
                   qty = ?,
                   notes = ?,
                   unit_price_inr = ?,
                   affiliate_url = CASE WHEN ? != '' THEN ? ELSE affiliate_url END,
                   is_affiliate = CASE WHEN ? != '' THEN 1 ELSE is_affiliate END,
                   component_id = CASE WHEN ? > 0 THEN ? ELSE component_id END
                 WHERE id = ?`
              ).bind(item.name, String(item.qty || '1'), item.role || '', price, buyUrl, buyUrl, buyUrl, compId, compId, match.id)
            );
          } else {
            // Insert new BOM row
            statements.push(
              env.DB.prepare(
                'INSERT INTO bom_items (project_id, name, qty, notes, store, affiliate_url, unit_price_inr, price_checked, is_affiliate, component_id, is_required, group_name, stage_tag, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
              ).bind(
                projectId,
                item.name,
                String(item.qty || '1'),
                item.role || '',
                'Robu / Amazon',
                buyUrl,
                price,
                '',
                buyUrl ? 1 : 0,
                compId,
                1,
                '',
                '',
                existingRows.length + idx
              )
            );
          }
          appliedCount++;
        }

        if (statements.length > 0) {
          await env.DB.batch(statements);
        }
      }

      // 5. Steps: merge into project_steps
      if (selections.steps && draft.steps?.length) {
        const existingSteps = await env.DB.prepare('SELECT id, title FROM project_steps WHERE project_id = ?')
          .bind(projectId)
          .all<{ id: number; title: string }>();
        const existing = existingSteps.results ?? [];

        const statements: any[] = [];
        draft.steps.forEach((s, idx) => {
          const match = existing.find(e => e.title.trim().toLowerCase() === s.title.trim().toLowerCase());
          if (match) {
            statements.push(
              env.DB.prepare('UPDATE project_steps SET body = ?, why = ? WHERE id = ?')
                .bind(s.instruction_markdown, s.why_or_gotcha, match.id)
            );
          } else {
            statements.push(
              env.DB.prepare(
                'INSERT INTO project_steps (project_id, title, body, why, image_url, sort, goal, time_est, parts_needed, file_id, expected_res, if_fails, video_ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
              ).bind(
                projectId,
                s.title,
                s.instruction_markdown,
                s.why_or_gotcha,
                '',
                existing.length + idx,
                '', '', '', null, '', '', ''
              )
            );
          }
          appliedCount++;
        });
        if (statements.length > 0) await env.DB.batch(statements);
      }

      // 6. Wiring: merge into project_pins (with module column)
      if (selections.wiring && draft.wiring?.length) {
        const existingPins = await env.DB.prepare('SELECT id, from_pin, to_pin, module FROM project_pins WHERE project_id = ?')
          .bind(projectId)
          .all<{ id: number; from_pin: string; to_pin: string; module: string }>();
        const existing = existingPins.results ?? [];

        const statements: any[] = [];
        draft.wiring.forEach((w, idx) => {
          const mod = (w.module || '').trim();
          const match = existing.find(e =>
            e.from_pin.trim().toLowerCase() === w.from.trim().toLowerCase() &&
            e.to_pin.trim().toLowerCase() === w.to.trim().toLowerCase() &&
            (!mod || !e.module || e.module.toLowerCase() === mod.toLowerCase())
          );
          if (match) {
            statements.push(
              env.DB.prepare('UPDATE project_pins SET note = ?, module = CASE WHEN ? != \'\' THEN ? ELSE module END WHERE id = ?')
                .bind(w.note || '', mod, mod, match.id)
            );
          } else {
            statements.push(
              env.DB.prepare(
                'INSERT INTO project_pins (project_id, from_pin, to_pin, note, sort, module) VALUES (?, ?, ?, ?, ?, ?)'
              ).bind(projectId, w.from, w.to, w.note || '', existing.length + idx, mod)
            );
          }
          appliedCount++;
        });
        if (statements.length > 0) await env.DB.batch(statements);
      }

      // 7. Troubleshooting: merge into project_troubleshooting
      if (selections.troubleshooting && draft.troubleshooting?.length) {
        const existingTb = await env.DB.prepare('SELECT id, symptom FROM project_troubleshooting WHERE project_id = ?')
          .bind(projectId)
          .all<{ id: number; symptom: string }>();
        const existing = existingTb.results ?? [];

        const statements: any[] = [];
        draft.troubleshooting.forEach((tb, idx) => {
          const match = existing.find(e => e.symptom.trim().toLowerCase() === tb.symptom.trim().toLowerCase());
          if (match) {
            statements.push(
              env.DB.prepare('UPDATE project_troubleshooting SET fix = ? WHERE id = ?')
                .bind(tb.fix_markdown, match.id)
            );
          } else {
            statements.push(
              env.DB.prepare(
                'INSERT INTO project_troubleshooting (project_id, symptom, cause, fix, sort) VALUES (?, ?, ?, ?, ?)'
              ).bind(projectId, tb.symptom, '', tb.fix_markdown, existing.length + idx)
            );
          }
          appliedCount++;
        });
        if (statements.length > 0) await env.DB.batch(statements);
      }

      // 8. Resource links: merge into project_links
      if (selections.links && draft.resource_links?.length) {
        const existingLinks = await env.DB.prepare('SELECT id, url FROM project_links WHERE project_id = ?')
          .bind(projectId)
          .all<{ id: number; url: string }>();
        const existing = existingLinks.results ?? [];

        const statements: any[] = [];
        draft.resource_links.forEach((l, idx) => {
          const match = existing.find(e => e.url.trim().toLowerCase() === l.url.trim().toLowerCase());
          if (!match) {
            statements.push(
              env.DB.prepare(
                'INSERT INTO project_links (project_id, label, url, kind, sort) VALUES (?, ?, ?, ?, ?)'
              ).bind(projectId, l.label, l.url, l.type || 'other', existing.length + idx)
            );
            appliedCount++;
          }
        });
        if (statements.length > 0) await env.DB.batch(statements);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      message: `Applied ${appliedCount} changes successfully.`,
      applied_count: appliedCount,
      snapshot_created: snapshotCreated,
      project_id: projectId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Error applying AI draft:', err);
    return new Response(JSON.stringify({
      ok: false,
      error: 'SERVER_ERROR',
      message: err?.message || 'Failed to apply AI changes to project.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
