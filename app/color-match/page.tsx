'use client';

import { useState, useRef, useCallback } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { Upload, Palette, X, ShoppingCart } from 'lucide-react';

// ── Color harmony rules ──────────────────────────────────────
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0))/6; break;
      case g: h = ((b-r)/d + 2)/6; break;
      case b: h = ((r-g)/d + 4)/6; break;
    }
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h/30) % 12;
  const a = s * Math.min(l, 1-l);
  const f = (n: number) => l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)));
  return '#' + [f(0),f(8),f(4)].map(x => Math.round(255*x).toString(16).padStart(2,'0')).join('');
}

// Fabric products with colors
const FABRIC_COLORS = [
  { id:'1',  name:'أحمر ملكي',    hex:'#D41E2F', price:85,  cat:'جورجيت' },
  { id:'2',  name:'ذهبي فاخر',    hex:'#D4AF37', price:250, cat:'ساتان'  },
  { id:'3',  name:'كحلي ليلي',    hex:'#1E3A5F', price:65,  cat:'شيفون'  },
  { id:'4',  name:'أبيض عاجي',    hex:'#F5F0E8', price:220, cat:'حرير'   },
  { id:'5',  name:'برغندي',        hex:'#800020', price:180, cat:'قطيفة'  },
  { id:'6',  name:'زيتوني',        hex:'#556B2F', price:95,  cat:'كريب'   },
  { id:'7',  name:'أسود كلاسيك',  hex:'#1A1A1A', price:65,  cat:'شيفون'  },
  { id:'8',  name:'وردي فوشيا',   hex:'#E91E8C', price:95,  cat:'جورجيت' },
  { id:'9',  name:'برتقالي دافئ', hex:'#F5A623', price:85,  cat:'جورجيت' },
  { id:'10', name:'تيل زمردي',    hex:'#1B7B6B', price:95,  cat:'كريب'   },
  { id:'11', name:'بنفسجي',        hex:'#7B3F9E', price:120, cat:'ساتان'  },
  { id:'12', name:'فضي لامع',     hex:'#B8B8B8', price:120, cat:'ساتان'  },
  { id:'13', name:'كريمي دافئ',   hex:'#EDE0C8', price:85,  cat:'جورجيت' },
  { id:'14', name:'أزرق سماوي',   hex:'#4A90D9', price:75,  cat:'شيفون'  },
];

function findHarmonious(uploadedHex: string): typeof FABRIC_COLORS {
  const [h, s, l] = hexToHsl(uploadedHex);

  // Complementary (opposite on color wheel)
  const compH = (h + 180) % 360;
  // Analogous (30° apart)
  const ana1H = (h + 30) % 360;
  const ana2H = (h - 30 + 360) % 360;
  // Triadic
  const tri1H = (h + 120) % 360;
  const tri2H = (h + 240) % 360;
  // Neutral always works
  const neutralScore = (hex: string) => {
    const [,ns,nl] = hexToHsl(hex);
    return ns < 15 || nl > 85 || nl < 15; // grays/whites/blacks
  };

  return FABRIC_COLORS.map(f => {
    const [fh,,] = hexToHsl(f.hex);
    const diff = Math.min(Math.abs(fh - h), 360 - Math.abs(fh - h));
    const isComp = diff > 150 && diff < 210;
    const isAna  = diff < 50;
    const isTri  = (diff > 100 && diff < 140) || (diff > 220 && diff < 260);
    const isNeu  = neutralScore(f.hex);

    let score = 0;
    if (isComp) score = 95;
    else if (isTri) score = 85;
    else if (isAna) score = 75;
    else if (isNeu) score = 70;
    else score = 40;

    return { ...f, score };
  })
  .sort((a: any, b: any) => b.score - a.score)
  .slice(0, 6);
}

const HARMONY_LABELS: Record<string, string> = {
  complementary: 'لون مكمل — متناقض وجميل',
  analogous:     'لون متناسق — قريب ومتناغم',
  triadic:       'ثلاثي متوازن',
  neutral:       'لون محايد — يناسب الكل',
};

