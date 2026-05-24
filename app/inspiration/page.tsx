'use client';
import { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { Heart, Share2, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';

const SEASONS = ['الكل', 'صيف 2025', 'رمضان 2025', 'شتاء 2025', 'مناسبات'];

const BOARDS = [
  { id:'1', title:'أميرات النيل',    season:'صيف 2025',     tag:'ترند',   emoji:'🌊', gradient:'linear-gradient(135deg,#1B7B6B,#0A4040)', desc:'فساتين متدفقة بألوان البحر والطبيعة', fabrics:[{ id:'3', name:'شيفون', price:65 },{ id:'1', name:'جورجيت', price:85 }] },
  { id:'2', title:'ليالي رمضان',     season:'رمضان 2025',   tag:'روحاني', emoji:'🌙', gradient:'linear-gradient(135deg,#1E2B45,#D4AF37)', desc:'قفاطين وعبايات بذهب رمضاني ناعم', fabrics:[{ id:'2', name:'ساتان', price:250 },{ id:'6', name:'حرير', price:450 }] },
  { id:'3', title:'الكلاسيك الأبدي', season:'مناسبات',      tag:'فاخر',   emoji:'✨', gradient:'linear-gradient(135deg,#2D4070,#1E2B45)', desc:'أناقة لا تنتهي في الأسود والكحلي', fabrics:[{ id:'7', name:'قطيفة', price:180 },{ id:'5', name:'كريب', price:95 }] },
  { id:'4', title:'وردة الصحراء',    season:'شتاء 2025',    tag:'دافئ',   emoji:'🌹', gradient:'linear-gradient(135deg,#800020,#D41E2F)', desc:'برغندي وأحمر ملكي للمناسبات الشتوية', fabrics:[{ id:'7', name:'قطيفة', price:180 },{ id:'8', name:'دانتيل', price:320 }] },
  { id:'5', title:'النقاء الخالص',   season:'مناسبات',      tag:'عروس',   emoji:'🤍', gradient:'linear-gradient(135deg,#E8E4DC,#C8C0B0)', desc:'أبيض وعاجي لفساتين الأعراس الأنيقة', fabrics:[{ id:'2', name:'ساتان', price:250 },{ id:'8', name:'دانتيل', price:320 }] },
  { id:'6', title:'الذهب المعدني',   season:'صيف 2025',     tag:'مضيء',   emoji:'🏆', gradient:'linear-gradient(135deg,#D4AF37,#C9922A)', desc:'ألوان معدنية لامعة تناسب الليالي الصيفية', fabrics:[{ id:'2', name:'ساتان', price:250 },{ id:'6', name:'حرير', price:450 }] },
  { id:'7', title:'حديقة الفل',      season:'صيف 2025',     tag:'عطري',   emoji:'🌸', gradient:'linear-gradient(135deg,#E8A0B0,#C2185B)', desc:'وردي وأبيض ناعم للنهارات المشمسة', fabrics:[{ id:'3', name:'شيفون', price:65 },{ id:'1', name:'جورجيت', price:85 }] },
  { id:'8', title:'أسرار الشرق',     season:'رمضان 2025',   tag:'أصيل',   emoji:'🕌', gradient:'linear-gradient(135deg,#7B3F9E,#5C1A7A)', desc:'بنفسجي وذهبي لإطلالة شرقية أصيلة', fabrics:[{ id:'11', id2:'2', name:'بنفسجي+ذهبي', price:120 }] as any },
];

const TAG_COLORS: Record<string, string> = {
  'ترند': '#E91E8C', 'روحاني': '#D4AF37', 'فاخر': '#7B3F9E',
  'دافئ': '#D41E2F', 'عروس': '#1E2B45', 'مضيء': '#D4AF37',
  'عطري': '#E91E8C', 'أصيل': '#7B3F9E',
};

export default function InspirationPage() {
  const [season,  setSeason]  = useState('الكل');
  const [liked,   setLiked]   = useState<Set<string>>(new Set());
  const [shared,  setShared]  = useState<string|null>(null);
  const wishlist = useWishlistStore();
  const addItem  = useCartStore(s => s.addItem);

  const filtered = season === 'الكل' ? BOARDS : BOARDS.filter(b => b.season === season);

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleShare = (title: string, id: string) => {
    if (navigator.share) {
      navigator.share({ title: `إلهام: ${title}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).catch(()=>{});
      setShared(id);
      setTimeout(() => setShared(null), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      <Navbar/>

      {/* Hero */}
      <div className="relative overflow-hidden py-14 text-center" style={{ background:'var(--bs-grad-hero)' }}>
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--bs-primary)' }}>
          إلهام أسبوعي
        </p>
        <h1 className="font-black text-white mb-2" style={{ fontSize:'clamp(1.8rem,5vw,3rem)', fontFamily:'Georgia,serif' }}>
          لوحات الإلهام
        </h1>
        <p className="text-white/70 text-sm max-w-md mx-auto">
          مجلة أزياء حصرية — تجددها فريق بن صديق أسبوعياً لتواكبي أحدث الترندات
        </p>
      </div>

      <main className="flex-1 page-container">
        {/* Season filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8" style={{ scrollbarWidth:'none' }}>
          {SEASONS.map(s => (
            <button key={s} onClick={() => setSeason(s)}
              className="flex-shrink-0 text-sm px-4 py-2 rounded-full font-bold transition-all"
              style={{
                background: season === s ? 'var(--bs-grad)' : 'white',
                color:      season === s ? 'white' : 'var(--bs-silver)',
                border:     `1.5px solid ${season === s ? 'transparent' : 'var(--bs-border)'}`,
                boxShadow:  season === s ? '0 2px 8px rgba(245,166,35,0.3)' : 'none',
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((board, i) => (
            <div key={board.id} className="break-inside-avoid card bg-white overflow-hidden group">
              {/* Visual */}
              <div className="relative overflow-hidden" style={{ height: 160 + (i % 3) * 40, background: board.gradient }}>
                <div className="absolute inset-0 opacity-[0.06]"
                     style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3C/g%3E%3C/svg%3E")` }}/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity">{board.emoji}</span>
                </div>
                {/* Season tag */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                    {board.season}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
                        style={{ background: TAG_COLORS[board.tag] || 'var(--bs-primary)' }}>
                    {board.tag}
                  </span>
                </div>
                {/* Like + Share */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <button onClick={() => toggleLike(board.id)}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110">
                    <Heart className="w-4 h-4" fill={liked.has(board.id) ? '#E91E8C' : 'none'}
                           style={{ color: liked.has(board.id) ? '#E91E8C' : 'white' }}/>
                  </button>
                  <button onClick={() => handleShare(board.title, board.id)}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110">
                    <Share2 className="w-4 h-4 text-white"/>
                  </button>
                </div>
                {shared === board.id && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1.5 rounded-full bg-white text-green-600 shadow animate-float-up">
                    ✓ تم النسخ
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-black text-base mb-1" style={{ color:'var(--bs-navy)' }}>{board.title}</h3>
                <p className="text-xs text-gray-400 mb-3 leading-relaxed">{board.desc}</p>

                {/* Suggested fabrics */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {board.fabrics.map((f: any) => (
                    <Link key={f.id} href={`/products/${f.id}`}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
                      style={{ background:'rgba(245,166,35,0.1)', color:'var(--bs-navy)' }}>
                      🧵 {f.name} — {f.price} ر.س/م
                    </Link>
                  ))}
                </div>

                <Link href="/products"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-black text-white transition-all hover:opacity-90"
                  style={{ background:'var(--bs-grad)' }}>
                  <ShoppingCart className="w-3.5 h-3.5"/> تسوقي هذا الإلهام
                </Link>
              </div>
            </div>
          ))}
        </div>

        {liked.size > 0 && (
          <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 animate-float-up">
            <Link href="/products"
              className="flex items-center gap-2 px-6 py-3.5 rounded-full font-black text-white shadow-2xl"
              style={{ background:'var(--bs-grad)', boxShadow:'0 8px 24px rgba(245,166,35,0.4)' }}>
              <Heart className="w-4 h-4" fill="white"/>
              {liked.size} لوحة معجبتني — تسوقي الآن
            </Link>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}
