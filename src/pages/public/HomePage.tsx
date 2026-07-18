import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ChevronRight, ChevronDown, Shield, FileText, Award,
  Building, MapPin, Users, Package, Eye, Clock, Receipt, Smile,
  Phone, Hammer, Star, CheckCircle2, TreePine, Layers, Bath, Home,
  DoorOpen, Droplets, Wrench,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Service { id: string; name: string; description: string; category: string; slug: string; }
interface Project { id: string; title: string; category: string; description: string; location: string; cover_image_path: string | null; }
interface Testimonial { id: string; client_name: string; review_text: string; rating: number; customer_photo_path: string | null; service_used: string | null; }
interface JournalEntry { id: string; title: string; slug: string; category: string; excerpt: string; featured_image_path: string | null; content: string; }
interface TrustItem { id: string; label: string; icon: string; }
interface WhyChooseItem { id: string; title: string; description: string; icon: string; }

function useCountUp(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setCount(Math.floor(start + (end - start) * e));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, start]);
  return { count, ref };
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const trustIcons: Record<string, React.ElementType> = {
  'shield': Shield, 'file-text': FileText, 'award': Award,
  'building': Building, 'map-pin': MapPin,
};

const whyIcons: Record<string, React.ElementType> = {
  'users': Users, 'package': Package, 'eye': Eye, 'clock': Clock,
  'receipt': Receipt, 'smile': Smile,
};

const serviceIconMap: Record<string, React.ElementType> = {
  'Outdoor Improvements': TreePine, 'Tiling': Layers, 'Bathrooms': Bath,
  'Kitchens': Home, 'Flooring': Layers, 'Doors & Windows': DoorOpen,
  'Home Renovation': Hammer, 'Plumbing': Droplets, 'Property Maintenance': Wrench,
};