export default function ColorMatchPage() {
  const [uploaded,  setUploaded]  = useState<string | null>(null);
  const [pickedHex, setPickedHex] = useState<string>('#F5A623');
  const [mode,      setMode]      = useState<'upload'|'picker'>('picker');
  const [matches,   setMatches]   = useState<typeof FABRIC_COLORS>([]);
  const [done,      setDone]      = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUploaded(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * canvas.width  / rect.width);
    const y = Math.round((e.clientY - rect.top)  * canvas.height / rect.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(x,y,1,1).data;
    const [r,g,b] = [data[0], data[1], data[2]];
    const hex = '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    setPickedHex(hex);
  }, []);

  const drawImage = useCallback(() => {
    if (!uploaded || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = imgRef.current;
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }, [uploaded]);

  const doMatch = () => {
    const results = findHarmonious(pickedHex);
    setMatches(results as any);
    setDone(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      <Navbar/>
      <main className="flex-1 page-container max-w-3xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
               style={{ background: 'rgba(245,166,35,0.12)' }}>🎨</div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--bs-primary)' }}>
            تطابق الألوان
          </p>
          <h1 className="font-black mb-2" style={{ fontSize:'clamp(1.8rem,4vw,2.5rem)', color:'var(--bs-navy)', fontFamily:'Georgia,serif' }}>
            مطابق الألوان الذكي
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            ارفعي صورة ملابسك أو اختاري لوناً — وسنجد لك الأقمشة التي تتناسق معه بشكل مثالي
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor:'var(--bs-border)' }}>
          {[
            { id:'picker', label:'🎨 اختاري لوناً مباشرة' },
            { id:'upload', label:'📷 ارفعي صورة' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as any)}
              className="flex-1 py-3 text-sm font-bold transition-all"
              style={{
                background: mode === m.id ? 'var(--bs-navy)' : 'white',
                color:      mode === m.id ? 'white' : 'var(--bs-silver)',
              }}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="card bg-white p-6 mb-6">
          {mode === 'picker' ? (
            <div>
              <h3 className="font-black text-base mb-4" style={{ color:'var(--bs-navy)' }}>
                اختاري لون ملابسك أو إكسسواراتك
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <input type="color" value={pickedHex} onChange={e => setPickedHex(e.target.value)}
                  className="w-20 h-20 rounded-2xl cursor-pointer border-0 shadow-lg"
                  style={{ padding: '4px' }}/>
                <div>
                  <p className="font-black text-2xl" style={{ color:'var(--bs-navy)' }}>{pickedHex}</p>
                  <p className="text-sm text-gray-400">انقري على الدائرة لاختيار اللون</p>
                </div>
              </div>
              {/* Color swatches */}
              <div className="flex gap-2 flex-wrap">
                {['#D41E2F','#F5A623','#1E2B45','#1B7B6B','#7B3F9E','#E91E8C','#800020','#D4AF37','#1E3A5F','#556B2F','#1A1A1A','#F5F0E8'].map(c => (
                  <button key={c} onClick={() => setPickedHex(c)}
                    className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                    style={{ background: c, borderColor: pickedHex === c ? 'var(--bs-navy)' : 'transparent' }}/>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-black text-base mb-4" style={{ color:'var(--bs-navy)' }}>
                ارفعي صورة ملابسك أو إكسسواراتك
              </h3>
              {!uploaded ? (
                <label className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-orange-400"
                       style={{ borderColor:'rgba(245,166,35,0.4)' }}>
                  <Upload className="w-10 h-10" style={{ color:'var(--bs-primary)' }}/>
                  <p className="font-bold text-sm" style={{ color:'var(--bs-navy)' }}>انقري لرفع صورة</p>
                  <p className="text-xs text-gray-400">JPG, PNG — ثم انقري على اللون المراد</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only"/>
                </label>
              ) : (
                <div className="relative">
                  <canvas ref={canvasRef} onClick={handleCanvasClick}
                    className="w-full rounded-xl cursor-crosshair"
                    style={{ maxHeight: 280, objectFit:'contain' }}/>
                  <img ref={imgRef} src={uploaded} alt="" onLoad={drawImage}
                    className="sr-only" aria-hidden/>
                  <button onClick={() => setUploaded(null)}
                    className="absolute top-2 left-2 bg-white rounded-full p-1.5 shadow">
                    <X className="w-4 h-4 text-red-500"/>
                  </button>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 border-white shadow-lg"
                         style={{ background: pickedHex }}/>
                    <p className="text-sm text-gray-500">
                      اللون المختار: <strong style={{ color:'var(--bs-navy)' }}>{pickedHex}</strong>
                      <span className="block text-xs text-gray-400">انقري على الصورة لاختيار لون مختلف</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button onClick={doMatch}
            className="btn-primary w-full mt-5 py-4 font-black text-base justify-center flex gap-2">
            <Palette className="w-5 h-5"/> ابحثي عن أقمشة متناسقة
          </button>
        </div>

        {/* Results */}
        {done && matches.length > 0 && (
          <div className="animate-float-up">
            <h2 className="font-black text-lg mb-4 flex items-center gap-2" style={{ color:'var(--bs-navy)' }}>
              <Palette className="w-5 h-5" style={{ color:'var(--bs-primary)' }}/>
              أقمشة تتناسق مع لونك
            </h2>

            {/* Color preview */}
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-white border"
                 style={{ borderColor:'var(--bs-border)' }}>
              <div className="w-14 h-14 rounded-xl shadow border-2 border-white"
                   style={{ background: pickedHex }}/>
              <div>
                <p className="text-xs text-gray-400">لونك المختار</p>
                <p className="font-black" style={{ color:'var(--bs-navy)' }}>{pickedHex}</p>
              </div>
              <div className="flex-1 flex gap-2 justify-end">
                {matches.slice(0,4).map(m => (
                  <div key={m.id} className="w-10 h-10 rounded-full border-2 border-white shadow"
                       style={{ background: m.hex }}/>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matches.map((m: any) => (
                <Link key={m.id} href={`/products/${m.id}`}
                  className="card bg-white p-4 flex items-center gap-4 hover:no-underline group">
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 shadow-sm transition-transform group-hover:scale-110"
                       style={{ background:`linear-gradient(135deg, ${m.hex}, ${m.hex}99)` }}/>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate" style={{ color:'var(--bs-navy)' }}>{m.name}</p>
                    <p className="text-xs text-gray-400">{m.cat}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-black text-base" style={{ color:'var(--bs-primary)' }}>
                        {m.price} <span className="text-xs font-normal text-gray-400">ر.س/م</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ background:'rgba(245,166,35,0.1)', color:'var(--bs-navy)' }}>
                        {m.score >= 90 ? 'مكمّل ✨' : m.score >= 80 ? 'متناسق 🎨' : m.score >= 70 ? 'متناغم' : 'محايد'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <button onClick={() => setDone(false)}
              className="w-full mt-4 py-3 text-sm font-bold transition-colors hover:opacity-70"
              style={{ color:'var(--bs-silver)' }}>
              ← جربي لوناً آخر
            </button>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}
