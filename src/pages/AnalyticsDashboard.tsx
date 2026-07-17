import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Eye, MessageSquare, TrendingUp, ArrowUpRight, Calendar } from 'lucide-react';


interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

interface Activity {
  id: string;
  customer_name: string;
  email: string;
  service: string;
  status: string;
  created_at: string;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [projectsRes, consultationsRes, analyticsRes] = await Promise.all([
        supabase.from('projects').select('count', { count: 'exact' }),
        supabase.from('consultation_requests').select('count', { count: 'exact' }),
        supabase.from('analytics').select('*'),
      ]);

      const visitorCount = analyticsRes.data?.find(
        (a: any) => a.metric_type === 'visitors'
      )?.metric_value || 0;

      const conversionRate = analyticsRes.data?.find(
        (a: any) => a.metric_type === 'conversion'
      )?.metric_value || 0;

      setStats([
        {
          label: 'Total Visitors',
          value: visitorCount,
          icon: <Eye className="w-6 h-6" />,
          trend: 12,
          color: 'from-blue-500/20 to-blue-600/20',
        },
        {
          label: 'Consultation Requests',
          value: consultationsRes.count || 0,
          icon: <MessageSquare className="w-6 h-6" />,
          trend: 8,
          color: 'from-emerald-500/20 to-emerald-600/20',
        },
        {
          label: 'Published Projects',
          value: projectsRes.count || 0,
          icon: <BarChart3 className="w-6 h-6" />,
          color: 'from-amber-500/20 to-amber-600/20',
        },
        {
          label: 'Conversion Rate',
          value: conversionRate,
          icon: <TrendingUp className="w-6 h-6" />,
          trend: 5,
          color: 'from-[#b98545]/20 to-[#b98545]/10',
        },
      ]);

      const { data: recentConsultations } = await supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      setRecentActivity(recentConsultations || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'badge-info',
      contacted: 'badge-warning',
      in_progress: 'badge-warning',
      closed: 'badge-success',
    };
    return colors[status] || 'badge-primary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin-slow" />
          <p className="text-[#6b7280]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-2">
          Dashboard
        </h1>
        <p className="text-[#6b7280] flex items-center gap-2">
          <Calendar size={16} /> Welcome back to your admin portal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`stat-card animate-slide-up bg-gradient-to-br ${stat.color} backdrop-blur-xl border border-charcoal-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-cream-100 rounded-xl group-hover:bg-cream-200 transition-all duration-300">
                <div className="text-[#b98545] group-hover:scale-125 transition-transform duration-300">
                  {stat.icon}
                </div>
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                  <ArrowUpRight size={16} />
                  {stat.trend}%
                </div>
              )}
            </div>
            <p className="text-[#6b7280] text-sm mb-1 font-medium">{stat.label}</p>
            <p className="text-4xl font-bold text-[#1f2937]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="animate-slide-up glass-dark card-base p-8 border border-charcoal-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1f2937] mb-1">Recent Activity</h2>
          <p className="text-[#6b7280] text-sm">Latest consultation requests</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-200">
                <th className="text-left py-4 px-4 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-4 px-4 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-4 px-4 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Service
                </th>
                <th className="text-left py-4 px-4 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr
                  key={activity.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="table-row-hover animate-fade-in hover:bg-cream-100 transition-all duration-300"
                >
                  <td className="py-4 px-4 text-[#1f2937] font-medium">{activity.customer_name}</td>
                  <td className="py-4 px-4 text-[#6b7280] text-sm">{activity.email}</td>
                  <td className="py-4 px-4 text-[#1f2937] text-sm">{activity.service || '—'}</td>
                  <td className="py-4 px-4">
                    <span className={`badge ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#6b7280] text-sm">
                    {new Date(activity.created_at).toLocaleDateString()}
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
