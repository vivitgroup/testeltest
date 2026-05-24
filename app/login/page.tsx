'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';

export default function LoginPage() {
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    if (phone === 'admin' && password === 'admin123') {
      router.push('/dashboard');
    } else if (phone && password) {
      router.push('/');
    } else {
      setError('رقم الجوال أو كلمة المرور غير صحيحة');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
         style={{ background: 'linear-gradient(160deg, var(--bs-navy) 0%, #2D4070 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/95 p-2 shadow-2xl mx-auto mb-4"
               style={{ border: '2px solid rgba(245,166,35,0.4)' }}>
            <Image src="/logo.jpg" alt="Bin Siddiq Fabrics" width={80} height={80}
                   className="w-full h-full object-contain" priority/>
          </div>
          <h1 className="font-black text-white text-xl">تسجيل الدخول</h1>
          <p className="text-white/60 text-sm mt-1">أهلاً بك في بن صديق للأقمشة</p>
        </div>

        <form onSubmit={handleLogin} className="card bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--bs-navy)' }}>
              رقم الجوال أو البريد
            </label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="05XXXXXXXX" className="input pr-9" required/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--bs-navy)' }}>
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="input pr-9 pl-9" required/>
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 font-medium text-center p-2.5 rounded-xl bg-red-50">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 font-black text-base justify-center">
            {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>جاري الدخول...</> : 'تسجيل الدخول'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="font-bold hover:underline" style={{ color: 'var(--bs-primary)' }}>
              إنشاء حساب
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400">
            للأدمن: admin / admin123
          </p>
        </form>

        <Link href="/" className="block text-center mt-4 text-white/50 hover:text-white text-sm transition-colors">
          ← العودة للموقع
        </Link>
      </div>
    </div>
  );
}
