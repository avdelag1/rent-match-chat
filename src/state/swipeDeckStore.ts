import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * SwipeDeckStore - Persists swipe deck state across navigation
 *
 * This store ensures that when users navigate away from dashboard and back,
 * the deck does NOT reset to empty. It maintains deck items, current index,
 * and hydration state for both client and owner roles.
 */

export interface DeckItem {
  id: string;
  [key: string]: any;
}

export interface DeckState {
  deckItems: DeckItem[];
  currentIndex: number;
  currentPage: number;
  lastFetchAt: number;
  isHydrated: boolean;
  swipedIds: Set<string>;
}

export interface SwipeDeckSlice {
  // Client dashboard deck (listings)
  clientDeck: DeckState;
  // Owner dashboard deck (clients) - keyed by category
  ownerDecks: Record<string, DeckState>;

  // Actions for client deck
  setClientDeck: (items: DeckItem[], append?: boolean) => void;
  setClientIndex: (index: number) => void;
  setClientPage: (page: number) => void;
  markClientSwiped: (id: string) => void;
  resetClientDeck: () => void;
  hydrateClientDeck: () => void;

  // Actions for owner deck
  setOwnerDeck: (category: string, items: DeckItem[], append?: boolean) => void;
  setOwnerIndex: (category: string, index: number) => void;
  setOwnerPage: (category: string, page: number) => void;
  markOwnerSwiped: (category: string, id: string) => void;
  resetOwnerDeck: (category: string) => void;
  hydrateOwnerDeck: (category: string) => void;

  // Get hydrated status
  isClientHydrated: () => boolean;
  isOwnerHydrated: (category: string) => boolean;

  // Get current deck items
  getClientDeckItems: () => DeckItem[];
  getOwnerDeckItems: (category: string) => DeckItem[];
}

const createEmptyDeckState = (): DeckState => ({
  deckItems: [],
  currentIndex: 0,
  currentPage: 0,
  lastFetchAt: 0,
  isHydrated: false,
  swipedIds: new Set(),
});

