'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Eye, EyeOff, Upload, Video, Image as ImageIcon,
  Palette, Type, Link as LinkIcon, Save, X,
  Monitor, Smartphone, Check, Layers, Settings2,
  ChevronUp, ChevronDown, RefreshCw, Wifi
} from 'lucide-react';
import { useSiteStore, SectionContent, MediaType } from '@/stores/siteStore';

// ── Constants ──────────────────────────────────────────────────
const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  strip:    { label:'الشريط الإعلاني',     icon:'📢' },
  hero:     { label:'القسم الرئيسي',        icon:'🖼️' },
  banner1:  { label:'البانر الجانبي 1',     icon:'📌' },
  banner2:  { label:'البانر الجانبي 2',     icon:'📌' },
  features: { label:'قسم المميزات',          icon:'⚡' },
  cta:      { label:'قسم الدعوة (CTA)',      icon:'🎯' },
};

const GRADIENT_PRESETS = [
  { label:'كحلي',      val:'linear-gradient(135deg, #1E2B45 0%, #2D4070 100%)' },
  { label:'برتقالي',   val:'linear-gradient(135deg, #F5A623 0%, #D4880A 100%)' },
  { label:'أخضر',      val:'linear-gradient(135deg, #1B6B45 0%, #0A3A20 100%)' },
  { label:'أحمر',      val:'linear-gradient(135deg, #8B0000 0%, #C41E2A 100%)' },
  { label:'بنفسجي',    val:'linear-gradient(135deg, #5C1A7A 0%, #3A0060 100%)' },
  { label:'دافئ مختلط',val:'linear-gradient(135deg, #1E2B45 0%, #3D2800 50%, #D4880A 100%)' },
];

const FONT_OPTIONS = [
  'Georgia, serif',
  "Segoe UI, Arial, sans-serif",
  "'Times New Roman', serif",
  "Arial, sans-serif",
  "Verdana, sans-serif",
];

const MAX_IMAGE_SIZE = 800; // px — compress before storing

