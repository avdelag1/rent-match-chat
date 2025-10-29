/**
 * Sitemap Generation Script
 * Run with: npx tsx scripts/generate-sitemap.ts
 *
 * Generates sitemap.xml with all public pages and listings
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Base URL for your site
const BASE_URL = 'https://tinderent.lovable.app';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Static pages
const staticPages: SitemapUrl[] = [
  {
    loc: '/',
    changefreq: 'daily',
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: '/about',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    loc: '/how-it-works',
    changefreq: 'monthly',
    priority: 0.8
  },
  {
    loc: '/faq',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    loc: '/contact',
    changefreq: 'monthly',
    priority: 0.7
  },
  {
    loc: '/privacy',
    changefreq: 'yearly',
    priority: 0.5
  },
  {
    loc: '/terms',
    changefreq: 'yearly',
    priority: 0.5
  }
];

/**
 * Fetch all active listings from Supabase
 */
async function fetchListings(): Promise<SitemapUrl[]> {
  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, updated_at')
      .eq('is_active', true)
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
      return [];
    }

    return (listings || []).map(listing => ({
      loc: `/listing/${listing.id}`,
      lastmod: listing.updated_at?.split('T')[0],
      changefreq: 'weekly' as const,
      priority: 0.9
    }));
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

/**
 * Generate XML sitemap
 */
function generateSitemap(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => `
  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Main function
 */
async function main() {
  console.log('🗺️  Generating sitemap...');

  // Fetch dynamic content
  const listingUrls = await fetchListings();

  // Combine all URLs
  const allUrls = [...staticPages, ...listingUrls];

  // Generate sitemap XML
  const sitemapXml = generateSitemap(allUrls);

  // Write to public directory
  const publicDir = path.join(process.cwd(), 'public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');

  fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');

  console.log(`✅ Sitemap generated with ${allUrls.length} URLs`);
  console.log(`   - Static pages: ${staticPages.length}`);
  console.log(`   - Listings: ${listingUrls.length}`);
  console.log(`   - Output: ${sitemapPath}`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { generateSitemap, fetchListings };
