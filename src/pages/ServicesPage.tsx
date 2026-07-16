import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Trash2, Plus, Check, Search, Filter, Upload, X, Eye, EyeOff, Star } from 'lucide-react';
import { PremiumModal } from '../components/PremiumModal';

interface Service {
  id: string;
  name: string;
  description: string;
  featured: boolean;
  display_order: number;
  category: string | null;
  image_path: string | null;
  published: boolean;
  slug: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

const CATEGORIES = [
  'Tiling & Flooring',
  'Kitchen & Bathroom',
  'Painting & Decorating',
  'Doors & Windows',
  'Outdoor & Exterior',
  'General Building',
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const filename = `services/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(filename, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  return filename;
}

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    featured: false,
    display_order: 0,
    category: '',
    image_path: '' as string,
    published: true,
    slug: '',
    seo_title: '',
    seo_description: '',
  });

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      const { data } = await supabase.from('services').select('*').order('display_order', { ascending: true });
      setServices(data as Service[] || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Invalid format. Use JPG, PNG, or WEBP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }
    setUploading(true);
    try {
      const path = await uploadImage(file);
      setFormData((p) => ({ ...p, image_path: path }));
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const removeImage = () => {
    setFormData((p) => ({ ...p, image_path: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();
    const payload = {
      name: formData.name,
      description: formData.description,
      featured: formData.featured,
      display_order: formData.display_order,
      category: formData.category || null,
      image_path: formData.image_path || null,
      published: formData.published,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      seo_title: formData.seo_title || null,
      seo_description: formData.seo_description || null,
    };

    try {
      if (editingId) {
        await supabase.from('services').update(payload).eq('id', editingId);
      } else {
        await supabase.from('services').insert({ ...payload, created_by: user.user?.id });
      }
      loadServices();
      resetForm();
    } catch (error) {
      console.error('Failed to save service:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this service?')) {
      try {
        await supabase.from('services').delete().eq('id', id);
        loadServices();
      } catch (error) {
        console.error('Failed to delete service:', error);
      }
    }
  };

  const togglePublish = async (service: Service) => {
    try {
      await supabase.from('services').update({ published: !service.published }).eq('id', service.id);
      loadServices();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  const toggleFeatured = async (service: Service) => {
    try {
      await supabase.from('services').update({ featured: !service.featured }).eq('id', service.id);
      loadServices();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', featured: false, display_order: 0,
      category: '', image_path: '', published: true, slug: '', seo_title: '', seo_description: '',
    });
    setEditingId(null);
    setShowForm(false);
    setUploadError('');
  };

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      featured: service.featured,
      display_order: service.display_order || 0,
      category: service.category || '',
      image_path: service.image_path || '',
      published: service.published,
      slug: service.slug || '',
      seo_title: service.seo_title || '',
      seo_description: service.seo_description || '',
    });
    setEditingId(service.id);
    setShowForm(true);
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesPublish = publishFilter === 'all' ||
      (publishFilter === 'published' && s.published) ||
      (publishFilter === 'unpublished' && !s.published);
    return matchesSearch && matchesCategory && matchesPublish;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 rounded-full border-4 border-cream-100 border-t-[#b98545] animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-2">Services</h1>
          <p className="text-[#6b7280]">Manage your building service offerings</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
          <Plus size={20} /> New Service
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] w-5 h-5" />
          <input type="text" placeholder="Search services..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="input-premium pl-12" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-[#9ca3af] w-5 h-5 flex-shrink-0" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-premium">
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={publishFilter} onChange={(e) => setPublishFilter(e.target.value)} className="select-premium">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full text-center py-20 text-[#6b7280]">
            No services found. Click "New Service" to create one.
          </div>
        ) : filteredServices.map((service, index) => {
          const imgUrl = getImageUrl(service.image_path);
          return (
            <div key={service.id} style={{ animationDelay: `${index * 50}ms` }}
              className="glass-dark card-base border border-charcoal-200 p-6 hover-lift group animate-slide-up">
              {imgUrl && (
                <div className="relative h-40 mb-4 overflow-hidden rounded-lg">
                  <img src={imgUrl} alt={service.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1f2937] flex-1 group-hover:text-[#b98545] transition-colors">{service.name}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleFeatured(service)} className="p-2 hover:bg-cream-100 rounded-lg transition-all" title="Toggle Featured">
                    <Star size={16} className={service.featured ? 'text-[#b98545] fill-[#b98545]' : 'text-[#9ca3af]'} />
                  </button>
                  <button onClick={() => togglePublish(service)} className="p-2 hover:bg-cream-100 rounded-lg transition-all" title={service.published ? 'Unpublish' : 'Publish'}>
                    {service.published ? <Eye size={16} className="text-[#b98545]" /> : <EyeOff size={16} className="text-[#9ca3af]" />}
                  </button>
                  <button onClick={() => handleEdit(service)} className="p-2 hover:bg-cream-100 rounded-lg transition-all">
                    <Edit2 size={16} className="text-[#b98545]" />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="p-2 hover:bg-red-100 rounded-lg transition-all">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-[#6b7280] text-sm mb-4 line-clamp-2">{service.description}</p>
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-charcoal-200">
                {service.category && <span className="badge badge-primary">{service.category}</span>}
                {service.featured && <span className="badge badge-gold">Featured</span>}
                <span className={`badge ${service.published ? 'badge-success' : 'badge-warning'}`}>
                  {service.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-[#9ca3af] text-xs ml-auto">Order: {service.display_order}</span>
              </div>
            </div>
          );
        })}
      </div>

      <PremiumModal isOpen={showForm} onClose={resetForm} title={editingId ? 'Edit Service' : 'New Service'} size="md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Service Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-premium" required />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea-premium h-32" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="select-premium">
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Display Order</label>
              <input type="number" value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} className="input-premium" />
            </div>
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Featured Image</label>
            {formData.image_path ? (
              <div className="relative group rounded-lg overflow-hidden border border-charcoal-200">
                <img src={getImageUrl(formData.image_path) || ''} alt="Featured" className="w-full h-48 object-cover" />
                <button type="button" onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-charcoal-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#b98545] hover:bg-cream-50 transition-all">
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileUpload} className="hidden" />
              <Upload className="w-7 h-7 text-[#9ca3af] mx-auto mb-2" />
              <p className="text-[#6b7280] text-sm">{uploading ? 'Uploading...' : 'Click to upload image'}</p>
              <p className="text-[#9ca3af] text-xs mt-1">JPG, PNG, WEBP up to 10MB</p>
            </div>
            )}
            {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 rounded accent-[#b98545]" />
              <span className="text-[#1f2937] font-semibold">Featured</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-5 h-5 rounded accent-[#b98545]" />
              <span className="text-[#1f2937] font-semibold">Published</span>
            </label>
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">SEO Title</label>
            <input type="text" value={formData.seo_title} onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })} className="input-premium" />
          </div>
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">SEO Description</label>
            <textarea value={formData.seo_description} onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })} className="textarea-premium h-20" />
          </div>

          <div className="flex gap-4 pt-6 border-t border-charcoal-200">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Check size={20} /> Save Service
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
}
