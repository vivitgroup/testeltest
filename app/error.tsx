'use client';
import { useEffect } from 'react';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bs-pearl)' }}>
      <div className="text-center p-8">
        <p className="text-6xl mb-4">⚠️</p>
        <h2 className="font-black text-2xl mb-3" style={{ color: 'var(--bs-navy)' }}>حدث خطأ</h2>
        <p className="text-gray-500 mb-6">عذراً، حدث خطأ غير متوقع</p>
        <button onClick={reset} className="btn-primary">حاول مرة أخرى</button>
      </div>
    </div>
  );
}
