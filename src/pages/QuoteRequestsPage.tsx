import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, Search, Filter, Download, Calendar, X, Phone, Mail, FileText, Image as ImageIcon, ChevronDown, Trash2 } from 'lucide-react';
import { PremiumModal } from '../components/PremiumModal';

interface QuoteRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  service_required: string | null;
  budget: string | null;
  custom_budget: string | null;
  message: string | null;
  attachment_paths: string[] | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ['new', 'contacted', 'quotation_sent', 'accepted', 'completed', 'cancelled'];

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  quotation_sent: 'Quotation Sent',
  accepted: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const ALL_SERVICES = [
  'Natural Turf Installation', 'Artificial Grass Installation', 'Patio Installation',
  'Tile Installation', 'Floor Tiling', 'Wall Tiling', 'Bathroom Renovations',
  'Kitchen Renovations', 'Kitchen Design & Installation', 'Interior House Painting',
  'Wallpaper Installation', 'Internal Door Installation', 'External Door Installation',
  'Door Frame Installation', 'uPVC Window Installation', 'Vinyl Flooring Installation',
  'Parquet Flooring Installation', 'Carpet Installation', 'Skirting Board Installation',
  'Wooden Fence Installation', 'Block Paving Installation', 'Driveway Installation',
  'Water Leak Repairs', 'Toilet Installation', 'Wash Basin Installation',
  'Bathtub Installation', 'Garage Conversion',
  'Property Maintenance & Repairs Before Sale or Letting',
];

