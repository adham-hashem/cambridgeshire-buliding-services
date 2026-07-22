import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { PremiumModal } from '../../components/PremiumModal';

interface JournalEntry { id: string; title: string; slug: string; category: string; content: string; excerpt: string; published_at: string; image_url?: string; }

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

const journalImages = [
  'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/279607/pexels-photo-279607.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/139312/pexels-photo-139312.jpeg?auto=compress&cs=tinysrgb&w=800',
  '/two images/pro2.webp',
];

const fallbackEntries: JournalEntry[] = [
  { id: '1', title: 'Kitchen Renovation Trends for 2026', slug: 'kitchen-trends-2026', category: 'Renovation', excerpt: 'Discover the latest kitchen design trends transforming homes across Cambridgeshire.', content: 'From handleless cabinets to quartz worktops and smart appliances, kitchen design is evolving rapidly. We explore the top trends our clients are requesting and how to create a kitchen that is both beautiful and functional.', published_at: '2026-06-15' },
  { id: '2', title: 'Choosing the Right Flooring for Your Home', slug: 'choosing-flooring', category: 'Flooring', excerpt: 'A guide to selecting the perfect flooring material for every room in your home.', content: 'Vinyl, parquet, carpet, or tile? Each flooring type has its strengths. This guide walks you through the best options for different rooms, considering durability, comfort, style, and budget.', published_at: '2026-05-20' },
  { id: '3', title: 'Before & After: Bathroom Transformations', slug: 'bathroom-transformations', category: 'Bathrooms', excerpt: 'See how we transformed three outdated bathrooms into modern, stylish spaces.', content: 'A bathroom renovation can completely change the feel of your home. We share three recent bathroom transformations, from compact cloakrooms to spacious family bathrooms.', published_at: '2026-04-10' },
  { id: '4', title: 'The Benefits of Garage Conversions', slug: 'garage-conversions', category: 'Renovation', excerpt: 'Unlock hidden living space by converting your unused garage into a functional room.', content: 'A garage conversion is one of the most cost-effective ways to add living space to your home. We discuss the planning, design, and building process, plus what to consider before you start.', published_at: '2026-03-05' },
  { id: '5', title: 'Tiling Tips: Choosing Tiles for Kitchens & Bathrooms', slug: 'tiling-tips', category: 'Tiling', excerpt: 'Everything you need to know about selecting and installing tiles in your home.', content: 'From ceramic to porcelain to natural stone, the right tile can elevate any space. We share our expert tips on tile selection, layout patterns, and maintenance.', published_at: '2026-02-18' },
  { id: '6', title: 'Preparing Your Property for Sale or Letting', slug: 'property-maintenance-sale', category: 'Maintenance', excerpt: 'How professional maintenance and repairs can maximise your property value.', content: 'First impressions matter. We cover the key repairs and improvements that can help your property sell faster or command a higher rental price.', published_at: '2026-01-10' },
];

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<JournalEntry | null>(null);
  const grid = useInView();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('garden_journal').select('*').eq('published', true).order('published_at', { ascending: false });
      setEntries(data && data.length > 0 ? data : fallbackEntries);
    };
    load();
  }, []);

  const categories = ['all', ...new Set(entries.map((e) => e.category).filter(Boolean))];
  const filtered = selectedCategory === 'all' ? entries : entries.filter((e) => e.category === selectedCategory);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  const handleSubscribe = async () => {
    if (!email) return;
    try {
      await supabase.from('newsletter_subscribers').insert({ email });
      setSubscribed(true);
      setEmail('');
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-cream-50">
      <Helmet>
        <title>Journal & Inspiration | Cambridgeshire Building Services</title>
        <meta name="description" content="Read our latest insights, tips, and trends on home renovations, building projects, and interior improvements in Cambridgeshire." />
      </Helmet>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Journal" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-900/45" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 text-center space-y-5 pt-20">
          <span className="inline-block px-3 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-[10px] tracking-[0.25em] uppercase font-body">Journal</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-display text-white tracking-tight">Inspiration & Ideas</h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto font-body leading-relaxed">Building, renovation and home improvement insights from our team</p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex flex-wrap gap-2.5 justify-center">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-[11px] tracking-widest uppercase font-body font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-navy-800 text-white'
                    : 'bg-cream-50 text-charcoal-500 border border-charcoal-200 hover:border-navy-300 hover:text-navy-800'
                }`}>
                {cat === 'all' ? 'All Articles' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-5 md:px-8">
            <div className="group bg-white rounded-2xl border border-charcoal-100 overflow-hidden hover-lift">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="h-64 md:h-auto overflow-hidden">
                  <img src={featured.image_url || journalImages[0]} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="badge-cream text-[10px]">{featured.category}</span>
                  <h2 className="text-2xl md:text-3xl font-light font-display mt-3 mb-3 group-hover:text-navy-800 transition-colors tracking-tight">{featured.title}</h2>
                  <p className="text-charcoal-500 leading-relaxed mb-5 font-body line-clamp-4">{featured.excerpt || featured.content}</p>
                  <div className="flex items-center gap-2 text-charcoal-400 text-sm font-body mb-5">
                    <Clock size={14} />
                    <span>{featured.published_at ? new Date(featured.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                  </div>
                  <button onClick={() => setSelectedArticle(featured)} className="text-navy-800 font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all font-body text-[11px] tracking-widest uppercase">
                    Learn More <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section ref={grid.ref} className="section-padding bg-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((entry, i) => (
              <div key={entry.id} className={`group bg-cream-50 rounded-2xl border border-charcoal-100 overflow-hidden hover-lift ${grid.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="h-44 overflow-hidden">
                  <img src={entry.image_url || journalImages[(i + 1) % journalImages.length]} alt={entry.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-5">
                  <span className="badge-cream text-[10px]">{entry.category}</span>
                  <h3 className="text-base font-medium font-display mt-2 mb-1.5 group-hover:text-navy-800 transition-colors line-clamp-2 tracking-tight">{entry.title}</h3>
                  <p className="text-charcoal-500 text-sm line-clamp-2 font-body leading-relaxed">{entry.excerpt || entry.content}</p>
                  <div className="flex items-center gap-1.5 text-charcoal-400 text-xs font-body mt-3 mb-4">
                    <Clock size={12} />
                    <span>{entry.published_at ? new Date(entry.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) : ''}</span>
                  </div>
                  <button onClick={() => setSelectedArticle(entry)} className="text-navy-800 font-medium flex items-center gap-1.5 hover:gap-2.5 transition-all font-body text-[11px] tracking-widest uppercase">
                    Learn More <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
              <p className="text-charcoal-400 font-body">No articles in this category yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-cream-50">
        <div className="max-w-xl mx-auto px-5 md:px-8 text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-light font-display tracking-tight">Stay Inspired</h2>
          <p className="text-charcoal-500 font-body text-sm">Subscribe to our journal for renovation ideas, expert tips, and project insights</p>
          {subscribed ? (
            <p className="text-navy-800 font-body text-sm font-medium">Thank you for subscribing!</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="input-field flex-grow" />
              <button onClick={handleSubscribe} className="btn-primary px-6 py-3 font-body text-sm whitespace-nowrap">Subscribe</button>
            </div>
          )}
        </div>
      </section>

      <PremiumModal isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} title={selectedArticle?.title || ''} size="lg">
        {selectedArticle && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-charcoal-400 text-sm font-body mb-6 pb-6 border-b border-charcoal-100">
              <span className="badge-cream text-[10px]">{selectedArticle.category}</span>
              <span>•</span>
              <Clock size={14} />
              <span>{selectedArticle.published_at ? new Date(selectedArticle.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
            </div>
            
            <div className="prose prose-lg max-w-none font-body text-charcoal-600 prose-headings:font-display prose-headings:text-navy-800 prose-a:text-gold-600">
              {selectedArticle.content.split('\n').map((paragraph, idx) => (
                paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
              ))}
            </div>
          </div>
        )}
      </PremiumModal>
    </div>
  );
}