const fallbackProjectImages = [
  'https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/279607/pexels-photo-279607.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [trustItems, setTrustItems] = useState<TrustItem[]>([]);
  const [whyChooseItems, setWhyChooseItems] = useState<WhyChooseItem[]>([]);

  const s1 = useCountUp(15, 2000);
  const s2 = useCountUp(500, 2000);
  const s3 = useCountUp(98, 2000);

  const aboutView = useInView();
  const servicesView = useInView();
  const whyView = useInView();
  const portfolioView = useInView();
  const journalView = useInView();

  useEffect(() => {
    const load = async () => {
      const [sr, pr, jr, tt, wc] = await Promise.all([
        supabase.from('services').select('*').eq('published', true).order('display_order').limit(8),
        supabase.from('projects').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(4),
        supabase.from('garden_journal').select('*').eq('published', true).order('published_at', { ascending: false }).limit(3),
        supabase.from('trust_items').select('*').eq('published', true).order('display_order'),
        supabase.from('why_choose_us').select('*').eq('published', true).order('display_order'),
      ]);
      setServices(sr.data as Service[] || []);
      setProjects(pr.data as Project[] || []);
      setJournalEntries(jr.data as JournalEntry[] || []);
      setTrustItems(tt.data as TrustItem[] || []);
      setWhyChooseItems(wc.data as WhyChooseItem[] || []);
    };
    load();
  }, []);

  const defaultTrust = [
    { id: '1', label: 'Fully Insured', icon: 'shield' },
    { id: '2', label: 'Free Quotes', icon: 'file-text' },
    { id: '3', label: 'Professional Workmanship', icon: 'award' },
    { id: '4', label: 'Residential & Commercial', icon: 'building' },
    { id: '5', label: 'Serving Cambridgeshire', icon: 'map-pin' },
  ];
  const trust = trustItems.length > 0 ? trustItems : defaultTrust;

  const defaultWhy = [
    { id: '1', title: 'Experienced Team', description: 'Our skilled tradespeople have years of hands-on experience across every type of building project.', icon: 'users' },
    { id: '2', title: 'High Quality Workmanship', description: 'We source premium materials and execute every detail with precision for long-lasting results.', icon: 'package' },
    { id: '3', title: 'Attention to Detail', description: 'Every cut, every tile, every finish is executed with precision and care for a flawless result.', icon: 'eye' },
    { id: '4', title: 'Reliable Service', description: 'We turn up on time, stick to our schedule, and communicate clearly throughout your project.', icon: 'clock' },
    { id: '5', title: 'Transparent Pricing', description: 'Clear, detailed quotes with no hidden costs. You know exactly what you are paying for.', icon: 'receipt' },
    { id: '6', title: 'Customer Satisfaction', description: 'Our reputation is built on happy customers. We do not finish until you are delighted.', icon: 'smile' },
  ];
  const whyItems = whyChooseItems.length > 0 ? whyChooseItems : defaultWhy;

  const steps = [
    { icon: Phone, title: 'Get in Touch', desc: 'Call us or request a free quote online' },
    { icon: Eye, title: 'Site Visit', desc: 'We assess your project and discuss your needs' },
    { icon: FileText, title: 'Free Quote', desc: 'A detailed, transparent quote with no obligation' },
    { icon: Hammer, title: 'Expert Build', desc: 'Our skilled team delivers exceptional workmanship' },
    { icon: CheckCircle2, title: 'Final Reveal', desc: 'Your completed project, finished to perfection' },
  ];

  return (
    <div className="bg-cream-50">
      <Helmet>
        <title>Cambridgeshire Building Services | Premium Home Renovations</title>
        <meta name="description" content="Expert building, renovations, kitchen & bathroom installations, and property maintenance across Cambridgeshire. Get a free quote today." />
        <meta property="og:title" content="Cambridgeshire Building Services | Premium Home Renovations" />
        <meta property="og:description" content="Expert building, renovations, kitchen & bathroom installations, and property maintenance across Cambridgeshire." />
      </Helmet>
      {/* ===== HERO ===== */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/home.webp"
            alt="Luxury renovated kitchen interior with marble flooring and premium finishes"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-charcoal-900/40" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 pb-20 md:pb-28 pt-40">
          <div className="max-w-3xl space-y-8">
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-[10px] tracking-[0.25em] uppercase font-body">
                Cambridgeshire Building Services
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light font-display text-white leading-[1.1] tracking-tight animate-reveal-up" style={{ animationDelay: '200ms' }}>
              Building, Renovating<br />& Improving Homes<br />Across Cambridgeshire
            </h1>

            <p className="text-white/70 text-base md:text-lg leading-relaxed font-body max-w-xl animate-reveal-up" style={{ animationDelay: '400ms' }}>
              Professional building, renovation, home improvement and property maintenance services delivered with exceptional workmanship across Cambridgeshire.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 pt-2 animate-reveal-up" style={{ animationDelay: '600ms' }}>
              <Link to="/contact" className="px-8 py-3.5 bg-navy-800 hover:bg-navy-900 text-white font-medium text-[11px] tracking-[0.2em] uppercase hover:shadow-lg transition-all duration-300 font-body inline-flex items-center gap-2">
                Get Free Quote <ArrowRight size={14} />
              </Link>
              <Link to="/portfolio" className="px-8 py-3.5 bg-transparent text-white/80 font-medium text-[11px] tracking-[0.2em] uppercase border border-white/25 hover:border-white/50 hover:text-white transition-all duration-300 font-body inline-flex items-center gap-2">
                View Our Projects <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={18} className="text-white/30" />
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section ref={servicesView.ref} className="section-padding bg-cream-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 md:mb-20">
            <div className="lg:col-span-4 space-y-4">
              <span className="badge-navy">Our Services</span>
              <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight leading-tight">
                Complete Building<br />Solutions
              </h2>
            </div>
            <div className="lg:col-span-8 flex items-end">
              <p className="text-charcoal-500 text-base leading-relaxed font-body max-w-lg">
                From kitchens and bathrooms to tiling, flooring, driveways and complete property improvements — we offer a full range of professional building services delivered to the highest standard.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-charcoal-200/50">
            {services.map((service, i) => {
              return (
                <div key={service.id} className={`group bg-cream-50 p-8 md:p-10 hover:bg-white transition-all duration-500 ${servicesView.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden mb-6 border-2 border-charcoal-200 group-hover:border-navy-800 transition-colors duration-300 bg-white">
                    <img src={`/services images/${service.name}.webp`} alt={service.name} className="absolute inset-0 w-full h-full object-cover object-center scale-125" />
                  </div>
                  <h3 className="text-xl font-medium font-display mb-3 tracking-tight group-hover:text-navy-900 transition-colors duration-300">
                    <Link to="/services" className="hover:underline">{service.name}</Link>
                  </h3>
                  <p className="text-charcoal-400 text-sm leading-relaxed font-body">{service.description}</p>
                  <Link to="/services" className="inline-flex items-center gap-1.5 text-charcoal-900 text-[11px] tracking-widest uppercase font-medium mt-6 font-body hover:gap-2.5 transition-all duration-300">
                    Learn More <ArrowRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Link to="/services" className="btn-outline inline-flex items-center gap-2 font-body">View All Services <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* ===== PORTFOLIO ===== */}
      <section ref={portfolioView.ref} className="section-padding bg-cream-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
            <div className="space-y-4">
              <span className="badge-navy">Projects</span>
              <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight">
                Selected Work
              </h2>
            </div>
            <Link to="/portfolio" className="btn-outline inline-flex items-center gap-2 font-body self-start md:self-auto">View All <ArrowRight size={14} /></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {projects.length > 0 ? projects.map((p, i) => (
              <Link to="/portfolio" key={p.id} className={`group block ${portfolioView.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="garden-image h-72 md:h-96 mb-5 overflow-hidden">
                  <img src={p.cover_image_path ? supabase.storage.from('media').getPublicUrl(p.cover_image_path).data.publicUrl : fallbackProjectImages[i % 4]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <span className="badge-cream text-[10px]">{p.category}</span>
                <h3 className="text-xl font-light font-display mt-3 tracking-tight group-hover:text-navy-900 transition-colors duration-300">{p.title}</h3>
                {p.location && <p className="text-charcoal-400 text-xs mt-1 font-body tracking-wider uppercase">{p.location}</p>}
                <p className="text-charcoal-400 text-sm mt-2 line-clamp-2 font-body leading-relaxed">{p.description}</p>
              </Link>
            )) : (
              <p className="text-charcoal-400 font-body text-sm col-span-2 text-center py-12">Projects coming soon. Check back shortly.</p>
            )}
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-white border-y border-charcoal-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-3 divide-x divide-charcoal-200/50">
            <div ref={s1.ref} className="text-center py-10 md:py-14">
              <div className="text-3xl md:text-5xl font-light font-display text-charcoal-900 tracking-tight">{s1.count}+</div>
              <p className="text-charcoal-400 font-body text-[11px] tracking-widest uppercase mt-2">Years Experience</p>
            </div>
            <div ref={s2.ref} className="text-center py-10 md:py-14">
              <div className="text-3xl md:text-5xl font-light font-display text-charcoal-900 tracking-tight">{s2.count}+</div>
              <p className="text-charcoal-400 font-body text-[11px] tracking-widest uppercase mt-2">Projects Completed</p>
            </div>
            <div ref={s3.ref} className="text-center py-10 md:py-14">
              <div className="text-3xl md:text-5xl font-light font-display text-charcoal-900 tracking-tight">{s3.count}%</div>
              <p className="text-charcoal-400 font-body text-[11px] tracking-widest uppercase mt-2">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section ref={aboutView.ref} className="section-padding bg-cream-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className={`space-y-6 ${aboutView.inView ? 'animate-reveal-up' : 'opacity-0'}`}>
              <span className="badge-navy">About Us</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-display tracking-tight leading-[1.15]">
                Your Trusted Building<br />Services Company
              </h2>
              <p className="text-charcoal-500 text-base leading-relaxed font-body">
                Cambridgeshire Building Services is a professional building company providing high-quality renovation, installation and maintenance services throughout Cambridgeshire. From complete kitchen and bathroom renovations to tiling, flooring, doors, windows, driveways and landscaping, our experienced team delivers exceptional workmanship on every project.
              </p>
              <p className="text-charcoal-500 text-base leading-relaxed font-body">
                We work with residential and commercial clients, combining traditional craftsmanship with modern techniques to transform properties across the region. No job is too big or too small — we bring the same care and attention to every project.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                <Link to="/about" className="btn-outline inline-flex items-center gap-2 font-body">Learn More About Us <ArrowRight size={14} /></Link>
                <Link to="/contact" className="text-navy-800 font-medium text-sm font-body hover:text-navy-900 transition-colors inline-flex items-center gap-1.5">Get Free Quote <ArrowRight size={14} /></Link>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${aboutView.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
              <div className="space-y-4">
                <div className="overflow-hidden h-64">
                  <img src="https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Kitchen renovation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="overflow-hidden h-40">
                  <img src="https://images.pexels.com/photos/279607/pexels-photo-279607.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Floor tiling" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="overflow-hidden h-40">
                  <img src="https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Bathroom renovation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="overflow-hidden h-64">
                  <img src="/two images/pro2.webp" alt="Patio installation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="relative py-28 md:py-36 overflow-hidden bg-charcoal-900">
        <div className="absolute inset-0 opacity-[0.07]">
          <img src="https://images.pexels.com/photos/1084540/pexels-photo-1084540.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-4xl mx-auto px-6 md:px-10 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 bg-white/8 border border-white/10 text-white/50 text-[10px] tracking-[0.25em] uppercase font-body mb-8">Our Process</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-display text-white tracking-tight mb-6">
            From Quote to Completion
          </h2>
          <p className="text-charcoal-400 text-base max-w-xl mx-auto mb-14 font-body leading-relaxed">
            Our straightforward process ensures every project runs smoothly, from your first enquiry to the final handover.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/5 mb-14">
            {steps.map((step, i) => (
              <div key={i} className="bg-charcoal-900 p-6 md:p-8 text-center group hover:bg-charcoal-800 transition-colors duration-500">
                <step.icon size={20} className="text-charcoal-500 mx-auto mb-3 group-hover:text-gold-400 transition-colors duration-500" />
                <p className="text-white/70 text-[11px] tracking-widest uppercase font-body font-medium">{step.title}</p>
              </div>
            ))}
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-800 hover:bg-navy-900 text-white font-medium text-[11px] tracking-[0.2em] uppercase transition-all duration-300 font-body">
            Get Free Quote <ArrowRight size={14} />
          </Link>
        </div>
      </section>



      {/* ===== JOURNAL ===== */}
      <section ref={journalView.ref} className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
            <div className="space-y-4">
              <span className="badge-cream">Journal</span>
              <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight">
                Inspiration & Ideas
              </h2>
            </div>
            <Link to="/journal" className="btn-outline inline-flex items-center gap-2 font-body self-start md:self-auto">View All <ArrowRight size={14} /></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(journalEntries.length > 0 ? journalEntries : [
              { id: '1', title: 'Kitchen Renovation Trends', category: 'Renovation', excerpt: 'Discover the latest kitchen design trends transforming homes across Cambridgeshire.', featured_image_path: null, slug: '', content: '' },
              { id: '2', title: 'Choosing the Right Flooring', category: 'Flooring', excerpt: 'A guide to selecting the perfect flooring material for every room in your home.', featured_image_path: null, slug: '', content: '' },
              { id: '3', title: 'Bathroom Design Ideas', category: 'Bathrooms', excerpt: 'Inspiration for creating a beautiful, functional bathroom that adds value to your home.', featured_image_path: null, slug: '', content: '' },
            ]).map((entry, i) => (
              <div key={entry.id} className={`group ${journalView.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="garden-image h-56 overflow-hidden mb-5">
                  <img src={entry.featured_image_path ? supabase.storage.from('media').getPublicUrl(entry.featured_image_path).data.publicUrl : `https://images.pexels.com/photos/${[2724749, 279607, 6585757][i % 3]}/pexels-photo-${[2724749, 279607, 6585757][i % 3]}.jpeg?auto=compress&cs=tinysrgb&w=600`} alt={entry.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <span className="badge-cream text-[10px]">{entry.category}</span>
                <h3 className="text-lg font-light font-display mt-3 mb-2 tracking-tight group-hover:text-navy-900 transition-colors duration-300">{entry.title}</h3>
                <p className="text-charcoal-400 text-sm line-clamp-2 font-body leading-relaxed">{entry.excerpt || entry.content}</p>
                <Link to="/journal" className="inline-flex items-center gap-1.5 text-charcoal-900 text-[11px] tracking-widest uppercase font-medium mt-4 font-body hover:gap-2.5 transition-all duration-300">
                  Read More <ArrowRight size={11} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section ref={whyView.ref} className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16 md:mb-20 space-y-4">
            <span className="badge-stone">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight">
              The Cambridgeshire Difference
            </h2>
            <p className="text-charcoal-400 max-w-md mx-auto font-body text-sm">
              We combine skilled craftsmanship, quality materials and reliable service to deliver results you can trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-charcoal-200/40">
            {whyItems.map((item, i) => {
              const Icon = whyIcons[item.icon] || CheckCircle2;
              return (
                <div key={item.id || i} className={`bg-white p-10 md:p-12 ${whyView.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-navy-800" />
                  </div>
                  <h3 className="text-lg font-medium font-display mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-charcoal-400 text-sm leading-relaxed font-body">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/two images/pro.webp" alt="Building services" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-900/60" />
        </div>
        <div className="max-w-4xl mx-auto px-6 md:px-10 text-center relative z-10 space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-display text-white tracking-tight leading-tight">
            Ready to Start Your<br />Next Project?
          </h2>
          <p className="text-white/50 text-base max-w-md mx-auto font-body leading-relaxed">
            Get a free, no-obligation quote today. Call us or fill out our simple form and we will get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/contact" className="px-8 py-3.5 bg-navy-800 hover:bg-navy-900 text-white font-medium text-[11px] tracking-[0.2em] uppercase transition-all duration-300 font-body inline-flex items-center gap-2">
              Get Free Quote <ArrowRight size={14} />
            </Link>
            <a href="tel:+447383608438" className="px-8 py-3.5 bg-transparent text-white/70 font-medium text-[11px] tracking-[0.2em] uppercase border border-white/20 hover:border-white/40 hover:text-white transition-all duration-300 font-body inline-flex items-center gap-2">
              <Phone size={14} /> +44 7383 608438
            </a>
          </div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="bg-white border-b border-charcoal-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {trust.map((item, i) => {
              const Icon = trustIcons[item.icon] || Shield;
              return (
                <div key={item.id || i} className="flex flex-col items-center text-center gap-3 animate-reveal-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-11 h-11 rounded-full bg-navy-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-navy-800" />
                  </div>
                  <span className="text-charcoal-700 text-[11px] tracking-widest uppercase font-body font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