export function QuoteRequestsPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [notesValue, setNotesValue] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => { loadQuotes(); }, []);

  const loadQuotes = async () => {
    try {
      const { data } = await supabase.from('quote_requests').select('*').order('created_at', { ascending: false });
      setQuotes(data as QuoteRequest[] || []);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('quote_requests').update({ status: newStatus }).eq('id', id);
      loadQuotes();
      if (selected?.id === id) setSelected({ ...selected, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const saveNotes = async (id: string) => {
    try {
      await supabase.from('quote_requests').update({ internal_notes: notesValue }).eq('id', id);
      loadQuotes();
      if (selected?.id === id) setSelected({ ...selected, internal_notes: notesValue });
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quote request?')) return;
    try {
      await supabase.from('quote_requests').delete().eq('id', id);
      loadQuotes();
      if (selected?.id === id) setSelected(null);
    } catch (error) {
      console.error('Failed to delete quote:', error);
    }
  };

  const openDetail = (q: QuoteRequest) => {
    setSelected(q);
    setNotesValue(q.internal_notes || '');
  };

  const getAttachmentUrl = (path: string) => {
    return supabase.storage.from('consultations').getPublicUrl(path).data.publicUrl;
  };

  const downloadFile = async (path: string, filename: string) => {
    const { data, error } = await supabase.storage.from('consultations').download(path);
    if (error) {
      const url = getAttachmentUrl(path);
      window.open(url, '_blank');
      return;
    }
    const blobUrl = URL.createObjectURL(data);
    const a = window.document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const isImage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'badge-info',
      contacted: 'badge-warning',
      quotation_sent: 'badge-warning',
      accepted: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return colors[status] || 'badge-primary';
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    const matchesService = serviceFilter === 'all' || q.service_required === serviceFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const created = new Date(q.created_at);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = created.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = created >= weekAgo;
      } else if (dateFilter === 'month') {
        matchesDate = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesService && matchesDate;
  });

  const statusCounts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = quotes.filter((q) => q.status === s).length;
    return acc;
  }, {});

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
          Quote Requests
        </h1>
        <p className="text-[#6b7280]">Manage customer quotation requests</p>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 animate-slide-up">
        {STATUS_OPTIONS.map((status) => (
          <div key={status} className="glass-dark card-base border border-charcoal-200 p-4 text-center cursor-pointer hover:border-[#b98545]/30 transition-all"
            onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
            <p className={`text-2xl font-bold ${statusFilter === status ? 'text-[#b98545]' : 'text-[#1f2937]'}`}>{statusCounts[status]}</p>
            <p className="text-[#6b7280] text-[10px] uppercase tracking-wider mt-1">{STATUS_LABELS[status]}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] w-5 h-5" />
          <input type="text" placeholder="Search by name, phone, or email..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="input-premium pl-12" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-[#9ca3af] w-5 h-5 flex-shrink-0" />
          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="select-premium min-w-[160px]">
            <option value="all">All Services</option>
            {ALL_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-premium">
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="select-premium">
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-dark card-base border border-charcoal-200 overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-200 bg-cream-50">
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">Name</th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">Service</th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">Budget</th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">Date</th>
                <th className="text-left py-4 px-6 text-[#6b7280] font-semibold text-sm uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#6b7280]">No quote requests found.</td>
                </tr>
              ) : filteredQuotes.map((q, index) => (
                <tr key={q.id} style={{ animationDelay: `${index * 30}ms` }}
                  className="table-row-hover animate-fade-in border-b border-charcoal-200">
                  <td className="py-4 px-6">
                    <p className="text-[#1f2937] font-medium">{q.full_name}</p>
                    <p className="text-[#6b7280] text-xs">{q.phone}</p>
                  </td>
                  <td className="py-4 px-6 text-[#6b7280] text-sm max-w-[200px] truncate">{q.service_required || '—'}</td>
                  <td className="py-4 px-6 text-[#6b7280] text-sm">
                    {q.budget === 'Custom Budget' && q.custom_budget ? q.custom_budget : q.budget || '—'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`badge ${getStatusColor(q.status)}`}>
                      {STATUS_LABELS[q.status] || q.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#6b7280] text-sm">
                    {new Date(q.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-4 items-center">
                      <button onClick={() => openDetail(q)}
                        className="text-[#b98545] hover:text-[#d8a355] transition-colors flex items-center gap-1 hover:scale-110 transform duration-300">
                        <Eye size={18} /> View
                      </button>
                      <button onClick={() => deleteQuote(q.id)}
                        className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 hover:scale-110 transform duration-300">
                        <Trash2 size={18} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <PremiumModal isOpen={!!selected} onClose={() => setSelected(null)} title="Quote Request Details" size="lg">
        {selected && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Full Name</p>
                <p className="text-[#1f2937] font-semibold text-lg">{selected.full_name}</p>
              </div>
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Phone</p>
                <a href={`tel:${selected.phone}`} className="text-[#1f2937] font-semibold text-lg flex items-center gap-2 hover:text-[#b98545] transition-colors">
                  <Phone size={16} /> {selected.phone}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Email</p>
                {selected.email ? (
                  <a href={`mailto:${selected.email}`} className="text-[#1f2937] font-semibold flex items-center gap-2 hover:text-[#b98545] transition-colors">
                    <Mail size={16} /> {selected.email}
                  </a>
                ) : <p className="text-[#6b7280]">Not provided</p>}
              </div>
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Service Required</p>
                <p className="text-[#1f2937] font-semibold">{selected.service_required || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Budget</p>
                <p className="text-[#1f2937] font-semibold">
                  {selected.budget === 'Custom Budget' && selected.custom_budget ? selected.custom_budget : selected.budget || '—'}
                </p>
              </div>
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Date Submitted</p>
                <p className="text-[#1f2937] font-semibold flex items-center gap-2">
                  <Calendar size={16} /> {new Date(selected.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Message */}
            {selected.message && (
              <div>
                <p className="text-[#6b7280] text-sm mb-2">Project Description</p>
                <p className="text-[#1f2937] leading-relaxed bg-cream-50 rounded-lg p-4 border border-charcoal-200">{selected.message}</p>
              </div>
            )}

            {/* Uploaded Images */}
            {selected.attachment_paths && selected.attachment_paths.length > 0 && (
              <div>
                <p className="text-[#6b7280] text-sm mb-3">Uploaded Files ({selected.attachment_paths.length})</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {selected.attachment_paths.map((path, i) => {
                    const url = getAttachmentUrl(path);
                    const img = isImage(path);
                    const filename = path.split('/').pop() || `file-${i}`;
                    return (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-charcoal-200 bg-cream-50">
                        {img ? (
                          <img src={url} alt={filename} className="w-full h-24 object-cover cursor-pointer" onClick={() => setPreviewImage(url)} />
                        ) : (
                          <div className="w-full h-24 flex flex-col items-center justify-center text-[#6b7280] gap-1">
                            <FileText size={24} />
                            <span className="text-xs uppercase">{filename.split('.').pop()}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {img && (
                            <button onClick={() => setPreviewImage(url)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all" title="Preview">
                              <Eye size={16} className="text-white" />
                            </button>
                          )}
                          <button onClick={() => downloadFile(path, filename)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all" title="Download">
                            <Download size={16} className="text-white" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status Update */}
            <div className="border-t border-charcoal-200 pt-6">
              <p className="text-[#6b7280] text-sm mb-4 font-semibold">Update Status</p>
              <div className="grid grid-cols-3 gap-3">
                {STATUS_OPTIONS.map((status) => (
                  <button key={status} onClick={() => updateStatus(selected.id, status)}
                    className={`px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
                      selected.status === status ? 'bg-[#b98545] text-white' : 'bg-cream-100 text-[#1f2937] hover:bg-cream-200'
                    }`}>
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="border-t border-charcoal-200 pt-6">
              <p className="text-[#6b7280] text-sm mb-3 font-semibold">Internal Notes</p>
              <textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)}
                className="input-premium h-24 resize-y" placeholder="Add internal notes about this request..." />
              <button onClick={() => saveNotes(selected.id)}
                className="mt-3 px-4 py-2 bg-[#b98545] hover:bg-[#d8a355] text-white font-medium rounded-lg transition-all text-sm">
                Save Notes
              </button>
            </div>
          </div>
        )}
      </PremiumModal>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreviewImage(null)}>
          <div className="absolute inset-0 bg-black/90" />
          <div className="relative max-w-3xl max-h-[90vh]">
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-10">
              <X size={18} className="text-white" />
            </button>
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
