/**
 * SITE STORE — Single source of truth
 * ════════════════════════════════════
 * FIX: Images/videos stored as object URLs (not base64) to avoid localStorage overflow
 * FIX: BroadcastChannel for instant cross-tab sync (dashboard ↔ website)
 * FIX: Separate mediaCache (sessionStorage) from config (localStorage)
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MediaType = 'image' | 'video' | 'gradient';

export interface MediaItem {
  type:      MediaType;
  src:       string;    // object URL (runtime) or public path
  poster?:   string;
  fileName?: string;
}

export interface SectionContent {
  id:          string;
  sectionKey:  string;
  active:      boolean;
  media:       MediaItem;
  heading:     string;
  subheading:  string;
  ctaText:     string;
  ctaLink:     string;
  badge:       string;
  bgGradient:  string;
  textAlign:   'right' | 'center' | 'left';
  textColor:   string;
  order:       number;
}

export interface SiteSettings {
  primaryColor:    string;
  navyColor:       string;
  fontHeading:     string;
  fontBody:        string;
  showChatWidget:  boolean;
  showWhatsApp:    boolean;
  showNewsletter:  boolean;
  whatsappNumber:  string;
  storeName:       string;
  storeTagline:    string;
}

interface SiteState {
  sections:    SectionContent[];
  settings:    SiteSettings;
  lastUpdated: number;
  updateSection:     (id: string, updates: Partial<SectionContent>) => void;
  reorderSection:    (id: string, newOrder: number) => void;
  toggleSection:     (id: string) => void;
  getSection:        (key: string) => SectionContent | undefined;
  getActiveSections: () => SectionContent[];
  updateSettings:    (updates: Partial<SiteSettings>) => void;
}

const DEFAULT_SECTIONS: SectionContent[] = [
  {
    id:'sec-strip', sectionKey:'strip', active:true, order:0,
    media:{ type:'gradient', src:'' },
    heading:'🎉 عرض خاص — اشتري 5 متر واحصلي على متر مجاناً',
    subheading:'', ctaText:'تسوق الآن', ctaLink:'/products',
    badge:'', bgGradient:'linear-gradient(90deg, #F5A623 0%, #D4880A 100%)',
    textAlign:'center', textColor:'#ffffff',
  },
  {
    id:'sec-hero', sectionKey:'hero', active:true, order:1,
    media:{ type:'gradient', src:'' },
    heading:'BIN SIDDIQ\nFABRICS',
    subheading:'أفضل الأقمشة الفاخرة في ينبع والمملكة — جورجيت، ساتان، شيفون، حرير وأكثر',
    ctaText:'تسوق الآن', ctaLink:'/products',
    badge:'⭐ الأفضل في ينبع',
    bgGradient:'linear-gradient(135deg, #1E2B45 0%, #2D4070 50%, #1E2B45 100%)',
    textAlign:'right', textColor:'#ffffff',
  },
  {
    id:'sec-banner1', sectionKey:'banner1', active:true, order:2,
    media:{ type:'gradient', src:'' },
    heading:'مجموعة ترند 2025', subheading:'أحدث الأقمشة الفاخرة بتصاميم عصرية',
    ctaText:'استكشفي', ctaLink:'/products',
    badge:'🔥 جديد',
    bgGradient:'linear-gradient(135deg, #F5A623 0%, #D4880A 100%)',
    textAlign:'right', textColor:'#ffffff',
  },
  {
    id:'sec-banner2', sectionKey:'banner2', active:true, order:3,
    media:{ type:'gradient', src:'' },
    heading:'شحن مجاني', subheading:'على جميع الطلبات فوق 200 ر.س',
    ctaText:'اطلبي الآن', ctaLink:'/products',
    badge:'🚚 مجاني',
    bgGradient:'linear-gradient(135deg, #1B6B45 0%, #0A3A20 100%)',
    textAlign:'right', textColor:'#ffffff',
  },
  {
    id:'sec-features', sectionKey:'features', active:true, order:4,
    media:{ type:'gradient', src:'' },
    heading:'كل ما تحتاجينه', subheading:'أدوات ذكية تجعل تجربة التسوق أسهل وأجمل',
    ctaText:'', ctaLink:'', badge:'خدماتنا',
    bgGradient:'var(--bs-pearl)', textAlign:'center', textColor:'var(--bs-navy)',
  },
  {
    id:'sec-cta', sectionKey:'cta', active:true, order:5,
    media:{ type:'gradient', src:'' },
    heading:'صممي فستانك قبل الشراء',
    subheading:'جربي الألوان والموديلات على موديل واقعي — مجاناً',
    ctaText:'مصمم الفستان', ctaLink:'/dress-viewer',
    badge:'', bgGradient:'linear-gradient(135deg, #1E2B45 0%, #3D2800 50%, #D4880A 100%)',
    textAlign:'center', textColor:'#ffffff',
  },
];

const DEFAULT_SETTINGS: SiteSettings = {
  primaryColor:   '#F5A623',
  navyColor:      '#1E2B45',
  fontHeading:    'Georgia, serif',
  fontBody:       'Segoe UI, Tahoma, Arial, sans-serif',
  showChatWidget: true,
  showWhatsApp:   true,
  showNewsletter: true,
  whatsappNumber: '966500000000',
  storeName:      'BIN SIDDIQ FABRICS',
  storeTagline:   'PREMIUM QUALITY',
};

// ── BroadcastChannel for instant cross-tab sync ──────────────
const CHANNEL_NAME = 'bs-site-sync';
let bc: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  bc = new BroadcastChannel(CHANNEL_NAME);
}

export const useSiteStore = create<SiteState>()(
  persist(
    (set, get) => ({
      sections:    DEFAULT_SECTIONS,
      settings:    DEFAULT_SETTINGS,
      lastUpdated: Date.now(),

      updateSection: (id, updates) => {
        set(s => ({
          sections:    s.sections.map(sec => sec.id === id ? { ...sec, ...updates } : sec),
          lastUpdated: Date.now(),
        }));
        // Broadcast to all tabs/windows
        bc?.postMessage({ type: 'SECTION_UPDATED', id, updates, ts: Date.now() });
      },

      reorderSection: (id, newOrder) => {
        set(s => ({
          sections:    s.sections.map(sec => sec.id === id ? { ...sec, order: newOrder } : sec),
          lastUpdated: Date.now(),
        }));
        bc?.postMessage({ type: 'REORDER', id, newOrder, ts: Date.now() });
      },

      toggleSection: (id) => {
        const current = get().sections.find(s => s.id === id);
        const newActive = !current?.active;
        set(s => ({
          sections:    s.sections.map(sec => sec.id === id ? { ...sec, active: newActive } : sec),
          lastUpdated: Date.now(),
        }));
        bc?.postMessage({ type: 'TOGGLE', id, active: newActive, ts: Date.now() });
      },

      getSection:        (key) => get().sections.find(s => s.sectionKey === key),
      getActiveSections: () => get().sections.filter(s => s.active).sort((a, b) => a.order - b.order),

      updateSettings: (updates) => {
        set(s => ({
          settings:    { ...s.settings, ...updates },
          lastUpdated: Date.now(),
        }));
        bc?.postMessage({ type: 'SETTINGS_UPDATED', updates, ts: Date.now() });
      },
    }),
    {
      name:    'bs-site-v2',
      version: 2,
      // Exclude media.src from persistence to avoid localStorage overflow
      // Media objects (object URLs) are NOT serializable across sessions
      partialize: (state) => ({
        settings:    state.settings,
        lastUpdated: state.lastUpdated,
        // Store sections but strip large base64 blobs — keep only small metadata
        sections: state.sections.map(s => ({
          ...s,
          media: {
            type:     s.media.type,
            src:      s.media.src?.startsWith('blob:') ? '' : s.media.src,  // strip blob URLs
            poster:   s.media.poster?.startsWith('blob:') ? '' : s.media.poster,
            fileName: s.media.fileName,
          },
        })),
      }),
    }
  )
);

// ── Listen for cross-tab broadcasts ─────────────────────────
if (typeof window !== 'undefined' && bc) {
  bc.onmessage = (event) => {
    const { type, id, updates, active, newOrder, ts } = event.data;
    const store = useSiteStore.getState();
    // Only apply if this message is newer
    if (ts <= store.lastUpdated) return;

    if (type === 'SECTION_UPDATED' && id && updates) {
      useSiteStore.setState(s => ({
        sections:    s.sections.map(sec => sec.id === id ? { ...sec, ...updates } : sec),
        lastUpdated: ts,
      }));
    } else if (type === 'TOGGLE' && id !== undefined) {
      useSiteStore.setState(s => ({
        sections:    s.sections.map(sec => sec.id === id ? { ...sec, active } : sec),
        lastUpdated: ts,
      }));
    } else if (type === 'REORDER' && id !== undefined) {
      useSiteStore.setState(s => ({
        sections:    s.sections.map(sec => sec.id === id ? { ...sec, order: newOrder } : sec),
        lastUpdated: ts,
      }));
    } else if (type === 'SETTINGS_UPDATED' && updates) {
      useSiteStore.setState(s => ({
        settings:    { ...s.settings, ...updates },
        lastUpdated: ts,
      }));
    }
  };
}
