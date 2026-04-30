'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-white">
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-10">
            <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center mb-6">
              <ShieldCheck className="text-white h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Welcome back</h1>
            <p className="text-text-secondary">Enter your details to access your portal.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-error/10 border border-error/20 text-error rounded-md text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
                <input 
                  type="email" 
                  required
                  className="input-base pl-10"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-text-primary">Password</label>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-text-secondary" />
                <input 
                  type="password" 
                  required
                  className="input-base pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
              {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center text-sm text-text-secondary">
            Don't have an account? {' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Register now
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side: Branding/Visual */}
      <div className="hidden lg:flex flex-1 bg-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/5 z-10" />
        <div className="relative z-20 flex flex-col justify-between p-16 text-white h-full">
          <div>
            <span className="text-accent font-bold tracking-widest text-xs uppercase">Smart Attendance v2.0</span>
          </div>
          
          <div className="max-w-lg">
            <h2 className="text-5xl font-bold leading-tight mb-6">Secure, Seamless <br /> & Structured.</h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Experience the next generation of academic tracking. Built for enterprise speed with 
              minimalist design principles.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-bg-dark bg-slate-800" />
              ))}
            </div>
            <span>Trusted by 500+ Institutions</span>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle, #22D3EE 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </div>
  );
}
