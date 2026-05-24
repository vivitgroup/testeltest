'use client';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { trackInitiateCheckout } from '@/components/pixels/PixelScripts';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const subtotal = total();
  const shipping = subtotal >= 200 ? 0 : 25;
  const grand    = subtotal + shipping;

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col bg-pearl">
      <Navbar/>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
               style={{ background: 'rgba(245,166,35,0.1)' }}>
            <ShoppingBag className="w-12 h-12" style={{ color: 'var(--bs-primary)' }}/>
          </div>
          <h1 className="font-black text-2xl mb-2" style={{ color: 'var(--bs-navy)' }}>سلتك فارغة</h1>
          <p className="text-gray-400 mb-6">أضيفي أقمشة من متجرنا لتبدأي التسوق</p>
          <Link href="/products" className="btn-primary inline-flex">
            تصفح الأقمشة <ChevronLeft className="w-4 h-4"/>
          </Link>
        </div>
      </main>
      <Footer/>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      <Navbar/>
      <main className="flex-1 page-container max-w-5xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="font-black text-2xl sm:text-3xl" style={{ color: 'var(--bs-navy)' }}>
            سلة التسوق
            <span className="text-base font-semibold text-gray-400 mr-2">({items.length} منتج)</span>
          </h1>
          <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
            مسح الكل
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.product.id} className="card bg-white p-4 sm:p-5 flex items-start gap-4">
                {/* Color swatch */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex-shrink-0 shadow-sm"
                     style={{ background: `linear-gradient(135deg, ${item.selected_color?.hex || '#F5A623'}, ${item.product.colors?.[0]?.hex || '#D4880A'})` }}/>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm sm:text-base truncate" style={{ color: 'var(--bs-navy)' }}>
                    {item.product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">{item.product.category}</p>
                  {item.selected_color && (
                    <p className="text-xs text-gray-400">
                      اللون: <span className="font-semibold">{item.selected_color.name}</span>
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    {/* Meter controls */}
                    <div className="flex items-center gap-2 border rounded-xl overflow-hidden"
                         style={{ borderColor: 'var(--bs-border)' }}>
                      <button onClick={() => updateQuantity(item.product.id, item.meters - 0.5)}
                        disabled={item.meters <= 0.5}
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 transition-colors">
                        <Minus className="w-3 h-3"/>
                      </button>
                      <span className="px-2 text-sm font-bold min-w-[40px] text-center" style={{ color: 'var(--bs-navy)' }}>
                        {item.meters}م
                      </span>
                      <button onClick={() => updateQuantity(item.product.id, item.meters + 0.5)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors">
                        <Plus className="w-3 h-3"/>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-base sm:text-lg" style={{ color: 'var(--bs-primary)' }}>
                        {(item.product.price_per_meter * item.meters).toFixed(0)} ر.س
                      </span>
                      <button onClick={() => removeItem(item.product.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card bg-white p-5 h-fit sticky top-24">
            <div className="flex items-center gap-2.5 mb-5">
              <Image src="/logo.jpg" alt="" width={32} height={32} className="rounded-lg object-contain"/>
              <h3 className="font-black text-base" style={{ color: 'var(--bs-navy)' }}>ملخص الطلب</h3>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-500">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(0)} ر.س</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>الشحن</span>
                <span className={shipping === 0 ? 'text-green-600 font-bold' : ''}>
                  {shipping === 0 ? 'مجاني 🎉' : `${shipping} ر.س`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">
                  أضيفي {(200 - subtotal).toFixed(0)} ر.س للحصول على شحن مجاني
                </p>
              )}
            </div>
            <div className="flex justify-between font-black text-lg border-t pt-4 mb-5"
                 style={{ borderColor: 'var(--bs-border)', color: 'var(--bs-navy)' }}>
              <span>الإجمالي</span>
              <span style={{ color: 'var(--bs-primary)' }}>{grand.toFixed(0)} ر.س</span>
            </div>
            <Link href="/checkout"
              onClick={() => trackInitiateCheckout(grand, items.length)}
              className="btn-primary w-full py-4 font-black text-base justify-center flex gap-2">
              إتمام الشراء <ArrowRight className="w-4 h-4"/>
            </Link>
            <Link href="/products" className="btn-secondary w-full py-3 mt-3 text-sm justify-center flex">
              مواصلة التسوق
            </Link>
            {/* Payment logos */}
            <div className="flex gap-1.5 justify-center mt-4 flex-wrap">
              {['مدى','Visa','MC','Apple Pay','STC'].map(p => (
                <span key={p} className="text-[9px] px-2 py-1 rounded border font-bold text-gray-400"
                      style={{ borderColor: 'var(--bs-border)' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
