import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface WishlistState {
  items:     Product[];
  addItem:   (p: Product) => void;
  removeItem:(id: string) => void;
  toggle:    (p: Product) => void;
  has:       (id: string) => boolean;
  clear:     () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem:    (p) => set(s => ({ items: s.items.find(i => i.id === p.id) ? s.items : [...s.items, p] })),
      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      toggle:     (p) => get().has(p.id) ? get().removeItem(p.id) : get().addItem(p),
      has:        (id) => get().items.some(i => i.id === id),
      clear:      () => set({ items: [] }),
    }),
    { name: 'bs-wishlist-v1' }
  )
);
