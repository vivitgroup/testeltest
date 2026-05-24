'use client';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, AlertCircle } from 'lucide-react';
import { ORDER_STATUS_MAP } from '@/lib/utils';

const MOCK_ORDERS = [
  { id:'ORD-1021', status:'delivered',  total:680,  date:'2024-07-12', items:['جورجيت أحمر 3م','ساتان ذهبي 2م'] },
  { id:'ORD-1020', status:'shipped',    total:250,  date:'2024-07-10', items:['قماش شيفون كحلي 4م'] },
  { id:'ORD-1019', status:'processing', total:950,  date:'2024-07-08', items:['حرير طبيعي 2م'] },
  { id:'ORD-1018', status:'pending',    total:130,  date:'2024-07-06', items:['قطن مصري 2م'] },
];

const STATUS_ICONS: Record<string, any> = {
  delivered:  CheckCircle,
  shipped:    Truck,
  processing: Clock,
  pending:    AlertCircle,
  cancelled:  XCircle,
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      <Navbar/>
      <main className="flex-1 page-container max-w-3xl">
        <h1 className="font-black text-2xl sm:text-3xl mb-8" style={{ color: 'var(--bs-navy)' }}>طلباتي</h1>

        {MOCK_ORDERS.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: 'var(--bs-navy)' }}/>
            <p className="font-black text-xl mb-2" style={{ color: 'var(--bs-navy)' }}>لا توجد طلبات بعد</p>
            <p className="text-gray-400 mb-6">ابدئي التسوق واكتشفي تشكيلة أقمشتنا</p>
            <Link href="/products" className="btn-primary inline-flex">تصفح الأقمشة</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_ORDERS.map(order => {
              const st   = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#999', bg: '#f5f5f5' };
              const Icon = STATUS_ICONS[order.status] || Package;
              return (
                <div key={order.id} className="card bg-white p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                    <div>
                      <p className="font-black text-base" style={{ color: 'var(--bs-navy)' }}>{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.date).toLocaleDateString('ar-SA', { year:'numeric', month:'long', day:'numeric' })}
                      </p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ background: st.color + '18', color: st.color }}>
                      <Icon className="w-3.5 h-3.5"/>
                      {st.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-3 space-y-0.5">
                    {order.items.map((item, i) => <p key={i}>• {item}</p>)}
                  </div>
                  <div className="flex items-center justify-between border-t pt-3"
                       style={{ borderColor: 'var(--bs-border)' }}>
                    <span className="font-black text-lg" style={{ color: 'var(--bs-primary)' }}>
                      {order.total} ر.س
                    </span>
                    <button className="flex items-center gap-1 text-sm font-bold hover:opacity-70 transition-opacity"
                            style={{ color: 'var(--bs-navy)' }}>
                      التفاصيل <ChevronRight className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}
