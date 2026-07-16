import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowRight, MapPin, Calendar, ArrowLeft } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  completion_date: string | null;
  cover_image_path: string | null;
  gallery_paths: string[] | null;
  before_image_path: string | null;
  after_image_path: string | null;
  service_type: string | null;
  featured: boolean;
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const fallbackImages = [
  'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/279607/pexels-photo-279607.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  const grid = useInView();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('projects').select('*').eq('status', 'published').order('created_at', { ascending: false });
      setProjects(data as Project[] || []);
      setLoading(false);
    };
    load();
  }, []);

  const categories = ['all', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];
  const filtered = activeCategory === 'all' ? projects : projects.filter((p) => p.category === activeCategory);

  const openProject = (p: Project) => {
    setSelected(p);
    setSliderIndex(0);
  };

  const galleryImages = selected ? [
    ...(selected.gallery_paths || []).map((p) => supabase.storage.from('media').getPublicUrl(p).data.publicUrl),
    selected.cover_image_path ? supabase.storage.from('media').getPublicUrl(selected.cover_image_path).data.publicUrl : null,
    selected.before_image_path ? supabase.storage.from('media').getPublicUrl(selected.before_image_path).data.publicUrl : null,
    selected.after_image_path ? supabase.storage.from('media').getPublicUrl(selected.after_image_path).data.publicUrl : null,
  ].filter(Boolean) as string[] : [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-20">
        <div className="w-12 h-12 rounded-full border-2 border-charcoal-200 border-t-navy-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Portfolio" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-900/45" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 text-center space-y-5 pt-20">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-[10px] tracking-[0.25em] uppercase font-body">Our Work</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-display text-white tracking-tight">Project Portfolio</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto font-body leading-relaxed">A selection of our recent building, renovation and improvement projects across Cambridgeshire</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-charcoal-200/60 bg-white/95 backdrop-blur-lg sticky top-16 md:top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-[11px] tracking-widest uppercase font-body font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat ? 'bg-navy-800 text-white' : 'text-charcoal-500 hover:text-charcoal-900 bg-cream-100'
                }`}
              >
                {cat === 'all' ? 'All Projects' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section ref={grid.ref} className="section-padding">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filtered.map((p, i) => (
                <div key={p.id} className={`group cursor-pointer ${grid.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 80}ms` }} onClick={() => openProject(p)}>
                  <div className="garden-image h-72 overflow-hidden mb-4">
                    <img src={p.cover_image_path ? supabase.storage.from('media').getPublicUrl(p.cover_image_path).data.publicUrl : fallbackImages[i % 6]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="badge-cream text-[10px]">{p.category}</span>
                    {p.featured && <span className="badge-gold text-[10px]">Featured</span>}
                  </div>
                  <h3 className="text-lg font-light font-display tracking-tight group-hover:text-navy-900 transition-colors duration-300">{p.title}</h3>
                  {p.location && <p className="text-charcoal-400 text-xs mt-1 font-body flex items-center gap-1"><MapPin size={10} /> {p.location}</p>}
                  {p.completion_date && <p className="text-charcoal-400 text-xs mt-1 font-body flex items-center gap-1"><Calendar size={10} /> {new Date(p.completion_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <p className="text-charcoal-400 font-body text-sm">Projects coming soon. Check back shortly.</p>
              <Link to="/contact" className="btn-outline inline-flex items-center gap-2 font-body">Request a Quote <ArrowRight size={14} /></Link>
            </div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-charcoal-900/80 backdrop-blur-sm" />
          <div className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all">
              <ArrowLeft size={18} className="text-charcoal-700 rotate-45" />
            </button>

            {/* Image Gallery */}
            {galleryImages.length > 0 && (
              <div className="relative h-72 md:h-96 overflow-hidden rounded-t-2xl">
                <img src={galleryImages[sliderIndex]} alt={selected.title} className="w-full h-full object-cover" />
                {galleryImages.length > 1 && (
                  <>
                    <button onClick={() => setSliderIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all">
                      <ArrowLeft size={18} className="text-charcoal-700" />
                    </button>
                    <button onClick={() => setSliderIndex((i) => (i + 1) % galleryImages.length)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all">
                      <ArrowRight size={18} className="text-charcoal-700" />
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="p-8 md:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="badge-cream text-[10px]">{selected.category}</span>
                {selected.featured && <span className="badge-gold text-[10px]">Featured</span>}
              </div>
              <h2 className="text-2xl md:text-3xl font-light font-display tracking-tight">{selected.title}</h2>
              <div className="flex flex-wrap gap-6 text-sm font-body text-charcoal-500">
                {selected.location && <span className="flex items-center gap-1.5"><MapPin size={13} /> {selected.location}</span>}
                {selected.completion_date && <span className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(selected.completion_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>}
                {selected.service_type && <span className="text-navy-800">{selected.service_type}</span>}
              </div>
              <p className="text-charcoal-600 font-body leading-relaxed">{selected.description}</p>

              {/* Before / After */}
              {selected.before_image_path && selected.after_image_path && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase font-body text-charcoal-400 mb-2">Before</p>
                    <img src={supabase.storage.from('media').getPublicUrl(selected.before_image_path).data.publicUrl} alt="Before" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase font-body text-charcoal-400 mb-2">After</p>
                    <img src={supabase.storage.from('media').getPublicUrl(selected.after_image_path).data.publicUrl} alt="After" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-charcoal-100">
                <Link to="/contact" className="btn-primary inline-flex items-center gap-2 font-body text-sm">Get a Similar Quote <ArrowRight size={14} /></Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
