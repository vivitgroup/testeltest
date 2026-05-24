import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bs-pearl)' }}>
      <div className="text-center p-8 max-w-md">
        <p className="text-8xl mb-6">🧵</p>
        <h1 className="font-black text-6xl mb-3" style={{ color: 'var(--bs-primary)' }}>404</h1>
        <h2 className="font-black text-2xl mb-3" style={{ color: 'var(--bs-navy)' }}>الصفحة غير موجودة</h2>
        <p className="text-gray-500 mb-8">عذراً، الصفحة التي تبحث عنها لا توجد أو تم نقلها</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">العودة للرئيسية</Link>
          <Link href="/products" className="btn-secondary">تصفح الأقمشة</Link>
        </div>
      </div>
    </div>
  );
}
