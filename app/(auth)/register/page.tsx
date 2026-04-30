'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="glass-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Create Account</h1>
          <p className="text-gray-500">Join the smart attendance revolution</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 rounded-xl border-2 font-bold transition-all ${role === 'student' ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-100 text-gray-400'}`}
              >
                Student
              </button>
              <button 
                type="button"
                onClick={() => setRole('lecturer')}
                className={`py-3 rounded-xl border-2 font-bold transition-all ${role === 'lecturer' ? 'border-brand-yellow bg-yellow-50 text-yellow-700' : 'border-gray-100 text-gray-400'}`}
              >
                Lecturer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-lg mt-4 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account? {' '}
            <Link href="/login" className="text-brand-blue font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
