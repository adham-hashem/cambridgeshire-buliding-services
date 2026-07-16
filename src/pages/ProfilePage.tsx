import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, User, Shield } from 'lucide-react';

interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setFormData({ full_name: data.full_name || '' });
      } else {
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    try {
      await supabase
        .from('admin_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: formData.full_name,
        });

      loadProfile();
      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-2">
          Admin Profile
        </h1>
        <p className="text-[#6b7280]">Manage your admin account settings</p>
      </div>

      {/* Profile Card */}
      <div className="glass-dark card-base border border-charcoal-200 p-8 max-w-2xl animate-slide-up">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="input-premium opacity-50 cursor-not-allowed"
              />
              <p className="text-[#6b7280] text-sm mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input-premium"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-charcoal-200">
              <button
                type="submit"
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({ full_name: profile?.full_name || '' });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#b98545]/10 to-white/[0.02] rounded-xl border border-[#b98545]/20">
              <div className="p-4 bg-[#b98545]/20 rounded-xl">
                <User className="w-8 h-8 text-[#b98545]" />
              </div>
              <div>
                <p className="text-[#6b7280] text-sm mb-1">Full Name</p>
                <p className="text-[#1f2937] font-semibold text-lg">
                  {profile?.full_name || 'Not set'}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-white/[0.02] rounded-xl border border-blue-500/20">
              <p className="text-[#6b7280] text-sm mb-1">Email</p>
              <p className="text-[#1f2937] font-semibold text-lg">{profile?.email}</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-white/[0.02] rounded-xl border border-emerald-500/20">
              <p className="text-[#6b7280] text-sm mb-1">Role</p>
              <p className="text-[#1f2937] font-semibold text-lg">Administrator</p>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="btn-primary w-full"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="glass-dark card-base border border-charcoal-200 p-8 max-w-2xl animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-[#b98545]" />
          <h2 className="text-2xl font-bold text-[#1f2937]">Security</h2>
        </div>
        <p className="text-[#6b7280] mb-6">Your authentication is managed through Supabase.</p>
        <div className="p-4 bg-cream-50 border border-charcoal-200 rounded-lg">
          <p className="text-[#b98545] text-sm font-semibold mb-2">Password Management</p>
          <p className="text-[#6b7280] text-sm">
            Use the Supabase dashboard to manage your password and security settings securely.
          </p>
        </div>
      </div>
    </div>
  );
}
