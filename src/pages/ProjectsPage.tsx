import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Trash2, Plus, Check, Search, Filter, Upload, X, Eye, EyeOff, Star, ArrowLeft, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { PremiumModal } from '../components/PremiumModal';

interface Project {
  id: string;
  title: string;
  description: string;
  short_description: string | null;
  category: string | null;
  service_type: string | null;
  location: string | null;
  completion_date: string | null;
  cover_image_path: string | null;
  gallery_paths: string[] | null;
  before_image_path: string | null;
  after_image_path: string | null;
  status: string;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

const CATEGORIES = [
  'Tiling & Flooring', 'Kitchen & Bathroom', 'Painting & Decorating',
  'Doors & Windows', 'Outdoor & Exterior', 'General Building',
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const filename = `projects/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(filename, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  return filename;
}

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

const emptyForm = {
  title: '', description: '', short_description: '', category: '', service_type: '',
  location: '', completion_date: '', cover_image_path: '', gallery_paths: [] as string[],
  before_image_path: '', after_image_path: '', status: 'draft', featured: false,
  seo_title: '', seo_description: '',
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      setProjects(data as Project[] || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateAndUpload = async (file: File): Promise<string> => {
    if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Invalid format. Use JPG, PNG, or WEBP.');
    if (file.size > MAX_FILE_SIZE) throw new Error('File exceeds 10MB limit.');
    return uploadImage(file);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const path = await validateAndUpload(file);
      setFormData((p) => ({ ...p, cover_image_path: path }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError('');
    setUploading(true);
    try {
      const paths = await Promise.all(files.map(validateAndUpload));
      setFormData((p) => ({ ...p, gallery_paths: [...p.gallery_paths, ...paths] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const handleBeforeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const path = await validateAndUpload(file);
      setFormData((p) => ({ ...p, before_image_path: path }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const handleAfterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const path = await validateAndUpload(file);
      setFormData((p) => ({ ...p, after_image_path: path }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const removeGalleryImage = (idx: number) => {
    setFormData((p) => ({ ...p, gallery_paths: p.gallery_paths.filter((_, i) => i !== idx) }));
  };

  const moveGalleryImage = (idx: number, dir: 'left' | 'right') => {
    setFormData((p) => {
      const arr = [...p.gallery_paths];
      const swap = dir === 'left' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= arr.length) return p;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return { ...p, gallery_paths: arr };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      short_description: formData.short_description || null,
      category: formData.category || null,
      service_type: formData.service_type || null,
      location: formData.location || null,
      completion_date: formData.completion_date || null,
      cover_image_path: formData.cover_image_path || null,
      gallery_paths: formData.gallery_paths.length > 0 ? formData.gallery_paths : null,
      before_image_path: formData.before_image_path || null,
      after_image_path: formData.after_image_path || null,
      status: formData.status,
      featured: formData.featured,
      seo_title: formData.seo_title || null,
      seo_description: formData.seo_description || null,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const { error } = await supabase.from('projects').insert({ ...payload, created_by: user?.id });
        if (error) throw error;
      }
      loadProjects();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save project:', error);
      alert('Failed to save project: ' + (error.message || JSON.stringify(error)));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this project?')) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
        loadProjects();
      } catch (error: any) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project: ' + (error.message || JSON.stringify(error)));
      }
    }
  };

  const togglePublish = async (project: Project) => {
    const newStatus = project.status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', project.id);
      if (error) throw error;
      loadProjects();
    } catch (error: any) {
      console.error('Failed to toggle publish:', error);
      alert('Failed to toggle publish: ' + (error.message || JSON.stringify(error)));
    }
  };

  const toggleFeatured = async (project: Project) => {
    try {
      const { error } = await supabase.from('projects').update({ featured: !project.featured }).eq('id', project.id);
      if (error) throw error;
      loadProjects();
    } catch (error: any) {
      console.error('Failed to toggle featured:', error);
      alert('Failed to toggle featured: ' + (error.message || JSON.stringify(error)));
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setUploadError('');
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description || '',
      short_description: project.short_description || '',
      category: project.category || '',
      service_type: project.service_type || '',
      location: project.location || '',
      completion_date: project.completion_date || '',
      cover_image_path: project.cover_image_path || '',
      gallery_paths: project.gallery_paths || [],
      before_image_path: project.before_image_path || '',
      after_image_path: project.after_image_path || '',
      status: project.status,
      featured: project.featured,
      seo_title: project.seo_title || '',
      seo_description: project.seo_description || '',
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openProjectPreview = (p: Project) => {
    setSelectedProject(p);
    setSliderIndex(0);
  };

  const previewGallery = selectedProject ? [
    ...(selectedProject.gallery_paths || []),
    selectedProject.cover_image_path,
    selectedProject.before_image_path,
    selectedProject.after_image_path,
  ].filter(Boolean) as string[] : [];

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
          <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-2">Projects</h1>
          <p className="text-[#6b7280]">Manage your building project portfolio</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] w-5 h-5" />
          <input type="text" placeholder="Search projects..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="input-premium pl-12" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-[#9ca3af] w-5 h-5 flex-shrink-0" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-premium">
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-premium">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-20 text-[#6b7280]">
            No projects found. Click "New Project" to create one.
          </div>
        ) : filteredProjects.map((project, index) => {
          const imgUrl = getImageUrl(project.cover_image_path);
          return (
            <div key={project.id} style={{ animationDelay: `${index * 50}ms` }}
              className="glass-dark card-base border border-charcoal-200 p-6 hover-lift group animate-slide-up">
              {imgUrl && (
                <div className="relative h-40 mb-4 overflow-hidden rounded-lg cursor-pointer" onClick={() => openProjectPreview(project)}>
                  <img src={imgUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1f2937] flex-1 group-hover:text-[#b98545] transition-colors">{project.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleFeatured(project)} className="p-2 hover:bg-cream-100 rounded-lg transition-all" title="Toggle Featured">
                    <Star size={16} className={project.featured ? 'text-[#b98545] fill-[#b98545]' : 'text-[#9ca3af]'} />
                  </button>
                  <button onClick={() => togglePublish(project)} className="p-2 hover:bg-cream-100 rounded-lg transition-all" title={project.status === 'published' ? 'Unpublish' : 'Publish'}>
                    {project.status === 'published' ? <Eye size={16} className="text-[#b98545]" /> : <EyeOff size={16} className="text-[#9ca3af]" />}
                  </button>
                  <button onClick={() => handleEdit(project)} className="p-2 hover:bg-cream-100 rounded-lg transition-all">
                    <Edit2 size={16} className="text-[#b98545]" />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-100 rounded-lg transition-all">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-[#6b7280] text-sm mb-4 line-clamp-2">{project.short_description || project.description}</p>
              <div className="space-y-1 mb-4">
                {project.location && <p className="text-[#9ca3af] text-xs flex items-center gap-1"><MapPin size={11} /> {project.location}</p>}
                {project.completion_date && <p className="text-[#9ca3af] text-xs flex items-center gap-1"><Calendar size={11} /> {new Date(project.completion_date).toLocaleDateString('en-GB')}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-charcoal-200">
                {project.category && <span className="badge badge-primary">{project.category}</span>}
                {project.featured && <span className="badge badge-gold">Featured</span>}
                <span className={`badge ${project.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                  {project.status === 'published' ? 'Published' : 'Draft'}
                </span>
                {project.gallery_paths && project.gallery_paths.length > 0 && (
                  <span className="text-[#9ca3af] text-xs ml-auto">{project.gallery_paths.length} images</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal */}
      <PremiumModal isOpen={showForm} onClose={resetForm} title={editingId ? 'Edit Project' : 'New Project'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Project Title *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-premium" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Service Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="select-premium">
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Service Type</label>
              <input type="text" value={formData.service_type} onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="input-premium" placeholder="e.g. Kitchen Renovation" />
            </div>
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Short Description</label>
            <input type="text" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="input-premium" placeholder="Brief summary for cards" />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Full Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea-premium h-32" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Project Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-premium" placeholder="e.g. Cambridge, UK" />
            </div>
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Completion Date</label>
              <input type="date" value={formData.completion_date} onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                className="input-premium" />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Featured Image</label>
            {formData.cover_image_path ? (
              <div className="relative group rounded-lg overflow-hidden border border-charcoal-200">
                <img src={getImageUrl(formData.cover_image_path) || ''} alt="Featured" className="w-full h-48 object-cover" />
                <button type="button" onClick={() => setFormData({ ...formData, cover_image_path: '' })}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div onClick={() => coverRef.current?.click()}
                className="border-2 border-dashed border-charcoal-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#b98545] hover:bg-cream-50 transition-all">
                <input ref={coverRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleCoverUpload} className="hidden" />
                <Upload className="w-7 h-7 text-[#9ca3af] mx-auto mb-2" />
                <p className="text-[#6b7280] text-sm">{uploading ? 'Uploading...' : 'Click to upload featured image'}</p>
              </div>
            )}
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Gallery Images (Multiple)</label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              {formData.gallery_paths.map((path, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-charcoal-200">
                  <img src={getImageUrl(path) || ''} alt={`Gallery ${idx + 1}`} className="w-full h-24 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button type="button" onClick={() => moveGalleryImage(idx, 'left')} disabled={idx === 0}
                      className="p-1 bg-white/20 rounded hover:bg-white/30 transition-all disabled:opacity-30">
                      <ArrowLeft size={14} className="text-white" />
                    </button>
                    <button type="button" onClick={() => removeGalleryImage(idx)}
                      className="p-1 bg-red-500/80 rounded hover:bg-red-500 transition-all">
                      <X size={14} className="text-white" />
                    </button>
                    <button type="button" onClick={() => moveGalleryImage(idx, 'right')} disabled={idx === formData.gallery_paths.length - 1}
                      className="p-1 bg-white/20 rounded hover:bg-white/30 transition-all disabled:opacity-30">
                      <ArrowRight size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
              <div onClick={() => galleryRef.current?.click()}
                className="border-2 border-dashed border-charcoal-200 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-[#b98545] hover:bg-cream-50 transition-all">
                <input ref={galleryRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={handleGalleryUpload} className="hidden" />
                <Plus className="w-6 h-6 text-[#9ca3af]" />
              </div>
            </div>
            <p className="text-[#9ca3af] text-xs">JPG, PNG, WEBP up to 10MB each. Use arrows to reorder.</p>
          </div>

          {/* Before & After */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Before Image (Optional)</label>
              {formData.before_image_path ? (
                <div className="relative group rounded-lg overflow-hidden border border-charcoal-200">
                  <img src={getImageUrl(formData.before_image_path) || ''} alt="Before" className="w-full h-32 object-cover" />
                  <button type="button" onClick={() => setFormData({ ...formData, before_image_path: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div onClick={() => beforeRef.current?.click()}
                  className="border-2 border-dashed border-charcoal-200 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-[#b98545] hover:bg-cream-50 transition-all">
                  <input ref={beforeRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleBeforeUpload} className="hidden" />
                  <Upload className="w-6 h-6 text-[#9ca3af]" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">After Image (Optional)</label>
              {formData.after_image_path ? (
                <div className="relative group rounded-lg overflow-hidden border border-charcoal-200">
                  <img src={getImageUrl(formData.after_image_path) || ''} alt="After" className="w-full h-32 object-cover" />
                  <button type="button" onClick={() => setFormData({ ...formData, after_image_path: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div onClick={() => afterRef.current?.click()}
                  className="border-2 border-dashed border-charcoal-200 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-[#b98545] hover:bg-cream-50 transition-all">
                  <input ref={afterRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleAfterUpload} className="hidden" />
                  <Upload className="w-6 h-6 text-[#9ca3af]" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="select-premium">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded accent-[#b98545]" />
                <span className="text-[#1f2937] font-semibold">Featured Project</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">SEO Title</label>
            <input type="text" value={formData.seo_title} onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })} className="input-premium" />
          </div>
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">SEO Description</label>
            <textarea value={formData.seo_description} onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })} className="textarea-premium h-20" />
          </div>

          {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}

          <div className="flex gap-4 pt-6 border-t border-charcoal-200">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Check size={20} /> Save Project
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </PremiumModal>

      {/* Project Preview Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedProject(null)}>
          <div className="absolute inset-0 bg-charcoal-900/80 backdrop-blur-sm" />
          <div className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all">
              <X size={18} className="text-charcoal-700" />
            </button>
            {previewGallery.length > 0 && (
              <div className="relative h-72 md:h-96 overflow-hidden rounded-t-2xl">
                <img src={getImageUrl(previewGallery[sliderIndex]) || ''} alt={selectedProject.title} className="w-full h-full object-cover" />
                {previewGallery.length > 1 && (
                  <>
                    <button onClick={() => setSliderIndex((i) => (i - 1 + previewGallery.length) % previewGallery.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all">
                      <ArrowLeft size={18} className="text-charcoal-700" />
                    </button>
                    <button onClick={() => setSliderIndex((i) => (i + 1) % previewGallery.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all">
                      <ArrowRight size={18} className="text-charcoal-700" />
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="p-8 md:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {selectedProject.category && <span className="badge badge-primary">{selectedProject.category}</span>}
                {selectedProject.featured && <span className="badge badge-gold">Featured</span>}
                <span className={`badge ${selectedProject.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                  {selectedProject.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-light font-display tracking-tight text-navy-800">{selectedProject.title}</h2>
              <div className="flex flex-wrap gap-6 text-sm font-body text-charcoal-500">
                {selectedProject.location && <span className="flex items-center gap-1.5"><MapPin size={13} /> {selectedProject.location}</span>}
                {selectedProject.completion_date && <span className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(selectedProject.completion_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>}
                {selectedProject.service_type && <span className="text-navy-800">{selectedProject.service_type}</span>}
              </div>
              {selectedProject.short_description && <p className="text-[#1f2937] font-medium">{selectedProject.short_description}</p>}
              <p className="text-charcoal-600 font-body leading-relaxed">{selectedProject.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
