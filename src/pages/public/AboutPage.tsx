import { useRef, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Users, Package, Eye, Clock, Receipt, Smile,
  Shield, FileText, Award, Building, MapPin, Phone,
} from 'lucide-react';

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

const trustItems = [
  { icon: Shield, label: 'Fully Insured' },
  { icon: FileText, label: 'Free Quotes' },
  { icon: Award, label: 'Professional Workmanship' },
  { icon: Building, label: 'Residential & Commercial' },
  { icon: MapPin, label: 'Serving Cambridgeshire' },
];

const whyItems = [
  { icon: Users, title: 'Experienced Team', desc: 'Our skilled tradespeople have years of hands-on experience across every type of building project.' },
  { icon: Package, title: 'High Quality Workmanship', desc: 'We source premium materials and execute every detail with precision for long-lasting, beautiful results.' },
  { icon: Eye, title: 'Attention to Detail', desc: 'Every cut, every tile, every finish is executed with precision and care for a flawless result.' },
  { icon: Clock, title: 'Reliable Service', desc: 'We turn up on time, stick to our schedule, and communicate clearly throughout your project.' },
  { icon: Receipt, title: 'Transparent Pricing', desc: 'Clear, detailed quotes with no hidden costs. You know exactly what you are paying for.' },
  { icon: Smile, title: 'Customer Satisfaction', desc: 'Our reputation is built on happy customers. We do not finish until you are delighted.' },
];

export function AboutPage() {
  const a = useInView();
  const b = useInView();
  const c = useInView();

  return (
    <div className="bg-cream-50">
      <Helmet>
        <title>About Us | Cambridgeshire Building Services</title>
        <meta name="description" content="Learn more about our experienced team of builders, our core values, and why we are Cambridgeshire's premier choice for home improvements." />
      </Helmet>
      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="About us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-900/45" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 text-center space-y-5 pt-20">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-[10px] tracking-[0.25em] uppercase font-body">About Us</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light font-display text-white tracking-tight">Cambridgeshire Building Services</h1>
          <p className="text-white/70 text-base max-w-xl mx-auto font-body leading-relaxed">Building, renovating and improving homes across Cambridgeshire</p>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-charcoal-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
            {trustItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 animate-reveal-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-11 h-11 rounded-full bg-navy-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-navy-800" />
                </div>
                <span className="text-charcoal-700 text-[11px] tracking-widest uppercase font-body font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main About */}
      <section ref={a.ref} className="section-padding">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className={`space-y-6 ${a.inView ? 'animate-reveal-up' : 'opacity-0'}`}>
              <span className="badge-navy">Our Story</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-display tracking-tight leading-[1.15]">
                Professional Building Services<br />You Can Trust
              </h2>
              <p className="text-charcoal-500 text-base leading-relaxed font-body">
                Cambridgeshire Building Services is a professional building company providing high-quality renovation, installation and maintenance services throughout Cambridgeshire. From complete kitchen and bathroom renovations to tiling, flooring, doors, windows, driveways and landscaping, our experienced team delivers exceptional workmanship on every project.
              </p>
              <p className="text-charcoal-500 text-base leading-relaxed font-body">
                We work with residential and commercial clients, combining traditional craftsmanship with modern techniques to transform properties across the region. No job is too big or too small — we bring the same care and attention to every project, whether it is a full property renovation or a single room transformation.
              </p>
              <p className="text-charcoal-500 text-base leading-relaxed font-body">
                Our team is fully insured and trained to the highest standards. We pride ourselves on clear communication, transparent pricing and reliable service from start to finish.
              </p>
            </div>
            <div className={`grid grid-cols-2 gap-4 ${a.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
              <div className="space-y-4">
                <div className="overflow-hidden h-64"><img src="https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Kitchen" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></div>
                <div className="overflow-hidden h-40"><img src="https://images.pexels.com/photos/279607/pexels-photo-279607.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Tiling" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="overflow-hidden h-40"><img src="https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Bathroom" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></div>
                <div className="overflow-hidden h-64"><img src="https://images.pexels.com/photos/1072824/pexels-photo-1072824.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Patio" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-charcoal-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-3 divide-x divide-charcoal-200/50">
          {[
            { num: '15+', label: 'Years Experience' },
            { num: '500+', label: 'Projects Completed' },
            { num: '98%', label: 'Client Satisfaction' },
          ].map((s, i) => (
            <div key={i} className="text-center py-10 md:py-14">
              <div className="text-3xl md:text-5xl font-light font-display text-charcoal-900 tracking-tight">{s.num}</div>
              <p className="text-charcoal-400 font-body text-[11px] tracking-widest uppercase mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section ref={b.ref} className="section-padding">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-16 space-y-4">
            <span className="badge-stone">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-light font-display tracking-tight">The Cambridgeshire Difference</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-charcoal-200/40">
            {whyItems.map((item, i) => (
              <div key={i} className={`bg-cream-50 p-10 md:p-12 ${b.inView ? 'animate-reveal-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-full bg-navy-50 flex items-center justify-center mb-5">
                  <item.icon className="w-5 h-5 text-navy-800" />
                </div>
                <h3 className="text-lg font-medium font-display mb-3 tracking-tight">{item.title}</h3>
                <p className="text-charcoal-400 text-sm leading-relaxed font-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={c.ref} className="relative py-24 md:py-32 overflow-hidden bg-charcoal-900">
        <div className="absolute inset-0 opacity-[0.07]">
          <img src="https://images.pexels.com/photos/323552/pexels-photo-323552.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-3xl mx-auto px-6 md:px-10 text-center relative z-10 space-y-6">
          <h2 className="text-3xl md:text-4xl font-light font-display text-white tracking-tight">Let's Build Something Together</h2>
          <p className="text-white/50 font-body text-sm max-w-md mx-auto">Get a free, no-obligation quote for your project today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-800 hover:bg-navy-900 text-white font-medium text-[11px] tracking-[0.2em] uppercase transition-all duration-300 font-body">
              Get Free Quote <ArrowRight size={14} />
            </Link>
            <a href="tel:07814584119" className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent text-white/70 font-medium text-[11px] tracking-[0.2em] uppercase border border-white/20 hover:border-white/40 hover:text-white transition-all duration-300 font-body">
              <Phone size={14} /> 07814 584 119
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
