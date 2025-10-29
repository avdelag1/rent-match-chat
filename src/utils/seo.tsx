/**
 * SEO Utilities for Tinderent
 * Dynamic meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
 */

import { Helmet } from 'react-helmet-async';
import { Database } from '@/integrations/supabase/types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: any;
}

/**
 * Base SEO component for all pages
 * Usage: <SEO title="Page Title" description="Page description" />
 */
export function SEO({
  title = 'Tinderent - Find Your Perfect Rental Property or Tenant',
  description = 'Discover your ideal rental property or tenant with Tinderent. Swipe through verified listings, connect with perfect matches, and find your next home or tenant effortlessly.',
  image = 'https://tinderent.lovable.app/social-preview.jpg',
  url = 'https://tinderent.lovable.app',
  type = 'website',
  schema
}: SEOProps) {
  const fullTitle = title.includes('Tinderent') ? title : `${title} | Tinderent`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Tinderent" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta name="twitter:creator" content="@tinderent" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

/**
 * Generate JSON-LD schema for a property listing
 */
export function generateListingSchema(listing: Listing, ownerName?: string) {
  const baseUrl = 'https://tinderent.lovable.app';

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title || 'Property Listing',
    url: `${baseUrl}/listing/${listing.id}`,
    description: listing.description || 'Available rental property',
    datePosted: listing.created_at,
    ...(listing.images && listing.images.length > 0 && {
      image: listing.images[0]
    }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address || '',
      addressLocality: listing.city || '',
      addressRegion: listing.state || '',
      postalCode: listing.zip_code || '',
      addressCountry: 'MX'
    },
    ...(listing.latitude && listing.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: listing.latitude,
        longitude: listing.longitude
      }
    }),
    ...(listing.price && {
      offers: {
        '@type': 'Offer',
        price: listing.price,
        priceCurrency: 'MXN',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: listing.price,
          priceCurrency: 'MXN',
          unitText: 'MONTH'
        }
      }
    }),
    ...(listing.beds && {
      numberOfRooms: listing.beds
    }),
    ...(listing.square_feet && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: listing.square_feet,
        unitCode: 'FTK'
      }
    }),
    ...(ownerName && {
      landlord: {
        '@type': 'Person',
        name: ownerName
      }
    })
  };
}

/**
 * Generate organization schema for main pages
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tinderent',
    url: 'https://tinderent.lovable.app',
    logo: 'https://tinderent.lovable.app/logo.png',
    description: 'Find your perfect rental property or tenant with swipe-based matching',
    sameAs: [
      'https://facebook.com/tinderent',
      'https://twitter.com/tinderent',
      'https://instagram.com/tinderent',
      'https://linkedin.com/company/tinderent'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@tinderent.com',
      availableLanguage: ['English', 'Spanish']
    }
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tinderent',
    url: 'https://tinderent.lovable.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://tinderent.lovable.app/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * SEO for listing detail page
 */
export function ListingSEO({ listing, ownerName }: { listing: Listing; ownerName?: string }) {
  const title = `${listing.title || 'Property Listing'} - ${listing.city || 'Mexico'}`;
  const description = listing.description
    ? listing.description.slice(0, 160) + '...'
    : `${listing.beds} bed, ${listing.baths} bath property for rent in ${listing.city}. View details and contact owner on Tinderent.`;
  const image = listing.images?.[0] || 'https://tinderent.lovable.app/social-preview.jpg';
  const url = `https://tinderent.lovable.app/listing/${listing.id}`;

  const schema = generateListingSchema(listing, ownerName);
  const breadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://tinderent.lovable.app' },
    { name: 'Listings', url: 'https://tinderent.lovable.app/listings' },
    { name: listing.title || 'Property', url }
  ]);

  return (
    <>
      <SEO
        title={title}
        description={description}
        image={image}
        url={url}
        type="product"
        schema={schema}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumb)}
        </script>
      </Helmet>
    </>
  );
}

/**
 * SEO for homepage
 */
export function HomeSEO() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <SEO />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>
    </>
  );
}
