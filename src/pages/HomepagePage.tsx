import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check } from 'lucide-react';

interface HomepageSection {
  id: string;
  section_key: string;
  section_name: string;
  hero_headline: string;
  hero_subheadline: string;
  cta_button_text: string;
  cta_button_link: string;
  featured_section: boolean;
}

export function HomepagePage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    hero_headline: '',
    hero_subheadline: '',
    cta_button_text: '',
    cta_button_link: '',
    featured_section: true,
  });

  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      const { data } = await supabase
        .from('homepage_content')
        .select('*');
      setSections(data || []);
    } catch (error) {
      console.error('Failed to load homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: HomepageSection) => {
    setFormData({
      hero_headline: section.hero_headline,
      hero_subheadline: section.hero_subheadline,
      cta_button_text: section.cta_button_text,
      cta_button_link: section.cta_button_link,
      featured_section: section.featured_section,
    });
    setEditingId(section.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();

    if (!editingId) return;

    try {
      await supabase
        .from('homepage_content')
        .update({
          ...formData,
          updated_by: user.user?.id,
        })
        .eq('id', editingId);
      loadHomepageContent();
      resetForm();
    } catch (error) {
      console.error('Failed to save homepage content:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      hero_headline: '',
      hero_subheadline: '',
      cta_button_text: '',
      cta_button_link: '',
      featured_section: true,
    });
    setEditingId(null);
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
          Homepage Content
        </h1>
        <p className="text-[#6b7280]">Manage your homepage sections and content</p>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 gap-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            style={{ animationDelay: `${index * 100}ms` }}
            className="glass-dark card-base border border-charcoal-200 p-8 animate-slide-up"
          >
            {editingId === section.id ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#1f2937] font-semibold mb-2">Hero Headline</label>
                  <input
                    type="text"
                    value={formData.hero_headline}
                    onChange={(e) => setFormData({ ...formData, hero_headline: e.target.value })}
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-[#1f2937] font-semibold mb-2">Hero Subheadline</label>
                  <input
                    type="text"
                    value={formData.hero_subheadline}
                    onChange={(e) => setFormData({ ...formData, hero_subheadline: e.target.value })}
                    className="input-premium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#1f2937] font-semibold mb-2">Button Text</label>
                    <input
                      type="text"
                      value={formData.cta_button_text}
                      onChange={(e) => setFormData({ ...formData, cta_button_text: e.target.value })}
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1f2937] font-semibold mb-2">Button Link</label>
                    <input
                      type="text"
                      value={formData.cta_button_link}
                      onChange={(e) => setFormData({ ...formData, cta_button_link: e.target.value })}
                      className="input-premium"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured_section}
                    onChange={(e) => setFormData({ ...formData, featured_section: e.target.checked })}
                    className="w-5 h-5 rounded accent-[#b98545]"
                  />
                  <span className="text-[#1f2937] font-semibold">Featured</span>
                </label>

                <div className="flex gap-2 pt-4 border-t border-charcoal-200">
                  <button
                    type="submit"
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#1f2937]">{section.section_name}</h3>
                <p className="text-[#1f2937]">{section.hero_headline}</p>
                <p className="text-[#6b7280] text-sm">{section.hero_subheadline}</p>
                <div className="flex items-center justify-between pt-4 border-t border-charcoal-200">
                  <div className="flex gap-2">
                    {section.featured_section && (
                      <span className="badge badge-primary">Featured</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEdit(section)}
                    className="btn-primary text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
