import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Trash2, Mail, Search, TrendingUp } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: string;
  subscribed_at: string;
}

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const { data } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
      setSubscribers(data || []);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this subscriber?')) {
      try {
        await supabase.from('newsletter_subscribers').delete().eq('id', id);
        loadSubscribers();
      } catch (error) {
        console.error('Failed to delete subscriber:', error);
      }
    }
  };

  const exportEmails = () => {
    const emails = subscribers.map((s) => s.email).join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(emails));
    element.setAttribute('download', 'subscriber_emails.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const thisMonthCount = subscribers.filter((s) => {
    const date = new Date(s.subscribed_at);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    );
  }).length;

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-2">
            Newsletter Subscribers
          </h1>
          <p className="text-[#6b7280]">Manage and export your email subscribers</p>
        </div>
        <button
          onClick={exportEmails}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Download size={20} />
          Export Emails
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="stat-card bg-gradient-to-br from-blue-500/10 to-blue-600/10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-cream-100 rounded-xl">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-[#6b7280] text-sm mb-1">Total Subscribers</p>
          <p className="text-4xl font-bold text-[#1f2937]">{subscribers.length}</p>
        </div>

        <div className="stat-card bg-gradient-to-br from-emerald-500/10 to-emerald-600/10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-cream-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-[#6b7280] text-sm mb-1">Active Subscribers</p>
          <p className="text-4xl font-bold text-[#1f2937]">
            {subscribers.filter((s) => s.status === 'subscribed').length}
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-amber-500/10 to-amber-600/10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-cream-100 rounded-xl">
              <Mail className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <p className="text-[#6b7280] text-sm mb-1">This Month</p>
          <p className="text-4xl font-bold text-[#1f2937]">{thisMonthCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-slide-up">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] w-5 h-5" />
        <input
          type="text"
          placeholder="Search subscribers by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-premium pl-12"
        />
      </div>

      {/* Table */}
      <div className="glass-dark card-base border border-charcoal-200 overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-200 bg-cream-50">
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((subscriber, index) => (
                <tr
                  key={subscriber.id}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="table-row-hover animate-fade-in"
                >
                  <td className="py-4 px-6 text-[#1f2937] flex items-center gap-2">
                    <Mail size={16} className="text-[#b98545]" />
                    {subscriber.email}
                  </td>
                  <td className="py-4 px-6 text-[#6b7280]">{subscriber.name || '—'}</td>
                  <td className="py-4 px-6">
                    <span className="badge badge-success">{subscriber.status}</span>
                  </td>
                  <td className="py-4 px-6 text-[#6b7280] text-sm">
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className="text-red-500 hover:text-red-600 transition-colors hover:scale-110 transform duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
