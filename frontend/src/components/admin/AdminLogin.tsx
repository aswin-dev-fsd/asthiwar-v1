import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { adminLogin } from '../../services/adminApi';

interface AdminLoginProps {
  onSuccess: (user: any) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState<string>('admin@asthiwar.com');
  const [password, setPassword] = useState<string>('ChangeMe@2026!');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await adminLogin({ email, password });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-lg shadow-amber-500/10">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-white mb-1">
          ASTHIWAR Admin Portal
        </h2>
        <p className="text-xs text-slate-400">
          Secure executive management & pricing matrix control center
        </p>
      </div>

      <div className="asthiwar-card p-6">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-400" /> Admin Email
            </label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@asthiwar.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-400" /> Password
            </label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3.5 text-sm mt-2 shadow-lg shadow-amber-500/25"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <span className="text-[11px] text-slate-500">
            Protected by bcrypt hashing & 7-day secure HttpOnly cookie sessions.
          </span>
        </div>
      </div>
    </div>
  );
};
