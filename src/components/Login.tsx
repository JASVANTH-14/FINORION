import { useState, useEffect } from 'react';
import { LogIn, AlertTriangle } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    authService.initialize();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login({ username, password });
      onLoginSuccess();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please check your credentials.'
      );
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyberbg overflow-hidden relative flex items-center justify-center">
      <BinaryBackground />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="w-12 h-12 text-neongreen animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FINORION</h1>
          <p className="text-sm opacity-70">Advanced Sanction Screening Platform</p>
        </div>

        <div className="border-2 border-neongreen rounded-lg p-8 bg-cyberbg/80 backdrop-blur-sm shadow-2xl shadow-neongreen/20">
          <div className="mb-6 p-4 border border-neongreen/50 rounded-lg bg-neongreen/5">
            <div className="flex items-center gap-2 text-neongreen text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              AUTHORIZED ACCESS ONLY
            </div>
            <p className="text-xs opacity-70 mt-2">
              This system is for authorized personnel only. Unauthorized access is prohibited.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-cyberbg border-2 border-neongreen/50 rounded-lg focus:border-neongreen focus:outline-none focus:shadow-lg focus:shadow-neongreen/30 transition-all text-white placeholder-white/30 uppercase tracking-wide"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-cyberbg border-2 border-neongreen/50 rounded-lg focus:border-neongreen focus:outline-none focus:shadow-lg focus:shadow-neongreen/30 transition-all text-white placeholder-white/30"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-neongreen hover:bg-neongreen/90 disabled:bg-neongreen/50 text-cyberbg font-bold uppercase tracking-wider rounded-lg transition-all duration-200 shadow-lg shadow-neongreen/50 hover:shadow-xl hover:shadow-neongreen/70 disabled:shadow-neongreen/30 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neongreen/20">
            <p className="text-xs opacity-70 text-center">
              All access attempts are logged and monitored.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs opacity-50">
            FINORION Security System v1.0 | All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}

function BinaryBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute font-mono text-neongreen whitespace-nowrap animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 10}s infinite linear`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${10 + Math.random() * 10}px`,
            }}
          >
            {Math.random() > 0.5 ? '001001' : '010101'}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          from {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          25% {
            opacity: 0.5;
          }
          75% {
            opacity: 0.5;
          }
          to {
            transform: translateY(-100vh) translateX(50px);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
