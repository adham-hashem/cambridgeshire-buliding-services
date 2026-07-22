import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail as MailIcon, MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SiteSettings {
  company_name: string;
  phone: string;
  email: string;
  address: string;
  business_hours: string;
  social_facebook: string | null;
  social_instagram: string | null;
  social_youtube: string | null;
}

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    supabase.from('site_settings').select('*').limit(1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data as SiteSettings);
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Projects', href: '/portfolio' },
    { label: 'About Us', href: '/about' },
    { label: 'Journal', href: '/journal' },
    { label: 'Contact', href: '/contact' },
  ];

  const announcementMessages = [
  'From small repairs to complete home renovations.',
  'Specialists in tiling, flooring & wooden fencing.',
  'No project is too small or too large.',
  'Free quotations with no obligation.',
];

const phone = settings?.phone || '+44 7383 608438';
  const email = settings?.email || 'cambridgeshirebuildingservices@gmail.com';
  const address = settings?.address || 'Cambridge, UK';
  const companyName = settings?.company_name || 'Cambridgeshire Building Services';
  const hours = settings?.business_hours || 'Mon–Fri: 7:30am – 6:00pm, Sat: 8:00am – 2:00pm';

  return (
    <div className="bg-cream-50 min-h-screen flex flex-col">
      {/* Top Bar removed by user request */}

      {/* Main Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg border-b border-charcoal-200/60 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]'
            : 'bg-cream-50/80 backdrop-blur-md border-b border-charcoal-200/30'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-20 md:h-[90px]">
          {/* Logo */}
          <Link to="/" className="flex items-center group relative z-10">
            <img
              src="/logo-transparent.webp"
              alt={companyName}
              width={330}
              height={280}
              fetchPriority="high"
              className="h-20 md:h-24 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-[12px] tracking-widest uppercase font-medium transition-colors duration-300 font-body group ${
                  isActive(link.href)
                    ? 'text-charcoal-900'
                    : 'text-charcoal-500 hover:text-charcoal-900'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-4 right-4 h-px bg-gold-500 transition-all duration-300 ${isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} style={{ transformOrigin: 'left' }} />
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/contact"
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-navy-800 hover:bg-gold-500 text-white text-[11px] tracking-widest uppercase font-medium transition-all duration-300 font-body"
          >
            Get Free Quote
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} className="text-charcoal-900" /> : <Menu size={20} className="text-charcoal-900" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-charcoal-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-4 py-3 text-[12px] tracking-widest uppercase font-medium font-body transition-colors ${
                    isActive(link.href) ? 'text-charcoal-900 bg-cream-100' : 'text-charcoal-500 hover:text-charcoal-900 hover:bg-cream-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-charcoal-100 mt-2">
                <Link to="/contact" className="block text-center px-5 py-3 bg-navy-800 hover:bg-gold-500 text-white text-[11px] tracking-widest uppercase font-medium font-body transition-all duration-300">
                  Get Free Quote
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Ticker */}
        <div className="relative overflow-hidden bg-navy-800 border-t border-navy-700/50">
          <div className="flex whitespace-nowrap w-max animate-marquee hover:[animation-play-state:paused]">
            {[...announcementMessages, ...announcementMessages].map((msg, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-8 py-2 text-[11px] tracking-[0.2em] uppercase font-body font-medium text-cream-100/90">
                <span className="text-gold-400 text-[8px]">◆</span>
                {msg}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-charcoal-900 text-charcoal-300">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-4 space-y-6">
              <Link to="/" className="inline-block">
                <img
                  src="/logo-transparent.webp"
                  alt={companyName}
                  width={330}
                  height={280}
                  loading="lazy"
                  className="h-16 w-auto brightness-0 invert opacity-80"
                />
              </Link>
              <p className="text-charcoal-400 text-sm leading-relaxed font-body max-w-xs">
                Professional building, renovation, and property improvement services. From kitchens and bathrooms to tiling, flooring, driveways and landscaping — we deliver exceptional workmanship across Cambridgeshire.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-charcoal-700 hover:border-charcoal-500 hover:text-white transition-all duration-300" aria-label="Visit our Instagram page">
                  <Instagram size={14} />
                </a>
                <a href={settings?.social_facebook || "https://www.facebook.com/share/1EFQ3AFoBn"} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-charcoal-700 hover:border-charcoal-500 hover:text-white transition-all duration-300" aria-label="Visit our Facebook page">
                  <Facebook size={14} />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div className="lg:col-span-2 space-y-5">
              <p className="text-white text-[11px] tracking-widest uppercase font-semibold font-body">Navigation</p>
              <div className="space-y-3">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="block text-charcoal-400 hover:text-white text-sm font-body transition-colors duration-300 font-medium">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="lg:col-span-3 space-y-5">
              <p className="text-white text-[11px] tracking-widest uppercase font-semibold font-body">Services</p>
              <div className="space-y-3">
                {['Kitchen Renovations', 'Bathroom Renovations', 'Tiling & Flooring', 'Doors & Windows', 'Driveways & Patios', 'Property Maintenance'].map((s) => (
                  <Link key={s} to="/services" className="block text-charcoal-400 hover:text-white text-sm font-body transition-colors duration-300 font-medium">{s}</Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3 space-y-5">
              <p className="text-white text-[11px] tracking-widest uppercase font-semibold font-body">Get in Touch</p>
              <div className="space-y-3">
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 text-charcoal-400 hover:text-white text-sm font-body transition-colors duration-300">
                  <Phone size={13} className="flex-shrink-0" /> {phone}
                </a>
                {email && (
                  <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-charcoal-400 hover:text-white text-sm font-body transition-colors duration-300">
                    <MailIcon size={13} className="flex-shrink-0" /> {email}
                  </a>
                )}
                <div className="flex items-start gap-2.5 text-charcoal-400 text-sm font-body">
                  <MapPin size={13} className="flex-shrink-0 mt-0.5" /> {address}
                </div>
                <div className="flex items-start gap-2.5 text-charcoal-400 text-sm font-body">
                  <Clock size={13} className="flex-shrink-0 mt-0.5" /> {hours}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-charcoal-800">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-charcoal-400 text-[11px] tracking-wider font-body">&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
            <div className="flex items-center gap-6 text-[11px] tracking-wider text-charcoal-400 font-body">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating CTA - mobile only */}
      <Link
        to="/contact"
        className="fixed bottom-5 right-5 z-40 lg:hidden p-3.5 bg-navy-800 hover:bg-gold-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        title="Get Free Quote"
      >
        <Phone size={20} />
      </Link>
    </div>
  );
}
