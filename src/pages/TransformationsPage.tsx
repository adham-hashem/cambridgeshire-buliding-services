import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Upload, X, ArrowUp, ArrowDown, Image as ImageIcon, Video } from 'lucide-react';
import { PremiumModal } from '../components/PremiumModal';

interface Transformation {
  id: string;
  title: string;
  description: string;
  service_type: string;
  before_image_path: string | null;
  after_image_path: string | null;
  before_video_path: string | null;
  after_video_path: string | null;
  featured: boolean;
  display_order: number;
  published: boolean;
  created_at: string;
}

const serviceTypes = [
  'Landscaping & Garden Design',
  'Garden Clearance',
  'Fencing',
  'Turfing',
  'Patios',
  'Groundworks',
  'Tree Surgery',
  'Grass Cutting',
];

function getFileUrl(path: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from('transformations').getPublicUrl(path);
  return data.publicUrl;
}

export function TransformationsPage() {
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<Transformation | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_type: '',
    before_image_path: '',
    after_image_path: '',
    before_video_path: '',
    after_video_path: '',
    featured: false,
    published: false,
  });

  useEffect(() => { loadTransformations(); }, []);

  const loadTransformations = async () => {
    try {
      const { data } = await supabase.from('transformations').select('*').order('display_order');
      setTransformations(data || []);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', service_type: '',
      before_image_path: '', after_image_path: '',
      before_video_path: '', after_video_path: '',
      featured: false, published: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('transformations').upload(filename, file, { cacheControl: '3600', upsert: true });
    if (error) { console.error('Upload error:', error); return null; }
    return filename;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(field);
    const folder = field.includes('video') ? 'videos' : 'images';
    const path = await uploadFile(file, folder);
    if (path) setFormData((p) => ({ ...p, [field]: path }));
    setUploadingField(null);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();
    try {
      if (editingId) {
        await supabase.from('transformations').update(formData).eq('id', editingId);
      } else {
        const maxOrder = transformations.length > 0 ? Math.max(...transformations.map((t) => t.display_order)) + 1 : 0;
        await supabase.from('transformations').insert({ ...formData, created_by: user.user?.id, display_order: maxOrder });
      }
      loadTransformations();
      resetForm();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleEdit = (t: Transformation) => {
    setFormData({
      title: t.title, description: t.description || '', service_type: t.service_type || '',
      before_image_path: t.before_image_path || '', after_image_path: t.after_image_path || '',
      before_video_path: t.before_video_path || '', after_video_path: t.after_video_path || '',
      featured: t.featured, published: t.published,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transformation?')) return;
    try { await supabase.from('transformations').delete().eq('id', id); loadTransformations(); } catch (error) { console.error('Delete failed:', error); }
  };

  const togglePublished = async (t: Transformation) => {
    try { await supabase.from('transformations').update({ published: !t.published }).eq('id', t.id); loadTransformations(); } catch (error) { console.error('Toggle failed:', error); }
  };

  const toggleFeatured = async (t: Transformation) => {
    try { await supabase.from('transformations').update({ featured: !t.featured }).eq('id', t.id); loadTransformations(); } catch (error) { console.error('Toggle failed:', error); }
  };

  const moveOrder = async (t: Transformation, direction: 'up' | 'down') => {
    const sorted = [...transformations].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((s) => s.id === t.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;
    const swapWith = sorted[direction === 'up' ? idx - 1 : idx + 1];
    try {
      await Promise.all([
        supabase.from('transformations').update({ display_order: swapWith.display_order }).eq('id', t.id),
        supabase.from('transformations').update({ display_order: t.display_order }).eq('id', swapWith.id),
      ]);
      loadTransformations();
    } catch (error) { console.error('Reorder failed:', error); }
  };

  const openPreview = (t: Transformation) => { setPreviewItem(t); setShowPreview(true); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2937]">Before & After Transformations</h1>
          <p className="text-[#6b7280] text-sm mt-1">Manage garden transformation showcases</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={18} /> Add Transformation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-dark card-base border border-charcoal-200 p-4">
          <p className="text-[#6b7280] text-xs font-semibold uppercase">Total</p>
          <p className="text-2xl font-bold text-[#1f2937]">{transformations.length}</p>
        </div>
        <div className="glass-dark card-base border border-charcoal-200 p-4">
          <p className="text-[#6b7280] text-xs font-semibold uppercase">Published</p>
          <p className="text-2xl font-bold text-emerald-600">{transformations.filter((t) => t.published).length}</p>
        </div>
        <div className="glass-dark card-base border border-charcoal-200 p-4">
          <p className="text-[#6b7280] text-xs font-semibold uppercase">Featured</p>
          <p className="text-2xl font-bold text-amber-600">{transformations.filter((t) => t.featured).length}</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {transformations.map((t) => {
          const beforeUrl = getFileUrl(t.before_image_path);
          const afterUrl = getFileUrl(t.after_image_path);
          return (
            <div key={t.id} className="glass-dark card-base border border-charcoal-200 p-4 flex items-center gap-4 group">
              {/* Thumbnails */}
              <div className="flex gap-2 flex-shrink-0">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-charcoal-800 border border-charcoal-200">
                  {beforeUrl ? <img src={beforeUrl} alt="Before" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-charcoal-500" /></div>}
                </div>
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-charcoal-800 border border-charcoal-200">
                  {afterUrl ? <img src={afterUrl} alt="After" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-charcoal-500" /></div>}
                </div>
              </div>

              {/* Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[#1f2937] font-semibold text-sm truncate">{t.title}</h3>
                  {t.featured && <Star size={14} className="text-amber-600 fill-amber-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {t.service_type && <span className="badge-primary text-[10px]">{t.service_type}</span>}
                  <span className={`badge text-[10px] ${t.published ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-charcoal-500/20 text-charcoal-400 border border-charcoal-500/30'}`}>
                    {t.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => moveOrder(t, 'up')} className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors" title="Move up">
                  <ArrowUp size={14} className="text-[#6b7280]" />
                </button>
                <button onClick={() => moveOrder(t, 'down')} className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors" title="Move down">
                  <ArrowDown size={14} className="text-[#6b7280]" />
                </button>
                <button onClick={() => toggleFeatured(t)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors" title="Toggle featured">
                  <Star size={14} className={t.featured ? 'text-amber-600 fill-amber-500' : 'text-[#6b7280]'} />
                </button>
                <button onClick={() => togglePublished(t)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors" title="Toggle published">
                  {t.published ? <EyeOff size={14} className="text-emerald-600" /> : <Eye size={14} className="text-[#6b7280]" />}
                </button>
                <button onClick={() => openPreview(t)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors" title="Preview">
                  <Eye size={14} className="text-[#6b7280]" />
                </button>
                <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors" title="Edit">
                  <Edit2 size={14} className="text-[#6b7280]" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          );
        })}

        {transformations.length === 0 && (
          <div className="text-center py-16 glass-dark card-base border border-charcoal-200">
            <ImageIcon className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
            <p className="text-[#6b7280]">No transformations yet. Add your first before & after showcase.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <PremiumModal isOpen={showForm} onClose={resetForm} title={editingId ? 'Edit Transformation' : 'Add Transformation'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2 text-sm">Project Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="input-premium" required />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2 text-sm">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} className="textarea-premium h-20" />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2 text-sm">Service Category</label>
            <select value={formData.service_type} onChange={(e) => setFormData((p) => ({ ...p, service_type: e.target.value }))} className="select-premium">
              <option value="">Select service</option>
              {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Before Image */}
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2 text-sm">Before Image</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'before_image_path')} className="hidden" id="before-img" />
                <label htmlFor="before-img" className="flex items-center gap-2 px-4 py-3 bg-cream-100 border border-charcoal-200 rounded-xl cursor-pointer hover:bg-cream-100 transition-all text-sm text-[#1f2937]">
                  <Upload size={16} /> {uploadingField === 'before_image_path' ? 'Uploading...' : 'Upload Before Image'}
                </label>
              </div>
              {formData.before_image_path && (
                <div className="mt-2 relative">
                  <img src={getFileUrl(formData.before_image_path) || ''} alt="Before" className="w-full h-32 object-cover rounded-lg" />
                  <button onClick={() => setFormData((p) => ({ ...p, before_image_path: '' }))} className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full"><X size={12} className="text-white" /></button>
                </div>
              )}
            </div>

            {/* After Image */}
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2 text-sm">After Image</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'after_image_path')} className="hidden" id="after-img" />
                <label htmlFor="after-img" className="flex items-center gap-2 px-4 py-3 bg-cream-100 border border-charcoal-200 rounded-xl cursor-pointer hover:bg-cream-100 transition-all text-sm text-[#1f2937]">
                  <Upload size={16} /> {uploadingField === 'after_image_path' ? 'Uploading...' : 'Upload After Image'}
                </label>
              </div>
              {formData.after_image_path && (
                <div className="mt-2 relative">
                  <img src={getFileUrl(formData.after_image_path) || ''} alt="After" className="w-full h-32 object-cover rounded-lg" />
                  <button onClick={() => setFormData((p) => ({ ...p, after_image_path: '' }))} className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full"><X size={12} className="text-white" /></button>
                </div>
              )}
            </div>

            {/* Before Video */}
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2 text-sm">Before Video</label>
              <div className="relative">
                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'before_video_path')} className="hidden" id="before-vid" />
                <label htmlFor="before-vid" className="flex items-center gap-2 px-4 py-3 bg-cream-100 border border-charcoal-200 rounded-xl cursor-pointer hover:bg-cream-100 transition-all text-sm text-[#1f2937]">
                  <Video size={16} /> {uploadingField === 'before_video_path' ? 'Uploading...' : 'Upload Before Video'}
                </label>
              </div>
              {formData.before_video_path && (
                <div className="mt-2 flex items-center gap-2">
                  <Video size={14} className="text-[#b98545]" />
                  <span className="text-xs text-[#6b7280] truncate">{formData.before_video_path}</span>
                  <button onClick={() => setFormData((p) => ({ ...p, before_video_path: '' }))} className="p-0.5"><X size={12} className="text-red-500" /></button>
                </div>
              )}
            </div>

            {/* After Video */}
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2 text-sm">After Video</label>
              <div className="relative">
                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'after_video_path')} className="hidden" id="after-vid" />
                <label htmlFor="after-vid" className="flex items-center gap-2 px-4 py-3 bg-cream-100 border border-charcoal-200 rounded-xl cursor-pointer hover:bg-cream-100 transition-all text-sm text-[#1f2937]">
                  <Video size={16} /> {uploadingField === 'after_video_path' ? 'Uploading...' : 'Upload After Video'}
                </label>
              </div>
              {formData.after_video_path && (
                <div className="mt-2 flex items-center gap-2">
                  <Video size={14} className="text-[#b98545]" />
                  <span className="text-xs text-[#6b7280] truncate">{formData.after_video_path}</span>
                  <button onClick={() => setFormData((p) => ({ ...p, after_video_path: '' }))} className="p-0.5"><X size={12} className="text-red-500" /></button>
                </div>
              )}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData((p) => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#b98545] focus:ring-[#b98545]/50" />
              <span className="text-[#1f2937] text-sm font-medium">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.published} onChange={(e) => setFormData((p) => ({ ...p, published: e.target.checked }))} className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#b98545] focus:ring-[#b98545]/50" />
              <span className="text-[#1f2937] text-sm font-medium">Published</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-4 border-t border-charcoal-200">
            <button type="submit" className="btn-primary text-sm">{editingId ? 'Update Transformation' : 'Add Transformation'}</button>
            <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      </PremiumModal>

      {/* Preview Modal */}
      <PremiumModal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Preview Transformation" size="lg">
        {previewItem && <TransformationPreview t={previewItem} />}
      </PremiumModal>
    </div>
  );
}

function TransformationPreview({ t }: { t: Transformation }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  const move = useCallback((cx: number) => {
    if (!ref.current || !drag.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((cx - r.left) / r.width) * 100)));
  }, []);

  useEffect(() => {
    const mm = (e: MouseEvent) => move(e.clientX);
    const tm = (e: TouchEvent) => move(e.touches[0].clientX);
    const up = () => { drag.current = false; };
    window.addEventListener('mousemove', mm);
    window.addEventListener('touchmove', tm);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('touchmove', tm); window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
  }, [move]);

  const beforeUrl = getFileUrl(t.before_image_path);
  const afterUrl = getFileUrl(t.after_image_path);
  const beforeVid = getFileUrl(t.before_video_path);
  const afterVid = getFileUrl(t.after_video_path);

  const hasImages = beforeUrl && afterUrl;
  const hasVideos = beforeVid && afterVid;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {t.featured && <Star size={16} className="text-amber-600 fill-amber-500" />}
        <h3 className="text-lg font-bold text-[#1f2937]">{t.title}</h3>
      </div>
      {t.service_type && <span className="badge-primary text-xs">{t.service_type}</span>}
      {t.description && <p className="text-[#6b7280] text-sm">{t.description}</p>}

      {/* Image Slider */}
      {hasImages && (
        <div>
          <p className="text-[#1f2937] text-xs font-semibold mb-2 uppercase tracking-wider">Image Comparison</p>
          <div ref={ref} className="relative w-full h-64 md:h-80 cursor-ew-resize select-none rounded-xl overflow-hidden"
            onMouseDown={() => { drag.current = true; }} onTouchStart={() => { drag.current = true; }}>
            <img src={afterUrl} alt="After" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <img src={beforeUrl} alt="Before" className="w-full h-full object-cover brightness-75 saturate-50" />
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-lg" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-xs font-bold text-charcoal-800">&harr;</div>
            </div>
            <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium">Before</div>
            <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full bg-white/30 text-white text-[10px] font-medium">After</div>
          </div>
        </div>
      )}

      {/* Videos */}
      {hasVideos && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[#1f2937] text-xs font-semibold mb-1">Before Video</p>
            <video src={beforeVid!} controls className="w-full rounded-lg h-40 object-cover" />
          </div>
          <div>
            <p className="text-[#1f2937] text-xs font-semibold mb-1">After Video</p>
            <video src={afterVid!} controls className="w-full rounded-lg h-40 object-cover" />
          </div>
        </div>
      )}

      {!hasImages && !hasVideos && (
        <div className="text-center py-8 text-[#9ca3af]">No media uploaded yet</div>
      )}
    </div>
  );
}
