import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, redirect }) => {
  const slug = params.slug;
  if (!slug || slug === '' || slug === '/') {
    return redirect('/projects?cat=Resource', 301);
  }
  return redirect(`/projects/${slug}`, 301);
};
