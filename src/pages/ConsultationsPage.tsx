import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, Search, Filter } from 'lucide-react';
import { PremiumModal } from '../components/PremiumModal';

interface Consultation {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  service: string;
  garden_style: string;
  budget_range: string;
  message: string;
  status: string;
  created_at: string;
}

export function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = ['new', 'contacted', 'in_progress', 'closed'];

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      const { data } = await supabase
        .from('consultation_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setConsultations(data || []);
    } catch (error) {
      console.error('Failed to load consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('consultation_requests').update({ status: newStatus }).eq('id', id);
      loadConsultations();
      if (selectedConsultation?.id === id) {
        setSelectedConsultation({ ...selectedConsultation, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-2">
          Consultation Requests
        </h1>
        <p className="text-[#6b7280]">Manage customer garden consultation bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-premium pl-12"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-[#9ca3af] w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-premium"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-dark card-base border border-charcoal-200 overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-200 bg-cream-50">
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Service
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredConsultations.map((consultation, index) => (
                <tr
                  key={consultation.id}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="table-row-hover animate-fade-in"
                >
                  <td className="py-4 px-6 text-[#1f2937] font-medium">{consultation.customer_name}</td>
                  <td className="py-4 px-6 text-[#6b7280]">{consultation.email}</td>
                  <td className="py-4 px-6 text-[#6b7280]">{consultation.service || '—'}</td>
                  <td className="py-4 px-6">
                    <span className={`badge ${getStatusColor(consultation.status)}`}>
                      {consultation.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#6b7280] text-sm">
                    {new Date(consultation.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => setSelectedConsultation(consultation)}
                      className="text-[#b98545] hover:text-[#d8a355] transition-colors flex items-center gap-2 hover:scale-110 transform duration-300"
                    >
                      <Eye size={18} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <PremiumModal
        isOpen={!!selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
        title="Consultation Details"
        size="md"
      >
        {selectedConsultation && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Customer Name</p>
                <p className="text-[#1f2937] font-semibold text-lg">{selectedConsultation.customer_name}</p>
              </div>
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Phone</p>
                <p className="text-[#1f2937] font-semibold text-lg">{selectedConsultation.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Email</p>
                <p className="text-[#1f2937] font-semibold">{selectedConsultation.email}</p>
              </div>
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Service</p>
                <p className="text-[#1f2937] font-semibold">{selectedConsultation.service || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Garden Style</p>
                <p className="text-[#1f2937] font-semibold">{selectedConsultation.garden_style || '—'}</p>
              </div>
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Budget Range</p>
                <p className="text-[#1f2937] font-semibold">{selectedConsultation.budget_range || '—'}</p>
              </div>
            </div>

            <div>
              <p className="text-[#6b7280] text-sm mb-2">Message</p>
              <p className="text-[#1f2937]">{selectedConsultation.message || 'No message'}</p>
            </div>

            <div className="border-t border-charcoal-200 pt-6">
              <p className="text-[#6b7280] text-sm mb-4 font-semibold">Update Status</p>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedConsultation.id, status)}
                    className={`px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
                      selectedConsultation.status === status
                        ? 'bg-[#b98545] text-white'
                        : 'bg-cream-100 text-[#1f2937] hover:bg-cream-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </PremiumModal>
    </div>
  );
}
