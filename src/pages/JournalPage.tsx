import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Trash2, Plus, Check, Eye, EyeOff } from 'lucide-react';
import { PremiumModal } from '../components/PremiumModal';

interface JournalArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  published: boolean;
  seo_title: string;
  seo_description: string;
  created_at: string;
}

export function JournalPage() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    published: false,
    seo_title: '',
    seo_description: '',
  });

  const categories = ['Seasonal Tips', 'Garden Design', 'Maintenance', 'Inspiration', 'Trends'];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data } = await supabase
        .from('garden_journal')
        .select('*')
        .order('created_at', { ascending: false });
      setArticles(data || []);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();

    try {
      if (editingId) {
        await supabase.from('garden_journal').update(formData).eq('id', editingId);
      } else {
        await supabase.from('garden_journal').insert({
          ...formData,
          created_by: user.user?.id,
          published_at: formData.published ? new Date().toISOString() : null,
        });
      }
      loadArticles();
      resetForm();
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await supabase.from('garden_journal').update({
        published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null,
      }).eq('id', id);
      loadArticles();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this article?')) {
      try {
        await supabase.from('garden_journal').delete().eq('id', id);
        loadArticles();
      } catch (error) {
        console.error('Failed to delete article:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      category: '',
      published: false,
      seo_title: '',
      seo_description: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (article: JournalArticle) => {
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category,
      published: article.published,
      seo_title: article.seo_title,
      seo_description: article.seo_description,
    });
    setEditingId(article.id);
    setShowForm(true);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy-800 mb-2">
            Garden Journal
          </h1>
          <p className="text-[#6b7280]">Create and manage garden inspiration content</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div
            key={article.id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="glass-dark card-base border border-charcoal-200 p-6 hover-lift group animate-slide-up"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#1f2937] group-hover:text-[#b98545] transition-colors">
                    {article.title}
                  </h3>
                  {article.published && (
                    <span className="badge badge-success">Published</span>
                  )}
                </div>
                <p className="text-[#6b7280] text-sm mb-2">{article.slug}</p>
                <p className="text-[#1f2937] text-sm line-clamp-2 mb-3">{article.content}</p>
                <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
                  <span className="badge badge-primary">{article.category}</span>
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => togglePublish(article.id, article.published)}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-all"
                  title={article.published ? 'Unpublish' : 'Publish'}
                >
                  {article.published ? (
                    <Eye size={16} className="text-[#b98545]" />
                  ) : (
                    <EyeOff size={16} className="text-[#9ca3af]" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(article)}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-all"
                >
                  <Edit2 size={16} className="text-[#b98545]" />
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-all"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <PremiumModal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Edit Article' : 'New Article'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="input-premium"
              required
            />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="input-premium"
            />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="textarea-premium h-40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#1f2937] font-semibold mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="select-premium"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 rounded accent-[#b98545]"
                />
                <span className="text-[#1f2937] font-semibold">Publish</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">SEO Title</label>
            <input
              type="text"
              value={formData.seo_title}
              onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
              className="input-premium"
            />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">SEO Description</label>
            <textarea
              value={formData.seo_description}
              onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
              className="textarea-premium h-20"
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-charcoal-200">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Check size={20} />
              Save Article
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </PremiumModal>
    </div>
  );
}
