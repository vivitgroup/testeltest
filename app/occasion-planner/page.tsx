'use client';

import { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { Calendar, Sparkles, ChevronLeft, Clock, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

// ── Occasion data ──────────────────────────────────────────────
const OCCASIONS = [
  { id:'wedding',    label:'حفل زفاف',        emoji:'💍', sub:'عروس أو ضيفة' },
  { id:'engagement', label:'حفلة خطوبة',       emoji:'💌', sub:'رومانسي وأنيق' },
  { id:'eid',        label:'عيد الفطر/الأضحى', emoji:'🌙', sub:'احتفالي وفرحان' },
  { id:'graduation', label:'حفل تخرج',          emoji:'🎓', sub:'رسمي ومميز' },
  { id:'work',       label:'مقابلة/عمل',        emoji:'💼', sub:'محترف وهادئ' },
  { id:'travel',     label:'سفر أو رحلة',        emoji:'✈️', sub:'مريح وعملي' },
  { id:'condolence', label:'عزاء',               emoji:'🖤', sub:'محتشم وهادئ' },
  { id:'birthday',   label:'عيد ميلاد/تجمع',    emoji:'🎂', sub:'مرح وملون' },
  { id:'umrah',      label:'عمرة أو حج',         emoji:'🕌', sub:'محتشم ومريح' },
  { id:'daily',      label:'يومي وكاجوال',        emoji:'☀️', sub:'مريح وعملي' },
];

const ROLES: Record<string, { bride?: string; guest?: string; generic?: string }> = {
  wedding: { bride: 'عروس', guest: 'ضيفة' },
};

// ── AI Recommendations ─────────────────────────────────────────
const RECS: Record<string, {
  fabric: string; color: string[]; style: string;
  meters: number; tailorDays: number; notes: string;
  products: { name: string; id: string; price: number }[];
}> = {
  wedding_bride: {
    fabric: 'حرير طبيعي أو ساتان ملكي',
    color:  ['أبيض عاجي','شامبانيا','ذهبي فاتح'],
    style:  'فستان طويل مع ذيل — A-Line أو حورية البحر',
    meters: 6, tailorDays: 21,
    notes:  '⚠️ احجزي الخياطة قبل 3 أسابيع على الأقل. اختاري قماشاً تتنفسي فيه طوال اليوم الطويل.',
    products: [{ name:'قماش ساتان ملكي', id:'2', price:250 }, { name:'قماش حرير طبيعي', id:'6', price:450 }, { name:'قماش دانتيل فرنسي', id:'8', price:320 }],
  },
  wedding_guest: {
    fabric: 'جورجيت أو كريب',
    color:  ['خمري','كحلي ملكي','أخضر زمردي','ذهبي'],
    style:  'ميدي أو ماكسي — تجنبي الأبيض',
    meters: 4, tailorDays: 10,
    notes:  '✨ تجنبي الأبيض والكريمي — هذا للعروس فقط. الألوان الداكنة الغنية رائعة في الليل.',
    products: [{ name:'قماش جورجيت فاخر', id:'1', price:85 }, { name:'قماش كريب مبتكر', id:'5', price:95 }, { name:'قماش قطيفة ملكية', id:'7', price:180 }],
  },
  engagement: {
    fabric: 'ساتان أو شيفون فاخر',
    color:  ['وردي فوشيا','ليلكي','أزرق سماوي','ذهبي'],
    style:  'ضيق أنيق أو A-Line قصير',
    meters: 3, tailorDays: 7,
    notes:  '💄 اختاري لوناً يبرز بشرتك ويعطيك حضوراً. الذهبي والفضي مثاليان للخطوبة.',
    products: [{ name:'قماش شيفون شفاف', id:'3', price:65 }, { name:'قماش ساتان ملكي', id:'2', price:250 }],
  },
  eid: {
    fabric: 'قطن فاخر أو كريب خفيف',
    color:  ['أبيض ناصع','أخضر نعناعي','ذهبي دافئ','وردي باستيل'],
    style:  'فستان فضفاض مريح أو قفطان',
    meters: 4, tailorDays: 7,
    notes:  '🌟 العيد وقت الفرح — الأبيض والذهبي يرمزان للبهجة. القطن مريح للنهار الطويل.',
    products: [{ name:'قماش قطن مصري', id:'4', price:45 }, { name:'قماش كريب مبتكر', id:'5', price:95 }],
  },
  work: {
    fabric: 'كريب أو جورجيت كثيف',
    color:  ['كحلي','رمادي غامق','بيج','أسود','زيتوني'],
    style:  'بدلة أو فستان ميدي محافظ',
    meters: 3, tailorDays: 7,
    notes:  '💼 الكريب مثالي للعمل — لا يتجعد ويظهر احترافياً. تجنبي الأقمشة اللامعة.',
    products: [{ name:'قماش كريب مبتكر', id:'5', price:95 }, { name:'قماش جورجيت فاخر', id:'1', price:85 }],
  },
  travel: {
    fabric: 'قطن أو كريب خفيف',
    color:  ['بيج','كحلي','أبيض — تنسق مع بعض'],
    style:  'قطع متنسقة — تنورة + توب أو فستان بسيط',
    meters: 3, tailorDays: 5,
    notes:  '✈️ الكريب لا يتجعد في الحقيبة! اختاري ألوان محايدة تتنسق مع بعضها.',
    products: [{ name:'قماش قطن مصري', id:'4', price:45 }, { name:'قماش كريب مبتكر', id:'5', price:95 }],
  },
  condolence: {
    fabric: 'جورجيت أو كريب هادئ',
    color:  ['أسود','رمادي داكن','كحلي غامق'],
    style:  'فستان محتشم وبسيط',
    meters: 3, tailorDays: 3,
    notes:  '🖤 البساطة والاحتشام هما المعيار. تجنبي الألوان الفاقعة والأقمشة اللامعة.',
    products: [{ name:'قماش جورجيت فاخر', id:'1', price:85 }, { name:'قماش كريب مبتكر', id:'5', price:95 }],
  },
  graduation: {
    fabric: 'ساتان أو جورجيت فاخر',
    color:  ['ذهبي','كحلي ملكي','أسود أنيق'],
    style:  'فستان ميدي أو ماكسي رسمي',
    meters: 4, tailorDays: 10,
    notes:  '🎓 يوم مميز يستحق قماشاً مميزاً. الذهبي يرمز للنجاح والتفوق.',
    products: [{ name:'قماش ساتان ملكي', id:'2', price:250 }, { name:'قماش جورجيت فاخر', id:'1', price:85 }],
  },
  birthday: {
    fabric: 'شيفون ملون أو جورجيت',
    color:  ['فوشيا','تركواز','أصفر زاهي','أحمر'],
    style:  'فستان قصير أو ميدي مرح',
    meters: 3, tailorDays: 7,
    notes:  '🎂 احتفلي بلون جريء يعكس شخصيتك! الشيفون الخفيف مثالي للحفلات.',
    products: [{ name:'قماش شيفون شفاف', id:'3', price:65 }, { name:'قماش جورجيت فاخر', id:'1', price:85 }],
  },
  umrah: {
    fabric: 'قطن طبيعي أو شيفون محتشم',
    color:  ['أبيض','بيج','أخضر فاتح'],
    style:  'عباءة أو فستان فضفاض كامل',
    meters: 5, tailorDays: 7,
    notes:  '🕌 اختاري قطناً يتنفس في حرارة مكة. الأبيض رمز النقاء والروحانية.',
    products: [{ name:'قماش قطن مصري', id:'4', price:45 }, { name:'قماش شيفون شفاف', id:'3', price:65 }],
  },
  daily: {
    fabric: 'قطن أو كريب مريح',
    color:  ['كل الألوان الهادئة المريحة'],
    style:  'فستان مريح أو بيت',
    meters: 2.5, tailorDays: 5,
    notes:  '☀️ الراحة أهم شيء للاستخدام اليومي. القطن المصري الأفضل لمناخ السعودية.',
    products: [{ name:'قماش قطن مصري', id:'4', price:45 }, { name:'قماش كريب مبتكر', id:'5', price:95 }],
  },
};

export default function OccasionPlannerPage() {
  const [occasion,    setOccasion]    = useState('');
  const [role,        setRole]        = useState('');
  const [eventDate,   setEventDate]   = useState('');
  const [step,        setStep]        = useState(1);
  const [addedAll,    setAddedAll]    = useState(false);
  const addItem = useCartStore(s => s.addItem);

  const recKey = occasion + (role ? `_${role}` : '');
  const rec    = RECS[recKey] || RECS[occasion];
  const needsRole = !!ROLES[occasion];

  const daysLeft = eventDate
    ? Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / 86400000))
    : null;

  const isUrgent = daysLeft !== null && daysLeft < (rec?.tailorDays || 7);

  const handleAddAll = () => {
    if (!rec) return;
    rec.products.forEach(p => {
      addItem({
        id: p.id, name: p.name, description: '', price: p.price,
        price_per_meter: p.price, category: '', colors: [], images: [],
        stock_quantity: 100, is_active: true,
      }, rec.meters / rec.products.length);
    });
    setAddedAll(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      <Navbar/>
      <main className="flex-1 page-container max-w-3xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
               style={{ background: 'rgba(245,166,35,0.12)' }}>📅</div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--bs-primary)' }}>
            ميزة حصرية
          </p>
          <h1 className="font-black mb-2" style={{ fontSize:'clamp(1.8rem,5vw,2.8rem)', color:'var(--bs-navy)', fontFamily:'Georgia,serif' }}>
            مُخطِّط المناسبة
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            أخبرينا عن مناسبتك — وسنختار لك القماش والموديل والكمية بالكامل ✨
          </p>
        </div>

        {/* Step 1: Choose occasion */}
        {step >= 1 && (
          <div className="card bg-white p-6 mb-5 animate-float-up">
            <h2 className="font-black text-base mb-4 flex items-center gap-2" style={{ color:'var(--bs-navy)' }}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background:'var(--bs-grad)' }}>1</span>
              ما هي مناسبتك؟
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {OCCASIONS.map(o => (
                <button key={o.id} onClick={() => { setOccasion(o.id); setRole(''); setStep(2); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center"
                  style={{
                    borderColor: occasion === o.id ? 'var(--bs-primary)' : 'var(--bs-border)',
                    background:  occasion === o.id ? 'rgba(245,166,35,0.07)' : 'white',
                    transform:   occasion === o.id ? 'scale(1.04)' : 'scale(1)',
                  }}>
                  <span className="text-2xl">{o.emoji}</span>
                  <span className="text-xs font-black leading-tight" style={{ color:'var(--bs-navy)' }}>{o.label}</span>
                  <span className="text-[9px] text-gray-400">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Role (if needed) + Date */}
        {step >= 2 && occasion && (
          <div className="card bg-white p-6 mb-5 animate-float-up">
            <h2 className="font-black text-base mb-4 flex items-center gap-2" style={{ color:'var(--bs-navy)' }}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background:'var(--bs-grad)' }}>2</span>
              {needsRole ? 'ما دورك في المناسبة؟' : 'متى المناسبة؟'}
            </h2>

            {needsRole && (
              <div className="flex gap-3 mb-4">
                {Object.entries(ROLES[occasion] || {}).map(([key, label]) => (
                  <button key={key} onClick={() => { setRole(key); setStep(3); }}
                    className="flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all"
                    style={{
                      borderColor: role === key ? 'var(--bs-primary)' : 'var(--bs-border)',
                      background:  role === key ? 'rgba(245,166,35,0.07)' : 'white',
                      color:       'var(--bs-navy)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-2" style={{ color:'var(--bs-navy)' }}>
                <Calendar className="inline w-4 h-4 ml-1.5"/>
                تاريخ المناسبة (اختياري)
              </label>
              <input type="date" value={eventDate}
                onChange={e => { setEventDate(e.target.value); if (!needsRole || role) setStep(3); }}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
              {!needsRole && (
                <button onClick={() => setStep(3)} className="btn-primary mt-3 w-full justify-center py-3 font-black">
                  اعرضي التوصيات ✨
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Recommendations */}
        {step >= 3 && rec && (
          <div className="animate-float-up space-y-4">

            {/* Urgency warning */}
            {isUrgent && daysLeft !== null && (
              <div className="p-4 rounded-xl font-bold text-sm flex items-center gap-2"
                   style={{ background:'#FEF3C7', color:'#92400E', border:'1px solid #FCD34D' }}>
                ⚠️ تنبيه: المناسبة بعد {daysLeft} يوم فقط! الخياطة تحتاج {rec.tailorDays} يوم — احجزي الآن فوراً
              </div>
            )}

            {daysLeft !== null && !isUrgent && (
              <div className="p-4 rounded-xl font-bold text-sm flex items-center gap-2"
                   style={{ background:'#D1FAE5', color:'#065F46', border:'1px solid #6EE7B7' }}>
                ✅ ممتاز! عندك {daysLeft} يوم — وقت كافٍ للخياطة 👗
              </div>
            )}

            <div className="card bg-white p-6">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5" style={{ color:'var(--bs-primary)' }}/>
                <h3 className="font-black text-lg" style={{ color:'var(--bs-navy)' }}>توصية سدى لمناسبتك</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Fabric */}
                <div className="card-pearl rounded-xl p-4">
                  <p className="text-xs font-bold mb-1.5" style={{ color:'var(--bs-silver)' }}>القماش المناسب</p>
                  <p className="font-black" style={{ color:'var(--bs-navy)' }}>🧵 {rec.fabric}</p>
                </div>

                {/* Style */}
                <div className="card-pearl rounded-xl p-4">
                  <p className="text-xs font-bold mb-1.5" style={{ color:'var(--bs-silver)' }}>الموديل المقترح</p>
                  <p className="font-black text-sm" style={{ color:'var(--bs-navy)' }}>👗 {rec.style}</p>
                </div>

                {/* Meters */}
                <div className="card-pearl rounded-xl p-4">
                  <p className="text-xs font-bold mb-1.5" style={{ color:'var(--bs-silver)' }}>الكمية المطلوبة</p>
                  <p className="font-black text-2xl" style={{ color:'var(--bs-primary)' }}>
                    {rec.meters}م <span className="text-sm font-normal text-gray-400">قماش</span>
                  </p>
                </div>

                {/* Colors */}
                <div className="card-pearl rounded-xl p-4">
                  <p className="text-xs font-bold mb-2" style={{ color:'var(--bs-silver)' }}>الألوان المقترحة</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.color.map(c => (
                      <span key={c} className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background:'rgba(245,166,35,0.1)', color:'var(--bs-navy)' }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time to tailor */}
              <div className="flex items-center gap-2 p-3 rounded-xl mb-5"
                   style={{ background:'rgba(245,166,35,0.06)', border:'1px solid rgba(245,166,35,0.2)' }}>
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color:'var(--bs-primary)' }}/>
                <p className="text-sm font-bold" style={{ color:'var(--bs-navy)' }}>
                  وقت الخياطة: <span style={{ color:'var(--bs-primary)' }}>{rec.tailorDays} يوم</span>
                </p>
              </div>

              {/* Notes */}
              <div className="p-4 rounded-xl mb-5 text-sm leading-relaxed"
                   style={{ background:'var(--bs-pearl)', color:'#4A5568' }}>
                {rec.notes}
              </div>

              {/* Suggested products */}
              <h4 className="font-black text-sm mb-3" style={{ color:'var(--bs-navy)' }}>الأقمشة المقترحة:</h4>
              <div className="space-y-2.5 mb-5">
                {rec.products.map(p => (
                  <Link key={p.id} href={`/products/${p.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border hover:border-orange-300 transition-all"
                    style={{ borderColor:'var(--bs-border)' }}>
                    <span className="font-bold text-sm" style={{ color:'var(--bs-navy)' }}>🧵 {p.name}</span>
                    <span className="font-black" style={{ color:'var(--bs-primary)' }}>{p.price} ر.س/م</span>
                  </Link>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleAddAll} disabled={addedAll}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base text-white transition-all"
                  style={{ background: addedAll ? '#16a34a' : 'var(--bs-grad)' }}>
                  {addedAll ? '✓ تمت الإضافة!' : <><ShoppingCart className="w-5 h-5"/> أضف كل الأقمشة للسلة</>}
                </button>
                <Link href="/ai-measure" className="btn-secondary px-5">
                  📏 احسبي الكمية
                </Link>
              </div>
            </div>

            <button onClick={() => { setOccasion(''); setRole(''); setStep(1); setAddedAll(false); }}
              className="w-full py-3 text-sm font-bold transition-colors hover:opacity-70"
              style={{ color:'var(--bs-silver)' }}>
              ← اختاري مناسبة أخرى
            </button>
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}