// Custom storage handler to serialize/deserialize Sets
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      const parsed = JSON.parse(str);
      // Convert arrays back to Sets
      if (parsed.state?.clientDeck?.swipedIds) {
        parsed.state.clientDeck.swipedIds = new Set(parsed.state.clientDeck.swipedIds);
      }
      if (parsed.state?.ownerDecks) {
        Object.keys(parsed.state.ownerDecks).forEach(key => {
          if (parsed.state.ownerDecks[key]?.swipedIds) {
            parsed.state.ownerDecks[key].swipedIds = new Set(parsed.state.ownerDecks[key].swipedIds);
          }
        });
      }
      return parsed;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    try {
      // Convert Sets to arrays for JSON serialization
      const toSerialize = { ...value };
      if (toSerialize.state?.clientDeck?.swipedIds instanceof Set) {
        toSerialize.state = { ...toSerialize.state };
        toSerialize.state.clientDeck = { ...toSerialize.state.clientDeck };
        toSerialize.state.clientDeck.swipedIds = Array.from(toSerialize.state.clientDeck.swipedIds);
      }
      if (toSerialize.state?.ownerDecks) {
        toSerialize.state = { ...toSerialize.state };
        toSerialize.state.ownerDecks = { ...toSerialize.state.ownerDecks };
        Object.keys(toSerialize.state.ownerDecks).forEach(key => {
          if (toSerialize.state.ownerDecks[key]?.swipedIds instanceof Set) {
            toSerialize.state.ownerDecks[key] = { ...toSerialize.state.ownerDecks[key] };
            toSerialize.state.ownerDecks[key].swipedIds = Array.from(toSerialize.state.ownerDecks[key].swipedIds);
          }
        });
      }
      localStorage.setItem(name, JSON.stringify(toSerialize));
    } catch (e) {
      console.warn('Failed to persist swipe deck state', e);
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useSwipeDeckStore = create<SwipeDeckSlice>()(
  persist(
    (set, get) => ({
      clientDeck: createEmptyDeckState(),
      ownerDecks: {},

      // Client deck actions
      setClientDeck: (items, append = false) => {
        set((state) => {
          const existingIds = new Set(state.clientDeck.deckItems.map(i => i.id));
          const swipedIds = state.clientDeck.swipedIds;

          // Filter out duplicates and already-swiped items
          const newItems = items.filter(item =>
            !existingIds.has(item.id) && !swipedIds.has(item.id)
          );

          let deckItems: DeckItem[];
          if (append && state.clientDeck.deckItems.length > 0) {
            deckItems = [...state.clientDeck.deckItems, ...newItems];
          } else if (state.clientDeck.deckItems.length > 0 && !append) {
            // If not appending but we have items, just add new ones
            deckItems = [...state.clientDeck.deckItems, ...newItems];
          } else {
            deckItems = items.filter(item => !swipedIds.has(item.id));
          }

          // Cap at 100 items to prevent memory bloat
          if (deckItems.length > 100) {
            const offset = deckItems.length - 100;
            deckItems = deckItems.slice(offset);
            return {
              clientDeck: {
                ...state.clientDeck,
                deckItems,
                currentIndex: Math.max(0, state.clientDeck.currentIndex - offset),
                lastFetchAt: Date.now(),
                isHydrated: true,
              }
            };
          }

          return {
            clientDeck: {
              ...state.clientDeck,
              deckItems,
              lastFetchAt: Date.now(),
              isHydrated: true,
            }
          };
        });
      },

      setClientIndex: (index) => {
        set((state) => ({
          clientDeck: { ...state.clientDeck, currentIndex: index }
        }));
      },

      setClientPage: (page) => {
        set((state) => ({
          clientDeck: { ...state.clientDeck, currentPage: page }
        }));
      },

      markClientSwiped: (id) => {
        set((state) => {
          const newSwipedIds = new Set(state.clientDeck.swipedIds);
          newSwipedIds.add(id);
          return {
            clientDeck: {
              ...state.clientDeck,
              swipedIds: newSwipedIds,
              currentIndex: state.clientDeck.currentIndex + 1,
            }
          };
        });
      },

      resetClientDeck: () => {
        set({ clientDeck: createEmptyDeckState() });
      },

      hydrateClientDeck: () => {
        set((state) => ({
          clientDeck: { ...state.clientDeck, isHydrated: true }
        }));
      },

      // Owner deck actions
      setOwnerDeck: (category, items, append = false) => {
        set((state) => {
          const existingDeck = state.ownerDecks[category] || createEmptyDeckState();
          const existingIds = new Set(existingDeck.deckItems.map(i => i.id));
          const swipedIds = existingDeck.swipedIds;

          // Filter out duplicates and already-swiped items
          const newItems = items.filter(item =>
            !existingIds.has(item.id) && !swipedIds.has(item.id)
          );

          let deckItems: DeckItem[];
          if (append && existingDeck.deckItems.length > 0) {
            deckItems = [...existingDeck.deckItems, ...newItems];
          } else if (existingDeck.deckItems.length > 0 && !append) {
            deckItems = [...existingDeck.deckItems, ...newItems];
          } else {
            deckItems = items.filter(item => !swipedIds.has(item.id));
          }

          // Cap at 100 items
          let currentIndex = existingDeck.currentIndex;
          if (deckItems.length > 100) {
            const offset = deckItems.length - 100;
            deckItems = deckItems.slice(offset);
            currentIndex = Math.max(0, currentIndex - offset);
          }

          return {
            ownerDecks: {
              ...state.ownerDecks,
              [category]: {
                ...existingDeck,
                deckItems,
                currentIndex,
                lastFetchAt: Date.now(),
                isHydrated: true,
              }
            }
          };
        });
      },

      setOwnerIndex: (category, index) => {
        set((state) => {
          const existingDeck = state.ownerDecks[category] || createEmptyDeckState();
          return {
            ownerDecks: {
              ...state.ownerDecks,
              [category]: { ...existingDeck, currentIndex: index }
            }
          };
        });
      },

      setOwnerPage: (category, page) => {
        set((state) => {
          const existingDeck = state.ownerDecks[category] || createEmptyDeckState();
          return {
            ownerDecks: {
              ...state.ownerDecks,
              [category]: { ...existingDeck, currentPage: page }
            }
          };
        });
      },

      markOwnerSwiped: (category, id) => {
        set((state) => {
          const existingDeck = state.ownerDecks[category] || createEmptyDeckState();
          const newSwipedIds = new Set(existingDeck.swipedIds);
          newSwipedIds.add(id);
          return {
            ownerDecks: {
              ...state.ownerDecks,
              [category]: {
                ...existingDeck,
                swipedIds: newSwipedIds,
                currentIndex: existingDeck.currentIndex + 1,
              }
            }
          };
        });
      },

      resetOwnerDeck: (category) => {
        set((state) => ({
          ownerDecks: {
            ...state.ownerDecks,
            [category]: createEmptyDeckState()
          }
        }));
      },

      hydrateOwnerDeck: (category) => {
        set((state) => {
          const existingDeck = state.ownerDecks[category] || createEmptyDeckState();
          return {
            ownerDecks: {
              ...state.ownerDecks,
              [category]: { ...existingDeck, isHydrated: true }
            }
          };
        });
      },

      // Getters
      isClientHydrated: () => get().clientDeck.isHydrated,
      isOwnerHydrated: (category) => get().ownerDecks[category]?.isHydrated || false,
      getClientDeckItems: () => get().clientDeck.deckItems,
      getOwnerDeckItems: (category) => get().ownerDecks[category]?.deckItems || [],
    }),
    {
      name: 'swipe-deck-store',
      storage: createJSONStorage(() => customStorage as any),
      partialize: (state) => ({
        // Only persist essential data, not full deck items (those are refetched)
        clientDeck: {
          currentIndex: state.clientDeck.currentIndex,
          currentPage: state.clientDeck.currentPage,
          isHydrated: state.clientDeck.isHydrated,
          swipedIds: state.clientDeck.swipedIds,
          // Keep deck items in session only (via separate sessionStorage logic if needed)
          deckItems: [],
          lastFetchAt: state.clientDeck.lastFetchAt,
        },
        ownerDecks: Object.fromEntries(
          Object.entries(state.ownerDecks).map(([key, deck]) => [
            key,
            {
              currentIndex: deck.currentIndex,
              currentPage: deck.currentPage,
              isHydrated: deck.isHydrated,
              swipedIds: deck.swipedIds,
              deckItems: [],
              lastFetchAt: deck.lastFetchAt,
            }
          ])
        ),
      }),
    }
  )
);

// Session storage for deck items (faster, clears on tab close)
const SESSION_KEY = 'swipe-deck-items';

export const persistDeckToSession = (role: 'client' | 'owner', category: string, items: DeckItem[]) => {
  try {
    const existing = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    const key = role === 'client' ? 'client' : `owner_${category}`;
    existing[key] = items.slice(0, 50); // Limit to 50 items
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(existing));
  } catch {
    // Session storage full or unavailable
  }
};

export const getDeckFromSession = (role: 'client' | 'owner', category: string): DeckItem[] => {
  try {
    const existing = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    const key = role === 'client' ? 'client' : `owner_${category}`;
    return existing[key] || [];
  } catch {
    return [];
  }
};

export const clearDeckSession = (role: 'client' | 'owner', category?: string) => {
  try {
    const existing = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    const key = role === 'client' ? 'client' : `owner_${category}`;
    delete existing[key];
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(existing));
  } catch {
    // Ignore
  }
};
