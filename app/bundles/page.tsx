'use client';
import { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { ShoppingCart, Package, Tag, Check } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

const BUNDLES = [
  {
    id:'b1', name:'حزمة فستان الفرح',  emoji:'💍',
    desc:'كل ما تحتاجينه لفستان عروس فاخر',
    badge:'الأكثر طلباً',  badgeColor:'#E91E8C',
    items:[
      { name:'ساتان ملكي',      id:'2', meters:4, price:250 },
      { name:'دانتيل فرنسي',    id:'8', meters:2, price:320 },
      { name:'شيفون شفاف',      id:'3', meters:1, price:65  },
    ],
    discount:15, bg:'linear-gradient(135deg,#1E2B45,#2D4070)',
  },
  {
    id:'b2', name:'حزمة ملابس العيد',  emoji:'🌙',
    desc:'ثلاثة أقمشة متنسقة للعيد',
    badge:'عرض العيد',     badgeColor:'#F5A623',
    items:[
      { name:'جورجيت فاخر',     id:'1', meters:3, price:85  },
      { name:'قطن مصري فاخر',   id:'4', meters:2, price:45  },
      { name:'كريب مبتكر',      id:'5', meters:2, price:95  },
    ],
    discount:10, bg:'linear-gradient(135deg,#556B2F,#1B6B45)',
  },
  {
    id:'b3', name:'حزمة المكتب الأنيق', emoji:'💼',
    desc:'أقمشة مهنية تناسب بيئة العمل',
    badge:'للمرأة العاملة', badgeColor:'#1E2B45',
    items:[
      { name:'كريب مبتكر',      id:'5', meters:3, price:95  },
      { name:'جورجيت فاخر',     id:'1', meters:2, price:85  },
      { name:'قطن مصري',        id:'4', meters:2, price:45  },
    ],
    discount:12, bg:'linear-gradient(135deg,#2D4070,#1E2B45)',
  },
  {
    id:'b4', name:'حزمة صيف خفيف',    emoji:'☀️',
    desc:'أقمشة خفيفة ومريحة للصيف السعودي',
    badge:'للصيف الحار',   badgeColor:'#F5A623',
    items:[
      { name:'شيفون شفاف',      id:'3', meters:3, price:65  },
      { name:'قطن مصري فاخر',   id:'4', meters:3, price:45  },
      { name:'جورجيت فاخر',     id:'1', meters:2, price:85  },
    ],
    discount:8, bg:'linear-gradient(135deg,#F5A623,#D4880A)',
  },
  {
    id:'b5', name:'حزمة المناسبات الراقية', emoji:'✨',
    desc:'أرقى الأقمشة لأبهى المناسبات',
    badge:'فاخر ومميز',    badgeColor:'#7B3F9E',
    items:[
      { name:'حرير طبيعي',      id:'6', meters:3, price:450 },
      { name:'قطيفة ملكية',     id:'7', meters:2, price:180 },
      { name:'دانتيل فرنسي',    id:'8', meters:1, price:320 },
    ],
    discount:18, bg:'linear-gradient(135deg,#5C1A7A,#3A0060)',
  },
  {
    id:'b6', name:'حزمة الخياطة الأولى', emoji:'🧵',
    desc:'مثالية لمن يبدأ رحلة الخياطة',
    badge:'للمبتدئات',     badgeColor:'#1B7B6B',
    items:[
      { name:'قطن مصري',        id:'4', meters:3, price:45  },
      { name:'كريب مبتكر',      id:'5', meters:2, price:95  },
      { name:'شيفون شفاف',      id:'3', meters:2, price:65  },
    ],
    discount:10, bg:'linear-gradient(135deg,#1B7B6B,#0A4040)',
  },
];

export default function BundlesPage() {
  const [added, setAdded] = useState<string|null>(null);
  const addItem = useCartStore(s => s.addItem);

  const addBundle = (bundle: typeof BUNDLES[0]) => {
    bundle.items.forEach(item => {
      addItem({
        id: item.id, name: item.name, description: '', price: item.price,
        price_per_meter: item.price, category: '', colors: [], images: [],
        stock_quantity: 100, is_active: true,
      }, item.meters);
    });
    setAdded(bundle.id);
    setTimeout(() => setAdded(null), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      <Navbar/>

      {/* Hero */}
      <div className="relative overflow-hidden py-14 text-center" style={{ background:'var(--bs-grad-hero)' }}>
        <div className="relative max-w-2xl mx-auto px-4">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color:'var(--bs-primary)' }}>وفري الوقت والمال</p>
          <h1 className="font-black text-white mb-3" style={{ fontSize:'clamp(1.8rem,5vw,3rem)', fontFamily:'Georgia,serif' }}>
            حزم الأقمشة الجاهزة
          </h1>
          <p className="text-white/70 text-sm">أقمشة مختارة بعناية لكل مناسبة — بسعر أقل من الشراء المنفرد</p>
        </div>
      </div>

      <main className="flex-1 page-container">
        {/* Value props */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon:'💰', text:'خصم حتى 18%' },
            { icon:'⏱️', text:'توفر وقت الاختيار' },
            { icon:'✅', text:'أقمشة مجربة ومتناسقة' },
          ].map(v => (
            <div key={v.text} className="card bg-white p-3 text-center">
              <p className="text-2xl mb-1">{v.icon}</p>
              <p className="text-xs font-bold" style={{ color:'var(--bs-navy)' }}>{v.text}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BUNDLES.map(bundle => {
            const originalTotal = bundle.items.reduce((s,i) => s + i.price*i.meters, 0);
            const discounted    = Math.round(originalTotal * (1 - bundle.discount/100));
            const saved         = originalTotal - discounted;
            return (
              <div key={bundle.id} className="card bg-white overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-5 text-white" style={{ background: bundle.bg }}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{bundle.emoji}</span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full"
                          style={{ background: bundle.badgeColor, color:'white' }}>
                      {bundle.badge}
                    </span>
                  </div>
                  <h3 className="font-black text-lg leading-tight">{bundle.name}</h3>
                  <p className="text-white/70 text-xs mt-1">{bundle.desc}</p>
                </div>

                {/* Items */}
                <div className="p-4 flex-1">
                  <p className="text-xs font-bold mb-2.5" style={{ color:'var(--bs-silver)' }}>يتضمن:</p>
                  <div className="space-y-1.5 mb-4">
                    {bundle.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'var(--bs-primary)' }}/>
                          {item.name} ({item.meters}م)
                        </span>
                        <span className="text-gray-400">{item.price * item.meters} ر.س</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="border-t pt-3 mb-4" style={{ borderColor:'var(--bs-border)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">السعر الأصلي</span>
                      <span className="text-sm line-through text-gray-400">{originalTotal} ر.س</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-green-600">توفيري ({bundle.discount}%)</span>
                      <span className="text-sm font-bold text-green-600">-{saved} ر.س</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm" style={{ color:'var(--bs-navy)' }}>الإجمالي</span>
                      <span className="font-black text-xl" style={{ color:'var(--bs-primary)' }}>{discounted} ر.س</span>
                    </div>
                  </div>

                  <button onClick={() => addBundle(bundle)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all"
                    style={{ background: added === bundle.id ? '#16a34a' : 'var(--bs-grad)' }}>
                    {added === bundle.id
                      ? <><Check className="w-4 h-4" strokeWidth={3}/> تمت الإضافة!</>
                      : <><ShoppingCart className="w-4 h-4"/> أضف الحزمة للسلة</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer/>
    </div>
  );
}
