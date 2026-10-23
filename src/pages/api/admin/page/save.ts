import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { upsertPage, recordPageRevision } from '../../../../lib/db';
import { uploadToStore } from '../../../../lib/upload';
import { csrfOk, strField, flashRedirect } from '../../../../lib/admin';
import { slugify } from '../../../../lib/format';
import { saveAboutPageData, getAboutPageData } from '../../../../lib/site-content';

export const POST: APIRoute = async ({ request, cookies }) => {
  const isJson = request.headers.get('accept')?.includes('application/json') ||
                 request.headers.get('content-type')?.includes('application/json');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Invalid form data' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Invalid form submission.' });
  }

  if (!csrfOk(cookies, form)) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Session expired, please refresh.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Session expired, try again.' });
  }

  const slugRaw = strField(form, 'slug', 80);
  const title = strField(form, 'title', 140);

  if (!slugRaw || !title) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: 'Slug and title are required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect('/admin/pages', { err: 'Slug and title are required.' });
  }

  const slug = slugify(slugRaw);
  let imageUrl = strField(form, 'image_url', 1000);

  const imageFile = form.get('image');
  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    try {
      const up = await uploadToStore(env.BLOBS, imageFile, `pages/${slug}`);
      imageUrl = `/media/${up.key}`;
    } catch (e: any) {
      if (isJson) return new Response(JSON.stringify({ ok: false, error: `Image upload failed: ${e.message}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      return flashRedirect(`/admin/pages/${slug}`, { err: `Image upload failed: ${e.message}` });
    }
  }

  const published = form.get('published') === '1' || form.get('published') === 'true' ? 1 : 0;
  const meta_title = strField(form, 'meta_title', 200) || '';
  const meta_description = strField(form, 'meta_description', 500) || '';
  let rawContent = strField(form, 'content_md', 60000) || '';

  // Handle structured About Page data
  if (slug === 'about') {
    const currentAbout = await getAboutPageData(env.DB);
    const aboutJson = strField(form, 'about_data_json', 100000);
    if (aboutJson) {
      try {
        const parsed = JSON.parse(aboutJson);
        await saveAboutPageData(env.DB, parsed);
        rawContent = parsed.story?.body_md || rawContent;
      } catch (err) {
        console.error('Failed to parse about_data_json:', err);
      }
    } else if (form.has('hero_headline') || form.has('story_md')) {
      const heroHeadline = strField(form, 'hero_headline', 500) || currentAbout.hero.headline;
      const heroEyebrow = strField(form, 'hero_eyebrow', 200) || currentAbout.hero.eyebrow;
      const heroIntro = strField(form, 'hero_intro', 1000) || currentAbout.hero.intro;
      const heroBadge = strField(form, 'hero_badge_text', 100) || currentAbout.hero.badge_text;
      const heroName = strField(form, 'hero_name', 100) || currentAbout.hero.name || 'Triveni Narayan Priy';
      const credsRaw = strField(form, 'hero_credentials', 1000);
      const credentials = credsRaw ? credsRaw.split('\n').map((c) => c.trim()).filter(Boolean) : currentAbout.hero.credentials;
      
      const stat3Val = strField(form, 'stat3_val', 50) || currentAbout.numbers.stat3_val;
      const stat3Label = strField(form, 'stat3_label', 100) || currentAbout.numbers.stat3_label;
      const stat4Val = strField(form, 'stat4_val', 50) || currentAbout.numbers.stat4_val;
      const stat4Label = strField(form, 'stat4_label', 100) || currentAbout.numbers.stat4_label;

      const storyHeading = strField(form, 'story_heading', 200) || currentAbout.story.heading;
      const storyQuote = strField(form, 'story_pull_quote', 500) || currentAbout.story.pull_quote;
      const storyBody = strField(form, 'story_md', 60000) || currentAbout.story.body_md;
      rawContent = storyBody;

      // Steps 0..3
      const steps = [0, 1, 2, 3].map((idx) => ({
        icon: currentAbout.steps[idx]?.icon || 'cube',
        title: strField(form, `step_${idx}_title`, 100) || currentAbout.steps[idx]?.title || `Step ${idx + 1}`,
        text: strField(form, `step_${idx}_text`, 500) || currentAbout.steps[idx]?.text || '',
      }));

      // Workbench slugs
      const wbRaw = strField(form, 'workbench_slugs', 1000);
      const workbenchSlugs = wbRaw ? wbRaw.split('\n').map((s) => s.trim()).filter(Boolean) : currentAbout.workbench.project_slugs;

      // Expect cards 0..2
      const expectCards = [0, 1, 2].map((idx) => ({
        icon: currentAbout.expect_cards[idx]?.icon || 'shield',
        title: strField(form, `expect_${idx}_title`, 100) || currentAbout.expect_cards[idx]?.title || `Feature ${idx + 1}`,
        text: strField(form, `expect_${idx}_text`, 500) || currentAbout.expect_cards[idx]?.text || '',
      }));

      // Work with me
      const workHeading = strField(form, 'work_heading', 200) || currentAbout.work_with_me.heading;
      const workText = strField(form, 'work_text', 2000) || currentAbout.work_with_me.text;
      const workBtnText = strField(form, 'work_btn_text', 100) || currentAbout.work_with_me.btn_text || 'Get in touch';
      const workBtnUrl = strField(form, 'work_btn_url', 200) || currentAbout.work_with_me.btn_url || '/contact';

      // CTA
      const ctaHeading = strField(form, 'cta_heading', 200) || currentAbout.cta.heading;
      const ctaSubline = strField(form, 'cta_subline', 500) || currentAbout.cta.subline;

      const updatedAbout = {
        ...currentAbout,
        hero: {
          ...currentAbout.hero,
          eyebrow: heroEyebrow,
          headline: heroHeadline,
          intro: heroIntro,
          badge_text: heroBadge,
          name: heroName,
          credentials,
        },
        numbers: {
          stat3_val: stat3Val,
          stat3_label: stat3Label,
          stat4_val: stat4Val,
          stat4_label: stat4Label,
        },
        story: {
          ...currentAbout.story,
          heading: storyHeading,
          pull_quote: storyQuote,
          body_md: storyBody,
        },
        steps,
        workbench: {
          project_slugs: workbenchSlugs,
        },
        expect_cards: expectCards,
        work_with_me: {
          heading: workHeading,
          text: workText,
          btn_text: workBtnText,
          btn_url: workBtnUrl,
        },
        cta: {
          ...currentAbout.cta,
          heading: ctaHeading,
          subline: ctaSubline,
        },
      };

      await saveAboutPageData(env.DB, updatedAbout);
    }
  }

  const hasContent = rawContent.trim().length > 0 || slug === 'about';

  // An empty content field saves as "use default" with a warning rather than blocking with required error
  const is_custom = hasContent ? 1 : 0;

  const data = {
    slug,
    title,
    content_md: rawContent,
    image_url: imageUrl,
    published,
    meta_title,
    meta_description,
    is_custom,
  };

  try {
    await upsertPage(env.DB, data);

    if (hasContent) {
      await recordPageRevision(env.DB, {
        page_slug: slug,
        title,
        content_md: rawContent,
        meta_title,
        meta_description,
        source: 'custom',
        note: 'Custom content saved',
      });
    }

    const message = hasContent
      ? 'Page saved successfully.'
      : 'Empty content saved. Page is now using the built-in site default.';

    if (isJson) {
      return new Response(JSON.stringify({
        ok: true,
        msg: message,
        slug,
        is_custom,
        published,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return flashRedirect(`/admin/pages/${slug}`, { ok: message });
  } catch (err: any) {
    if (isJson) return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    return flashRedirect(`/admin/pages/${slug}`, { err: err.message });
  }
};
