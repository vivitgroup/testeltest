'use client';

import { useState, useRef, useCallback } from 'react';
import { Check, ShoppingCart, Sparkles, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';

// ── SKIN TONES ────────────────────────────────────────────────
const SKIN_TONES = [
  { name:'fair',   label:'فاتح جداً', overlay:'rgba(255,228,196,0.18)' },
  { name:'light',  label:'فاتح',       overlay:'rgba(240,200,152,0.22)' },
  { name:'wheat',  label:'قمحي',        overlay:'rgba(200,140,90,0.25)'  },
  { name:'olive',  label:'زيتوني',      overlay:'rgba(175,110,65,0.28)'  },
  { name:'brown',  label:'بني',         overlay:'rgba(130,75,42,0.32)'   },
  { name:'dark',   label:'أسمر',        overlay:'rgba(85,45,25,0.38)'    },
];

// ── SKIN HEX (used for CSS tint on the mannequin image) ──────
const SKIN_HEX = ['#FDDBB4','#F0C898','#D4956A','#C07850','#8B5030','#5A3020'];

// ── FABRIC COLORS (2025 trends) ───────────────────────────────
const FABRICS = [
  { id:'1',  name:'أحمر ملكي',     hex:'#D41E2F', dark:'#8B1A1A', price:85,  cat:'جورجيت', trend:true  },
  { id:'2',  name:'ذهبي فاخر',     hex:'#D4AF37', dark:'#A08020', price:250, cat:'ساتان',  trend:false },
  { id:'3',  name:'كحلي ليلي',     hex:'#1E3A5F', dark:'#0A1E3A', price:65,  cat:'شيفون',  trend:false },
  { id:'4',  name:'أبيض عاجي',     hex:'#F5F0E8', dark:'#D4C9B0', price:220, cat:'حرير',   trend:true  },
  { id:'5',  name:'برغندي عميق',   hex:'#800020', dark:'#4A0010', price:180, cat:'قطيفة',  trend:true  },
  { id:'6',  name:'أسود كلاسيك',   hex:'#1A1A1A', dark:'#050505', price:65,  cat:'شيفون',  trend:false },
  { id:'7',  name:'وردي فوشيا',    hex:'#E91E8C', dark:'#A0126A', price:95,  cat:'جورجيت', trend:true  },
  { id:'8',  name:'زيتوني ناعم',   hex:'#556B2F', dark:'#2F3D1A', price:95,  cat:'كريب',   trend:false },
  { id:'9',  name:'برتقالي دافئ',  hex:'#F5A623', dark:'#D4880A', price:85,  cat:'جورجيت', trend:true  },
  { id:'10', name:'تيل زمردي',     hex:'#1B7B6B', dark:'#0A4040', price:95,  cat:'كريب',   trend:true  },
  { id:'11', name:'بنفسجي',         hex:'#7B3F9E', dark:'#4A1A6A', price:120, cat:'ساتان',  trend:false },
  { id:'12', name:'رمادي راقي',    hex:'#8C8C9A', dark:'#4A4A5A', price:65,  cat:'شيفون',  trend:false },
];

// ── DRESS STYLES ───────────────────────────────────────────────
const STYLES = [
  { id:'aline',   label:'A-Line',      emoji:'👗' },
  { id:'fitted',  label:'Bodycon',     emoji:'✨' },
  { id:'mermaid', label:'حورية البحر', emoji:'🌊' },
  { id:'balloon', label:'Balloon Hem', emoji:'🎀' },
  { id:'empire',  label:'Empire',      emoji:'👑' },
  { id:'wrap',    label:'Wrap',        emoji:'🌸' },
];

export default function DressViewer() {
  const [skinIdx,  setSkinIdx]  = useState(2);
  const [fabric,   setFabric]   = useState(FABRICS[0]);
  const [style,    setStyle]    = useState(STYLES[0]);
  const [meters,   setMeters]   = useState(3);
  const [added,    setAdded]    = useState(false);
  const [showTrend,setShowTrend]= useState(false);

  // 360° drag rotation
  const [angle,      setAngle]      = useState(0);
  const [dragging,   setDragging]   = useState(false);
  const [startX,     setStartX]     = useState(0);
  const [startAngle, setStartAngle] = useState(0);

  const addItem = useCartStore(s => s.addItem);
  const skin    = SKIN_TONES[skinIdx];
  const displayFabrics = showTrend ? FABRICS.filter(f => f.trend) : FABRICS;

  // ── 360° mouse/touch handlers ─────────────────────────────
  const onDown = useCallback((clientX: number) => {
    setDragging(true);
    setStartX(clientX);
    setStartAngle(angle);
  }, [angle]);

  const onMove = useCallback((clientX: number) => {
    if (!dragging) return;
    setAngle(startAngle + (clientX - startX) / 1.5);
  }, [dragging, startX, startAngle]);

  const onUp = useCallback(() => setDragging(false), []);

  // Perspective transform: angle → scaleX
  const norm   = ((angle % 360) + 360) % 360;
  const scaleX = Math.abs(Math.cos((norm * Math.PI) / 180));
  const isBack = norm > 90 && norm < 270;

  const handleAdd = () => {
    addItem({
      id: fabric.id, name: `قماش ${fabric.name} — ${fabric.cat}`,
      description:'', price: fabric.price, price_per_meter: fabric.price,
      category: fabric.cat, colors:[{ name: fabric.name, hex: fabric.hex }],
      images:[], stock_quantity:100, is_active:true,
    }, meters, { name: fabric.name, hex: fabric.hex });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">

        {/* ══ MODEL VIEWER ══ */}
        <div className="flex flex-col items-center">
          {/* The dress frame */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl select-none"
            style={{
              width:      'min(300px, 88vw)',
              aspectRatio: '3/5',
              cursor:      dragging ? 'grabbing' : 'grab',
              background:  '#1a1a1a',
            }}
            onMouseDown={e => onDown(e.clientX)}
            onMouseMove={e => onMove(e.clientX)}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={e => onDown(e.touches[0].clientX)}
            onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX); }}
            onTouchEnd={onUp}
          >
            {/* ── Real dress image (the uploaded photo) ── */}
            <Image
              src="/model-dress.jpg"
              alt="موديل الفستان"
              fill
              className="object-cover object-top"
              priority
              style={{
                transform:  `scaleX(${isBack ? -scaleX : scaleX})`,
                transition:  dragging ? 'none' : 'transform 0.04s linear',
              }}
            />

            {/* ── Fabric color overlay (CSS mix-blend tint) ── */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-500"
              style={{
                background:   `linear-gradient(180deg, ${fabric.hex}55 0%, ${fabric.dark}88 50%, ${fabric.hex}44 100%)`,
                mixBlendMode: 'multiply',
                opacity:      fabric.id === '4' ? 0.05 : 0.45, // white stays white
              }}
            />

            {/* ── Skin tone tint on upper body ── */}
            <div
              className="absolute pointer-events-none transition-all duration-500"
              style={{
                top:0, left:0, right:0, height:'40%',
                background:   SKIN_HEX[skinIdx] + '40',
                mixBlendMode: 'soft-light',
              }}
            />

            {/* ── Style label badge ── */}
            <div className="absolute top-3 right-3 z-10">
              <span className="text-xs font-black px-2.5 py-1 rounded-full text-white backdrop-blur-sm"
                    style={{ background:'rgba(0,0,0,0.5)' }}>
                {style.emoji} {style.label}
              </span>
            </div>

            {/* ── 360 drag hint ── */}
            <div className="absolute top-3 left-3 z-10">
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-white backdrop-blur-sm"
                    style={{ background:'rgba(0,0,0,0.45)' }}>
                <RotateCcw className="w-2.5 h-2.5"/> 360°
              </span>
            </div>

            {/* ── Info pill at bottom ── */}
            <div className="absolute bottom-3 inset-x-3 z-10">
              <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-xl px-3.5 py-2.5 shadow"
                   style={{ borderTop:`2.5px solid ${fabric.hex}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow flex-shrink-0"
                       style={{ background: SKIN_HEX[skinIdx] }}/>
                  <p className="text-[10px] font-black" style={{ color:'var(--bs-navy)' }}>{skin.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black" style={{ color:'var(--bs-navy)' }}>{fabric.name}</p>
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow flex-shrink-0"
                       style={{ background: fabric.hex }}/>
                </div>
              </div>
            </div>
          </div>

          {/* Rotation controls */}
          <div className="flex items-center gap-3 mt-4 w-full max-w-[300px]">
            <button onClick={() => setAngle(a => a - 45)}
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all hover:shadow"
              style={{ borderColor:'var(--bs-primary)', color:'var(--bs-primary)' }}>
              <ChevronRight className="w-4 h-4"/>
            </button>
            <div className="flex-1 text-center">
              <p className="font-black text-lg" style={{ color:'var(--bs-navy)' }}>
                {(fabric.price * meters).toFixed(0)}<span className="text-sm font-normal text-gray-400 mr-1">ر.س</span>
              </p>
              <p className="text-xs text-gray-400">{meters} متر · {fabric.name}</p>
            </div>
            <button onClick={() => setAngle(a => a + 45)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:opacity-90"
              style={{ background:'var(--bs-grad)' }}>
              <ChevronLeft className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* ══ CONTROLS ══ */}
        <div className="space-y-6">

          {/* Skin tones */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full" style={{ background:'var(--bs-grad)' }}/>
              <h3 className="font-black text-sm sm:text-base" style={{ color:'var(--bs-navy)' }}>لون البشرة</h3>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {SKIN_TONES.map((t, i) => (
                <button key={t.name} onClick={() => setSkinIdx(i)}
                  className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full relative transition-all duration-300"
                       style={{
                         background: SKIN_HEX[i],
                         transform:  skinIdx === i ? 'scale(1.22)' : 'scale(1)',
                         boxShadow:  skinIdx === i
                           ? `0 0 0 2.5px white, 0 0 0 5px var(--bs-primary), 0 4px 12px ${SKIN_HEX[i]}66`
                           : `0 2px 6px ${SKIN_HEX[i]}55`,
                       }}>
                    {skinIdx === i && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/10">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3}/>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-semibold"
                        style={{ color: skinIdx === i ? 'var(--bs-navy)' : 'var(--bs-silver)' }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fabric colors */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ background:'var(--bs-silver)' }}/>
                <h3 className="font-black text-sm sm:text-base" style={{ color:'var(--bs-navy)' }}>لون القماش</h3>
              </div>
              <button onClick={() => setShowTrend(!showTrend)}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: showTrend ? 'var(--bs-primary)' : 'rgba(245,166,35,0.1)',
                  color:      showTrend ? 'white' : 'var(--bs-primary)',
                }}>
                {showTrend ? '✓ ترند 2025' : '🔥 ترند 2025'}
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-2.5">
              {displayFabrics.map(f => (
                <button key={f.id} onClick={() => setFabric(f)}
                  className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded-xl relative overflow-hidden transition-all duration-200"
                       style={{
                         background: `linear-gradient(135deg, ${f.hex}, ${f.dark})`,
                         transform:  fabric.id === f.id ? 'scale(1.12)' : 'scale(1)',
                         boxShadow:  fabric.id === f.id
                           ? `0 0 0 2.5px white, 0 0 0 4.5px var(--bs-primary), 0 4px 12px ${f.hex}44`
                           : `0 2px 5px ${f.hex}33`,
                       }}>
                    {fabric.id === f.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                        <Check className="w-4 h-4 text-white" strokeWidth={3}/>
                      </div>
                    )}
                    {f.trend && (
                      <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-orange-400 border border-white"/>
                    )}
                  </div>
                  <span className="text-[9px] text-center leading-tight truncate w-full"
                        style={{ color: fabric.id === f.id ? 'var(--bs-navy)' : 'var(--bs-silver)', fontWeight: fabric.id === f.id ? 700 : 400 }}>
                    {f.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dress styles */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full" style={{ background:'var(--bs-grad)' }}/>
              <h3 className="font-black text-sm sm:text-base" style={{ color:'var(--bs-navy)' }}>موديل الفستان</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s)}
                  className="p-2.5 rounded-xl border-2 text-right transition-all"
                  style={{
                    borderColor: style.id === s.id ? 'var(--bs-primary)' : 'var(--bs-border)',
                    background:  style.id === s.id ? 'rgba(245,166,35,0.06)' : 'white',
                    transform:   style.id === s.id ? 'scale(1.02)' : 'scale(1)',
                  }}>
                  <p className="font-black text-xs sm:text-sm" style={{ color: style.id===s.id?'var(--bs-navy)':'#374151' }}>
                    {s.emoji} {s.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Meters slider */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full" style={{ background:'var(--bs-silver)' }}/>
              <h3 className="font-black text-sm sm:text-base" style={{ color:'var(--bs-navy)' }}>الكمية (متر)</h3>
            </div>
            <div className="card-pearl p-4 rounded-xl">
              <input type="range" min={1} max={10} step={0.5} value={meters}
                onChange={e => setMeters(Number(e.target.value))}
                className="w-full mb-2" style={{ accentColor:'var(--bs-primary)' }}/>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">1م</span>
                <span className="font-black text-2xl" style={{ color:'var(--bs-navy)' }}>{meters}م</span>
                <span className="text-xs text-gray-400">10م</span>
              </div>
              <Link href="/ai-measure"
                className="flex items-center justify-center gap-1.5 text-xs mt-2.5 py-2 rounded-lg font-medium"
                style={{ color:'var(--bs-primary)', background:'rgba(245,166,35,0.08)' }}>
                <Sparkles className="w-3 h-3"/> مش عارفة الكمية؟ استخدمي الحاسبة
              </Link>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex gap-3">
            <button onClick={handleAdd}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-base font-black text-white transition-all"
              style={{
                background: added ? '#16a34a' : 'var(--bs-grad)',
                boxShadow:  `0 4px 16px ${added ? 'rgba(22,163,74,0.4)' : 'rgba(245,166,35,0.4)'}`,
                transform:  added ? 'scale(0.97)' : 'scale(1)',
              }}>
              {added
                ? <><Check className="w-5 h-5" strokeWidth={3}/> أضيف للسلة!</>
                : <><ShoppingCart className="w-5 h-5"/> أضف للسلة</>
              }
            </button>
            <Link href="/cart"
              className="px-5 py-4 rounded-xl font-bold text-sm border-2 transition-all hover:opacity-80"
              style={{ borderColor:'var(--bs-border)', color:'#555', background:'rgba(155,165,180,0.1)' }}>
              🛒
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
