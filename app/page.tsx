import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl w-full">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-brand-blue uppercase bg-blue-50 rounded-full border border-blue-100">
          Next-Gen Attendance Tracking
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter">
          Smart Attendance <br />
          <span className="text-brand-yellow">System</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate QR-based solution for modern classrooms. 
          Real-time tracking, secure verification, and automated reporting in one sleek platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register" className="btn-primary w-full sm:w-auto">
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link href="/login" className="btn-secondary w-full sm:w-auto">
            Lecturer Login
          </Link>
        </div>


        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card">
            <div className="h-12 w-12 bg-blue-100 text-brand-blue rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Dynamic QR</h3>
            <p className="text-gray-500 text-sm">Time-limited codes that prevent proxy attendance and unauthorized sharing.</p>
          </div>

          <div className="glass-card">
            <div className="h-12 w-12 bg-yellow-100 text-brand-yellow rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Real-time Stats</h3>
            <p className="text-gray-500 text-sm">Watch attendance grow live as students scan in. Instant feedback for lecturers.</p>
          </div>

          <div className="glass-card">
            <div className="h-12 w-12 bg-blue-100 text-brand-blue rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
            <p className="text-gray-500 text-sm">Built with JWT authentication and encrypted session tokens for maximum security.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
