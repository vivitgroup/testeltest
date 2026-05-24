'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { usePathname } from 'next/navigation';
import { useSiteStore } from '@/stores/siteStore';

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount  = useCartStore(s => s.itemCount());
  const pathname   = usePathname();
  const storeName  = useSiteStore(s => s.settings.storeName);
  const tagline    = useSiteStore(s => s.settings.storeTagline);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  const LINKS = [
    { href:'/',             label:'الرئيسية'      },
    { href:'/products',     label:'الأقمشة'        },
    { href:'/dress-viewer', label:'مصمم الفستان'  },
    { href:'/ai-measure',   label:'حاسبة القماش'  },
    { href:'/chat',         label:'المساعد الذكي' },
    { href:'/orders',            label:'طلباتي'             },
    { href:'/occasion-planner',  label:'مخطط المناسبة'  },
    { href:'/bundles',           label:'حزم الأقمشة'    },
    { href:'/inspiration',       label:'إلهام أسبوعي'  },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background:     scrolled ? 'rgba(255,251,245,0.97)' : 'rgba(255,251,245,0.98)',
          backdropFilter: 'blur(12px)',
          boxShadow:      scrolled ? '0 2px 20px rgba(30,43,69,0.1)' : '0 1px 0 rgba(30,43,69,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 group-hover:shadow-md transition-all">
                <Image src="/logo.jpg" alt={storeName} width={40} height={40}
                       className="w-full h-full object-contain" priority/>
              </div>
              <div className="hidden xs:block">
                <p className="text-xs sm:text-sm font-black leading-none" style={{ color:'var(--bs-navy)', fontFamily:'Georgia,serif' }}>
                  {storeName || 'BIN SIDDIQ'}
                </p>
                <p className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color:'var(--bs-primary)' }}>
                  {tagline || 'FABRICS'}
                </p>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition-all relative"
                  style={{
                    color:      isActive(l.href) ? 'var(--bs-primary)' : '#4A5568',
                    background: isActive(l.href) ? 'rgba(245,166,35,0.1)' : 'transparent',
                  }}>
                  {l.label}
                  {isActive(l.href) && (
                    <span className="absolute bottom-0.5 right-3 left-3 h-0.5 rounded-full"
                          style={{ background: 'var(--bs-grad)' }}/>
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/cart"
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
                style={{ color: 'var(--bs-navy)' }}>
                <ShoppingCart className="w-5 h-5"/>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px] font-black text-white rounded-full flex items-center justify-center px-1 animate-cart-pop"
                        style={{ background: 'var(--bs-primary)' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
              <Link href="/login" className="hidden sm:flex btn-primary text-sm py-2 px-4">
                دخول
              </Link>
              <button onClick={() => setOpen(!open)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/5"
                aria-label="القائمة">
                {open ? <X className="w-5 h-5" style={{ color:'var(--bs-navy)' }}/> 
                      : <Menu className="w-5 h-5" style={{ color:'var(--bs-navy)' }}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden animate-menu border-t"
               style={{ borderColor:'rgba(30,43,69,0.08)', background:'rgba(255,251,245,0.99)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
              {LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    color:      isActive(l.href) ? 'var(--bs-primary)' : '#374151',
                    background: isActive(l.href) ? 'rgba(245,166,35,0.08)' : 'transparent',
                  }}>
                  {isActive(l.href) && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'var(--bs-primary)' }}/>}
                  {l.label}
                </Link>
              ))}
              <div className="pt-2 border-t" style={{ borderColor:'rgba(30,43,69,0.06)' }}>
                <Link href="/login" className="btn-primary w-full justify-center py-3.5 font-black text-base">
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 safe-bottom"
           style={{ background:'rgba(255,251,245,0.97)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(30,43,69,0.08)' }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          {[
            { href:'/',             icon:'🏠',  label:'الرئيسية' },
            { href:'/products',     icon:'🧵',  label:'الأقمشة'  },
            { href:'/dress-viewer', icon:'👗',  label:'مصمم'      },
            { href:'/ai-measure',   icon:'📏',  label:'حاسبة'     },
            { href:'/cart',         icon:'🛒',  label:'السلة', badge: itemCount },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] transition-all"
              style={{ color: isActive(item.href) ? 'var(--bs-primary)' : '#9BA5B4' }}>
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[9px] font-semibold">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 text-[9px] font-black text-white rounded-full flex items-center justify-center"
                      style={{ background:'var(--bs-primary)' }}>
                  {item.badge}
                </span>
              )}
              {isActive(item.href) && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full" style={{ background:'var(--bs-primary)' }}/>
              )}
            </Link>
          ))}
        </div>
      </div>
      <div className="lg:hidden h-16"/>
    </>
  );
}
