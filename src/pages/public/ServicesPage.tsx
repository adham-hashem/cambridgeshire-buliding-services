import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ArrowRight, TreePine, Layers, Bath, Home, DoorOpen,
  Hammer, Droplets, Wrench,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  slug: string;
  image_path: string | null;
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

const categoryImages: Record<string, string> = {
  'Outdoor & Exterior': '/services images/Patio Installation.webp',
  'Tiling & Flooring': '/services images/Tile Installation.webp',
  'Kitchen & Bathroom': '/services images/Bathroom Renovations.webp',
  'Doors & Windows': '/services images/Internal Door Installation.webp',
  'General Building': '/services images/Garage Conversion.webp',
  'Painting & Decorating': '/services images/Interior House Painting.webp',
};

const categoryOrder = [
  'General Building', 'Kitchen & Bathroom', 'Tiling & Flooring',
  'Painting & Decorating', 'Doors & Windows', 'Outdoor & Exterior',
];



export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const grid = useInView();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('services').select('*').eq('published', true).order('display_order');
      setServices(data as Service[] || []);
      setLoading(false);
    };
    load();
  }, []);

  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const categories = categoryOrder.filter((c) => grouped[c]);
  const filteredServices = activeCategory === 'all' ? services : (grouped[activeCategory] || []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-20">
        <div className="w-12 h-12 rounded-full border-2 border-charcoal-200 border-t-navy-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-cream-50">
      <Helmet>
        <title>Building Services | Cambridgeshire Home Renovations</title>
        <meta name="description" content="Explore our wide range of building services including home renovations, kitchens, bathrooms, flooring, tiling, and outdoor improvements across Cambridgeshire." />
      </Helmet>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Building services" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-900/45" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 text-center space-y-5 pt-20">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-[10px] tracking-[0.25em] uppercase font-body">Our Services</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-display text-white tracking-tight">Building Services</h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto font-body leading-relaxed">Complete building, renovation, and property improvement services across Cambridgeshire</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-16 md:top-[72px] z-30 bg-white/95 backdrop-blur-lg border-b border-charcoal-200/60">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 text-[11px] tracking-widest uppercase font-body font-medium whitespace-nowrap transition-all duration-300 ${
                activeCategory === 'all' ? 'bg-navy-800 text-white' : 'text-charcoal-500 hover:text-charcoal-900 bg-cream-100'
              }`}
            >
              All Services
            </button>
            {categories.map((cat) => {
              const imgSrc = categoryImages[cat] || '/services images/Garage Conversion.webp';
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-[11px] tracking-widest uppercase font-body font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                    active ? 'bg-navy-800 text-white' : 'text-charcoal-500 hover:text-charcoal-900 bg-cream-100'
                  }`}
                >
                  <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 bg-white">
                    <img src={imgSrc} alt={cat} className="absolute inset-0 w-full h-full object-cover object-center scale-[1.35]" />
                  </div>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section ref={grid.ref} className="section-padding">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {services.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-charcoal-400 font-body text-sm">Services will appear here soon. Please check back shortly.</p>
              <Link to="/contact" className="btn-outline inline-flex items-center gap-2 font-body">Request a Quote <ArrowRight size={14} /></Link>
            </div>
          ) : activeCategory === 'all' ? (
            <div className="space-y-16 md:space-y-24">
              {categories.map((cat) => {
                const imgSrc = categoryImages[cat] || '/services images/Garage Conversion.webp';
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-4 mb-10 md:mb-12">
                      <div className="relative w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-charcoal-200 bg-white">
                        <img src={imgSrc} alt={cat} className="absolute inset-0 w-full h-full object-cover object-center scale-[1.35]" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-light font-display tracking-tight">{cat}</h2>
                      <div className="flex-1 h-px bg-charcoal-200/50" />
                      <span className="text-charcoal-400 text-[11px] tracking-widest uppercase font-body">{grouped[cat].length} services</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {grouped[cat].map((service, i) => (
                        <ServiceCard key={service.id} service={service} index={i} inView={true} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} inView={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <p className="text-charcoal-400 font-body text-sm">No services found in this category.</p>
              <button onClick={() => setActiveCategory('all')} className="btn-outline inline-flex items-center gap-2 font-body">View All Services</button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-charcoal-900">
        <div className="absolute inset-0 opacity-[0.07]">
          <img src="https://images.pexels.com/photos/323552/pexels-photo-323552.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center relative z-10 space-y-6">
          <h2 className="text-3xl md:text-4xl font-light font-display text-white tracking-tight">Ready to Get Started?</h2>
          <p className="text-white/50 font-body text-sm max-w-md mx-auto">Get a free, no-obligation quote for your project today.</p>
          <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-800 hover:bg-navy-900 text-white font-medium text-[11px] tracking-[0.2em] uppercase transition-all duration-300 font-body">
            Get Free Quote <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service, index, inView }: { service: Service; index: number; inView: boolean }) {
  return (
    <div className={`group bg-white rounded-2xl border border-charcoal-100 overflow-hidden hover-lift p-6 md:p-8 ${inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 60}ms` }}>
      <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden mb-5 border-2 border-charcoal-200 group-hover:border-navy-800 transition-colors duration-300 bg-white">
        <img src={`/services images/${service.name}.webp`} alt={service.name} className="absolute inset-0 w-full h-full object-cover object-center scale-[1.35]" />
      </div>
      {service.featured && (
        <span className="inline-block px-2 py-0.5 bg-gold-50 text-gold-700 text-[9px] tracking-widest uppercase font-body font-medium mb-3">Featured</span>
      )}
      <h3 className="text-xl font-medium font-display mb-1 tracking-tight group-hover:text-navy-900 transition-colors duration-300">{service.name}</h3>
      <p className="text-charcoal-500 text-sm leading-relaxed font-body mb-4">{service.description}</p>
      <Link to="/contact" className="text-navy-800 font-medium text-[11px] tracking-widest uppercase font-body inline-flex items-center gap-1.5 hover:gap-2.5 transition-all duration-300">
        Learn More <ArrowRight size={11} />
      </Link>
    </div>
  );
}