// ── Compress image to avoid memory issues ──────────────────────
function compressImage(file: File, maxPx = MAX_IMAGE_SIZE): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        // Scale down if too large
        if (width > maxPx || height > maxPx) {
          const ratio = Math.min(maxPx / width, maxPx / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75)); // 75% quality JPEG
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SiteEditorPage() {
  const {
    sections, settings,
    updateSection, toggleSection, reorderSection,
    updateSettings, lastUpdated,
  } = useSiteStore();

  const [active,   setActive]   = useState<string | null>(null);
  const [saved,    setSaved]    = useState(false);
  const [syncing,  setSyncing]  = useState(false);
  const [view,     setView]     = useState<'desktop'|'mobile'>('desktop');
  const [uploading,setUploading]= useState(false);
  const [imgError, setImgError] = useState('');

  const sorted  = [...sections].sort((a, b) => a.order - b.order);
  const editing = sections.find(s => s.id === active);

  // ── Auto-sync indicator ──────────────────────────────────────
  useEffect(() => {
    setSyncing(true);
    const t = setTimeout(() => setSyncing(false), 600);
    return () => clearTimeout(t);
  }, [lastUpdated]);

  // ── Handle image upload with compression ─────────────────────
  const handleImage = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !active) return;
    setImgError('');
    setUploading(true);
    try {
      const compressed = await compressImage(file, 900);
      updateSection(active, {
        media: { type: 'image', src: compressed, fileName: file.name },
      });
    } catch {
      setImgError('فشل رفع الصورة — جربي صورة أصغر حجماً');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [active, updateSection]);

  // ── Handle video upload (store as object URL in memory) ───────
  const handleVideo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !active) return;
    setImgError('');

    // Videos stay as object URLs (in-memory, not persisted)
    const url = URL.createObjectURL(file);
    updateSection(active, {
      media: { type: 'video', src: url, fileName: file.name },
    });
    e.target.value = '';
  }, [active, updateSection]);

  const clearMedia = useCallback(() => {
    if (!active) return;
    const sec = sections.find(s => s.id === active);
    if (sec?.media.src?.startsWith('blob:')) URL.revokeObjectURL(sec.media.src);
    updateSection(active, { media: { type: 'gradient', src: '' } });
  }, [active, sections, updateSection]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const moveUp   = (sec: SectionContent) => sec.order > 0 && reorderSection(sec.id, sec.order - 1);
  const moveDown = (sec: SectionContent) => reorderSection(sec.id, sec.order + 1);

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bs-pearl)' }}>

      {/* ══ LEFT SIDEBAR — Section List ══ */}
      <div style={{ width:280, flexShrink:0, background:'white', borderLeft:'1px solid var(--bs-border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'16px', borderBottom:'1px solid var(--bs-border)', position:'sticky', top:0, background:'white', zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
            <h2 style={{ fontWeight:900, fontSize:14, color:'var(--bs-navy)', margin:0 }}>
              محرر الموقع
            </h2>
            {/* Sync indicator */}
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Wifi style={{ width:12, height:12, color: syncing ? '#F5A623' : '#16a34a' }}/>
              <span style={{ fontSize:10, fontWeight:700, color: syncing ? '#F5A623' : '#16a34a' }}>
                {syncing ? 'يحدّث...' : 'مزامن'}
              </span>
            </div>
          </div>
          <p style={{ fontSize:10, color:'var(--bs-silver)', margin:0 }}>
            التعديلات تنعكس فوراً على جميع نوافذ الموقع
          </p>
        </div>

        {/* Section List */}
        <div style={{ flex:1, overflowY:'auto', padding:12 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {sorted.map(sec => {
              const info = SECTION_LABELS[sec.sectionKey];
              const isActive = active === sec.id;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActive(isActive ? null : sec.id)}
                  style={{
                    borderRadius:12, border:`2px solid ${isActive ? 'var(--bs-primary)' : 'var(--bs-border)'}`,
                    background: isActive ? 'rgba(245,166,35,0.05)' : 'white',
                    opacity: sec.active ? 1 : 0.5,
                    cursor:'pointer',
                    overflow:'hidden',
                    transition:'all 0.15s',
                  }}
                >
                  {/* Preview */}
                  <div style={{ height:44, overflow:'hidden', background: sec.bgGradient, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {sec.media.src && (
                      <img src={sec.media.src} alt=""
                        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
                    )}
                    <span style={{ fontSize:11, fontWeight:700, color:'white', textShadow:'0 1px 3px rgba(0,0,0,0.5)', position:'relative', zIndex:1, padding:'0 8px', textAlign:'center' }}>
                      {sec.heading?.split('\n')[0]?.slice(0,22) || '—'}
                    </span>
                  </div>

                  {/* Controls */}
                  <div style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 10px' }}>
                    <span style={{ fontSize:14 }}>{info?.icon || '📄'}</span>
                    <span style={{ fontSize:11, fontWeight:800, color:'var(--bs-navy)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {info?.label || sec.sectionKey}
                    </span>
                    <button onClick={e => { e.stopPropagation(); moveUp(sec); }}
                      style={{ padding:2, border:'none', background:'none', cursor:'pointer', opacity:0.5 }}>
                      <ChevronUp style={{ width:12, height:12 }}/>
                    </button>
                    <button onClick={e => { e.stopPropagation(); moveDown(sec); }}
                      style={{ padding:2, border:'none', background:'none', cursor:'pointer', opacity:0.5 }}>
                      <ChevronDown style={{ width:12, height:12 }}/>
                    </button>
                    <button onClick={e => { e.stopPropagation(); toggleSection(sec.id); }}
                      style={{ padding:4, border:'none', background:'none', cursor:'pointer' }}>
                      {sec.active
                        ? <Eye style={{ width:14, height:14, color:'#16a34a' }}/>
                        : <EyeOff style={{ width:14, height:14, color:'var(--bs-silver)' }}/>
                      }
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Site Settings */}
            <div
              onClick={() => setActive('__settings__')}
              style={{
                borderRadius:12, border:`2px solid ${active === '__settings__' ? 'var(--bs-primary)' : 'var(--bs-border)'}`,
                background: active === '__settings__' ? 'rgba(245,166,35,0.05)' : 'white',
                padding:'10px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:8,
              }}
            >
              <Settings2 style={{ width:16, height:16, color:'var(--bs-primary)' }}/>
              <span style={{ fontSize:12, fontWeight:800, color:'var(--bs-navy)' }}>⚙️ إعدادات الموقع</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — Editor Panel ══ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Toolbar */}
        <div style={{ background:'white', borderBottom:'1px solid var(--bs-border)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <h1 style={{ fontWeight:900, fontSize:16, color:'var(--bs-navy)', margin:0 }}>محرر الموقع الكامل</h1>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* View toggle */}
            <div style={{ display:'flex', borderRadius:8, overflow:'hidden', border:'1px solid var(--bs-border)' }}>
              {(['desktop','mobile'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding:'6px 12px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700,
                    background: view === v ? 'var(--bs-navy)' : 'white',
                    color:      view === v ? 'white' : 'var(--bs-silver)',
                  }}>
                  {v === 'desktop' ? <Monitor style={{ width:12, height:12 }}/> : <Smartphone style={{ width:12, height:12 }}/>}
                  {v === 'desktop' ? 'ديسكتوب' : 'موبايل'}
                </button>
              ))}
            </div>

            {saved && (
              <span style={{ fontSize:11, fontWeight:700, color:'#16a34a', display:'flex', alignItems:'center', gap:4 }}>
                <Check style={{ width:12, height:12 }}/> محفوظ!
              </span>
            )}

            <button onClick={handleSave}
              style={{ background:'var(--bs-grad)', color:'white', border:'none', borderRadius:10, padding:'8px 16px', fontWeight:800, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <Save style={{ width:14, height:14 }}/> حفظ
            </button>

            <a href="/" target="_blank"
              style={{ background:'white', color:'var(--bs-navy)', border:'1px solid var(--bs-border)', borderRadius:10, padding:'8px 12px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:4, textDecoration:'none' }}>
              <Eye style={{ width:12, height:12 }}/> عرض الموقع
            </a>
          </div>
        </div>

        {/* Editor Content */}
        <div style={{ flex:1, overflowY:'auto', padding:20 }}>

          {/* Empty state */}
          {!active && (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--bs-silver)' }}>
              <Layers style={{ width:40, height:40, margin:'0 auto 16px', opacity:0.3 }}/>
              <p style={{ fontWeight:800, fontSize:16, color:'var(--bs-navy)' }}>اختر قسماً للتعديل</p>
              <p style={{ fontSize:13, marginTop:6 }}>انقر على أي قسم من القائمة الجانبية</p>
            </div>
          )}

          {/* Settings Editor */}
          {active === '__settings__' && (
            <div style={{ maxWidth:620, margin:'0 auto' }}>
              <h2 style={{ fontWeight:900, fontSize:20, color:'var(--bs-navy)', marginBottom:20 }}>⚙️ إعدادات الموقع</h2>
              <div className="card" style={{ background:'white', padding:24 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>اسم المتجر</label>
                    <input className="input" value={settings.storeName}
                      onChange={e => updateSettings({ storeName: e.target.value })}/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>الشعار الفرعي</label>
                    <input className="input" value={settings.storeTagline}
                      onChange={e => updateSettings({ storeTagline: e.target.value })}/>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>اللون الأساسي</label>
                    <div style={{ display:'flex', gap:8 }}>
                      <input type="color" value={settings.primaryColor}
                        onChange={e => updateSettings({ primaryColor: e.target.value })}
                        style={{ width:44, height:40, borderRadius:8, border:'none', cursor:'pointer' }}/>
                      <input className="input" value={settings.primaryColor} style={{ flex:1 }}
                        onChange={e => updateSettings({ primaryColor: e.target.value })}/>
                    </div>
                    <div style={{ height:6, borderRadius:3, marginTop:6, background: settings.primaryColor }}/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>اللون الثانوي</label>
                    <div style={{ display:'flex', gap:8 }}>
                      <input type="color" value={settings.navyColor}
                        onChange={e => updateSettings({ navyColor: e.target.value })}
                        style={{ width:44, height:40, borderRadius:8, border:'none', cursor:'pointer' }}/>
                      <input className="input" value={settings.navyColor} style={{ flex:1 }}
                        onChange={e => updateSettings({ navyColor: e.target.value })}/>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>خط العناوين</label>
                  <select className="input" value={settings.fontHeading}
                    onChange={e => updateSettings({ fontHeading: e.target.value })}>
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f.split(',')[0]}</option>)}
                  </select>
                  <p style={{ fontFamily: settings.fontHeading, marginTop:6, fontSize:18, fontWeight:900, color:'var(--bs-navy)' }}>
                    مثال: BIN SIDDIQ FABRICS
                  </p>
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>رقم واتساب</label>
                  <input className="input" dir="ltr" placeholder="966500000000"
                    value={settings.whatsappNumber}
                    onChange={e => updateSettings({ whatsappNumber: e.target.value })}/>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {([
                    ['showChatWidget',  'عرض المساعد الذكي سدى'],
                    ['showWhatsApp',    'عرض زر واتساب'],
                    ['showNewsletter',  'عرض اشتراك النشرة البريدية'],
                  ] as [keyof typeof settings, string][]).map(([key, label]) => (
                    <label key={key} style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                      <div style={{ position:'relative', width:44, height:24 }}>
                        <input type="checkbox" checked={!!settings[key]}
                          onChange={e => updateSettings({ [key]: e.target.checked })}
                          style={{ position:'absolute', opacity:0, width:'100%', height:'100%', cursor:'pointer', zIndex:1 }}/>
                        <div style={{ width:44, height:24, borderRadius:12, background: settings[key] ? 'var(--bs-primary)' : '#d1d5db', transition:'background 0.2s' }}>
                          <div style={{ width:20, height:20, background:'white', borderRadius:'50%', margin:2, transition:'transform 0.2s',
                            transform: settings[key] ? 'translateX(20px)' : 'translateX(0)' }}/>
                        </div>
                      </div>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--bs-navy)' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section Editor */}
          {editing && active !== '__settings__' && (
            <div style={{ maxWidth:620, margin:'0 auto' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                <h2 style={{ fontWeight:900, fontSize:20, color:'var(--bs-navy)', margin:0 }}>
                  {SECTION_LABELS[editing.sectionKey]?.icon} {SECTION_LABELS[editing.sectionKey]?.label}
                </h2>
                <button onClick={() => setActive(null)} style={{ border:'none', background:'none', cursor:'pointer', padding:4 }}>
                  <X style={{ width:20, height:20, color:'var(--bs-silver)' }}/>
                </button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* ── MEDIA UPLOAD ── */}
                <div className="card" style={{ background:'white', padding:20 }}>
                  <h3 style={{ fontWeight:800, fontSize:13, color:'var(--bs-navy)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                    <ImageIcon style={{ width:16, height:16, color:'var(--bs-primary)' }}/>
                    الصورة أو الفيديو للقسم
                  </h3>

                  {/* Current media preview */}
                  {editing.media.src && (
                    <div style={{ position:'relative', marginBottom:12, borderRadius:12, overflow:'hidden', height:160 }}>
                      {editing.media.type === 'video'
                        ? <video src={editing.media.src} autoPlay muted loop playsInline
                            style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : <img src={editing.media.src} alt=""
                            style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      }
                      <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:6 }}>
                        <span style={{ background:'rgba(0,0,0,0.6)', color:'white', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20 }}>
                          {editing.media.type === 'video' ? '🎥' : '🖼️'} {editing.media.fileName || 'مرفوع'}
                        </span>
                        <button onClick={clearMedia}
                          style={{ background:'rgba(220,38,38,0.85)', border:'none', borderRadius:'50%', width:24, height:24, cursor:'pointer', color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <X style={{ width:12, height:12 }}/>
                        </button>
                      </div>
                    </div>
                  )}

                  {imgError && (
                    <div style={{ background:'#FEE2E2', color:'#991B1B', padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:600, marginBottom:12 }}>
                      ⚠️ {imgError}
                    </div>
                  )}

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {/* Image upload */}
                    <label style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:16, borderRadius:12, border:'2px dashed rgba(245,166,35,0.5)', cursor:'pointer', background:'rgba(245,166,35,0.03)', transition:'border-color 0.2s' }}>
                      {uploading
                        ? <RefreshCw style={{ width:24, height:24, color:'var(--bs-primary)', animation:'spin 1s linear infinite' }}/>
                        : <ImageIcon style={{ width:24, height:24, color:'var(--bs-primary)' }}/>
                      }
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--bs-navy)' }}>
                        {uploading ? 'جاري الرفع...' : 'رفع صورة'}
                      </span>
                      <span style={{ fontSize:10, color:'var(--bs-silver)' }}>JPG, PNG, WebP</span>
                      <span style={{ fontSize:10, color:'var(--bs-silver)' }}>تُضغط تلقائياً</span>
                      <input type="file" accept="image/*" onChange={handleImage} disabled={uploading} style={{ display:'none' }}/>
                    </label>

                    {/* Video upload */}
                    <label style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:16, borderRadius:12, border:'2px dashed rgba(30,43,69,0.3)', cursor:'pointer', background:'rgba(30,43,69,0.02)' }}>
                      <Video style={{ width:24, height:24, color:'var(--bs-navy)' }}/>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--bs-navy)' }}>رفع فيديو</span>
                      <span style={{ fontSize:10, color:'var(--bs-silver)' }}>MP4, WebM</span>
                      <span style={{ fontSize:10, color:'#F59E0B', fontWeight:600 }}>⚠️ مؤقت (للجلسة فقط)</span>
                      <input type="file" accept="video/*" onChange={handleVideo} style={{ display:'none' }}/>
                    </label>
                  </div>

                  <p style={{ fontSize:10, color:'var(--bs-silver)', marginTop:8, textAlign:'center' }}>
                    💡 الصور تُحفظ بشكل دائم — الفيديوهات تختفي عند إغلاق المتصفح
                  </p>
                </div>

                {/* ── TEXT CONTENT ── */}
                <div className="card" style={{ background:'white', padding:20 }}>
                  <h3 style={{ fontWeight:800, fontSize:13, color:'var(--bs-navy)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                    <Type style={{ width:16, height:16, color:'var(--bs-primary)' }}/>
                    النصوص
                  </h3>

                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>العنوان الرئيسي</label>
                      <textarea className="input" style={{ resize:'vertical', minHeight:64 }}
                        value={editing.heading}
                        onChange={e => updateSection(editing.id, { heading: e.target.value })}
                        placeholder="العنوان الرئيسي للقسم..."/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>العنوان الفرعي</label>
                      <textarea className="input" style={{ resize:'vertical', minHeight:48 }}
                        value={editing.subheading}
                        onChange={e => updateSection(editing.id, { subheading: e.target.value })}
                        placeholder="نص توضيحي..."/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>نص الزر (CTA)</label>
                        <input className="input" value={editing.ctaText}
                          onChange={e => updateSection(editing.id, { ctaText: e.target.value })} placeholder="تسوق الآن"/>
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>رابط الزر</label>
                        <input className="input" dir="ltr" value={editing.ctaLink}
                          onChange={e => updateSection(editing.id, { ctaLink: e.target.value })} placeholder="/products"/>
                      </div>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:6, color:'var(--bs-silver)' }}>الشارة (Badge)</label>
                      <input className="input" value={editing.badge}
                        onChange={e => updateSection(editing.id, { badge: e.target.value })} placeholder="🔥 جديد"/>
                    </div>
                  </div>
                </div>

                {/* ── DESIGN ── */}
                <div className="card" style={{ background:'white', padding:20 }}>
                  <h3 style={{ fontWeight:800, fontSize:13, color:'var(--bs-navy)', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                    <Palette style={{ width:16, height:16, color:'var(--bs-primary)' }}/>
                    التصميم
                  </h3>

                  {!editing.media.src && (
                    <div style={{ marginBottom:16 }}>
                      <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:8, color:'var(--bs-silver)' }}>لون الخلفية</label>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {GRADIENT_PRESETS.map(g => (
                          <button key={g.label} onClick={() => updateSection(editing.id, { bgGradient: g.val })}
                            title={g.label}
                            style={{
                              width:36, height:36, borderRadius:8, border:`2px solid ${editing.bgGradient === g.val ? 'var(--bs-navy)' : 'transparent'}`,
                              background: g.val, cursor:'pointer', transition:'transform 0.15s',
                              transform: editing.bgGradient === g.val ? 'scale(1.15)' : 'scale(1)',
                            }}/>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text color */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:8, color:'var(--bs-silver)' }}>لون النص</label>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <input type="color"
                        value={editing.textColor?.startsWith('var') ? '#ffffff' : editing.textColor}
                        onChange={e => updateSection(editing.id, { textColor: e.target.value })}
                        style={{ width:40, height:36, borderRadius:8, border:'none', cursor:'pointer' }}/>
                      {['#ffffff','#1E2B45','#F5A623','#0F1620'].map(c => (
                        <button key={c} onClick={() => updateSection(editing.id, { textColor: c })}
                          style={{ width:36, height:36, borderRadius:8, background:c, border:`2px solid ${editing.textColor===c?'var(--bs-primary)':'#e5e7eb'}`, cursor:'pointer' }}/>
                      ))}
                    </div>
                  </div>

                  {/* Text align */}
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, marginBottom:8, color:'var(--bs-silver)' }}>محاذاة النص</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {(['right','center','left'] as const).map(a => (
                        <button key={a} onClick={() => updateSection(editing.id, { textAlign: a })}
                          style={{
                            flex:1, padding:'8px 0', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer',
                            border:`2px solid ${editing.textAlign===a?'var(--bs-primary)':'var(--bs-border)'}`,
                            background: editing.textAlign===a ? 'rgba(245,166,35,0.08)' : 'white',
                            color:      editing.textAlign===a ? 'var(--bs-navy)' : 'var(--bs-silver)',
                          }}>
                          {a==='right'?'← يمين':a==='center'?'| وسط':'يسار →'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── VISIBILITY ── */}
                <div className="card" style={{ background:'white', padding:16 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
                    <div style={{ position:'relative', width:44, height:24 }}>
                      <input type="checkbox" checked={editing.active}
                        onChange={() => toggleSection(editing.id)}
                        style={{ position:'absolute', opacity:0, inset:0, cursor:'pointer', zIndex:1 }}/>
                      <div style={{ width:44, height:24, borderRadius:12, background: editing.active ? 'var(--bs-primary)' : '#d1d5db', transition:'background 0.2s' }}>
                        <div style={{ width:20, height:20, background:'white', borderRadius:'50%', margin:2, transition:'transform 0.2s',
                          transform: editing.active ? 'translateX(20px)' : 'translateX(0)' }}/>
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:800, color:'var(--bs-navy)', margin:0 }}>
                        {editing.active ? '✅ مرئي في الموقع' : '❌ مخفي'}
                      </p>
                      <p style={{ fontSize:11, color:'var(--bs-silver)', margin:0 }}>
                        يظهر على الديسكتوب والموبايل فوراً
                      </p>
                    </div>
                  </label>
                </div>

                <button onClick={handleSave}
                  style={{ background:'var(--bs-grad)', color:'white', border:'none', borderRadius:12, padding:'16px', fontWeight:900, fontSize:15, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Save style={{ width:18, height:18 }}/> حفظ التعديلات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
