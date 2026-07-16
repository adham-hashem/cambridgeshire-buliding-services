import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Edit2, Trash2, Plus, Check } from 'lucide-react';
import { PremiumModal } from '../components/PremiumModal';

interface Testimonial {
  id: string;
  client_name: string;
  review_text: string;
  rating: number;
  featured: boolean;
  created_at: string;
}

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    review_text: '',
    rating: 5,
    featured: false,
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      setTestimonials(data || []);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();

    try {
      if (editingId) {
        await supabase.from('testimonials').update(formData).eq('id', editingId);
      } else {
        await supabase.from('testimonials').insert({
          ...formData,
          created_by: user.user?.id,
        });
      }
      loadTestimonials();
      resetForm();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this testimonial?')) {
      try {
        await supabase.from('testimonials').delete().eq('id', id);
        loadTestimonials();
      } catch (error) {
        console.error('Failed to delete testimonial:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      review_text: '',
      rating: 5,
      featured: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      client_name: testimonial.client_name,
      review_text: testimonial.review_text,
      rating: testimonial.rating,
      featured: testimonial.featured,
    });
    setEditingId(testimonial.id);
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
            Testimonials
          </h1>
          <p className="text-[#6b7280]">Manage client reviews and feedback</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus size={20} />
          New Testimonial
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="glass-dark card-base border border-charcoal-200 p-6 hover-lift group animate-slide-up"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-amber-500 text-amber-600"
                  />
                ))}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 hover:bg-cream-100 rounded-lg transition-all"
                >
                  <Edit2 size={16} className="text-[#b98545]" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-all"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>

            <p className="text-[#1f2937] mb-4 italic leading-relaxed">"{testimonial.review_text}"</p>
            <div className="flex items-center justify-between pt-4 border-t border-charcoal-200">
              <p className="text-[#b98545] font-semibold">— {testimonial.client_name}</p>
              {testimonial.featured && (
                <span className="badge badge-primary">Featured</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      <PremiumModal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Edit Testimonial' : 'New Testimonial'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Client Name *</label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              className="input-premium"
              required
            />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-2">Review Text *</label>
            <textarea
              value={formData.review_text}
              onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
              className="textarea-premium h-32"
              required
            />
          </div>

          <div>
            <label className="block text-[#1f2937] font-semibold mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating })}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    size={28}
                    className={
                      rating <= formData.rating
                        ? 'fill-amber-500 text-amber-600'
                        : 'text-[#9ca3af]'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-5 h-5 rounded accent-[#b98545]"
            />
            <span className="text-[#1f2937] font-semibold">Featured Testimonial</span>
          </label>

          <div className="flex gap-4 pt-6 border-t border-charcoal-200">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Check size={20} />
              Save
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
