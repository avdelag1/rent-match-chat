/**
 * Infinite Scroll Hook for Listings
 * Cursor-based pagination with prefetching and optimistic updates
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface UseInfiniteListingsOptions {
  pageSize?: number;
  excludeSwipedIds?: string[];
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    beds?: number;
    baths?: number;
    petFriendly?: boolean;
    furnished?: boolean;
  };
  enabled?: boolean;
}

interface ListingsPage {
  data: Listing[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Fetch listings with cursor-based pagination
 */
async function fetchListings(
  cursor: string | null,
  pageSize: number,
  excludeIds: string[],
  filters: UseInfiniteListingsOptions['filters']
): Promise<ListingsPage> {
  let query = supabase
    .from('listings')
    .select('*')
    .eq('is_active', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Apply cursor pagination
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  // Exclude already swiped listings
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  // Apply filters
  if (filters) {
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.beds !== undefined) {
      query = query.gte('beds', filters.beds);
    }
    if (filters.baths !== undefined) {
      query = query.gte('baths', filters.baths);
    }
    if (filters.petFriendly !== undefined) {
      query = query.eq('pet_friendly', filters.petFriendly);
    }
    if (filters.furnished !== undefined) {
      query = query.eq('furnished', filters.furnished);
    }
  }

  // Fetch one extra to check if there's more
  query = query.limit(pageSize + 1);

  const { data, error } = await query;

  if (error) throw error;

  const hasMore = (data || []).length > pageSize;
  const items = hasMore ? data!.slice(0, pageSize) : data || [];
  const nextCursor = hasMore && items.length > 0
    ? items[items.length - 1].created_at
    : null;

  return {
    data: items,
    nextCursor,
    hasMore
  };
}

/**
 * Hook for infinite scrolling listings
 */
export function useInfiniteListings({
  pageSize = 10,
  excludeSwipedIds = [],
  filters,
  enabled = true
}: UseInfiniteListingsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['infinite-listings', pageSize, excludeSwipedIds, filters],
    queryFn: ({ pageParam }) =>
      fetchListings(pageParam, pageSize, excludeSwipedIds, filters),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    enabled,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
}

/**
 * Get flattened array of all listings from infinite query
 */
export function flattenListings(pages: ListingsPage[] | undefined): Listing[] {
  if (!pages) return [];
  return pages.flatMap(page => page.data);
}
