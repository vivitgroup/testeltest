import type { MetadataRoute } from 'next';
const BASE = 'https://binsiddiq.com';
const PUBLIC_PAGES = ['/', '/products', '/ai-measure', '/dress-viewer', '/chat', '/privacy', '/roadmap', '/occasion-planner', '/color-match', '/bundles', '/inspiration'];
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map(path => ({
    url:              `${BASE}${path}`,
    lastModified:     new Date(),
    changeFrequency:  path === '/' ? 'daily' : 'weekly' as const,
    priority:         path === '/' ? 1 : 0.7,
  }));
}
