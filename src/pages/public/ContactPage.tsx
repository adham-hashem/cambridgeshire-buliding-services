import { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Send, Phone, Mail as MailIcon, MapPin, Clock,
  ChevronRight, Upload, X, Check, AlertCircle,
} from 'lucide-react';

const ALL_SERVICES = [
  'Natural Turf Installation',
  'Artificial Grass Installation',
  'Patio Installation',
  'Tile Installation',
  'Floor Tiling',
  'Wall Tiling',
  'Bathroom Renovations',
  'Kitchen Renovations',
  'Kitchen Design & Installation',
  'Interior House Painting',
  'Wallpaper Installation',
  'Internal Door Installation',
  'External Door Installation',
  'Door Frame Installation',
  'uPVC Window Installation',
  'Vinyl Flooring Installation',
  'Parquet Flooring Installation',
  'Carpet Installation',
  'Skirting Board Installation',
  'Wooden Fence Installation',
  'Block Paving Installation',
  'Driveway Installation',
  'Water Leak Repairs',
  'Toilet Installation',
  'Wash Basin Installation',
  'Bathtub Installation',
  'Garage Conversion',
  'Property Maintenance & Repairs Before Sale or Letting',
];

const BUDGET_OPTIONS = [
  'Under £1,000',
  '£1,000 – £5,000',
  '£5,000 – £10,000',
  '£10,000 – £20,000',
  '£20,000+',
  'Custom Budget',
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function uploadAttachment(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const filename = `consultations/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('consultations').upload(filename, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  return filename;
}

interface FormData {
  full_name: string;
  phone: string;
  email: string;
  service_required: string;
  budget: string;
  custom_budget: string;
  message: string;
}

const emptyForm: FormData = {
  full_name: '',
  phone: '',
  email: '',
  service_required: '',
  budget: '',
  custom_budget: '',
  message: '',
};

export function ContactPage() {
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof FormData, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrorMsg('');
  };

  const validateFiles = (newFiles: File[]): File[] => {
    const valid: File[] = [];
    const errors: string[] = [];
    for (const f of newFiles) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        errors.push(`${f.name}: Invalid format. Accepted: JPG, PNG, WEBP, PDF`);
      } else if (f.size > MAX_FILE_SIZE) {
        errors.push(`${f.name}: Exceeds 10MB limit`);
      } else {
        valid.push(f);
      }
    }
    setFileErrors(errors);
    return valid;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    const valid = validateFiles(newFiles);
    setFiles((prev) => [...prev, ...valid]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const valid = validateFiles(newFiles);
      setFiles((prev) => [...prev, ...valid]);
      e.target.value = '';
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setFileErrors([]);
  };

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!formData.full_name.trim() || !formData.phone.trim() || !formData.service_required || !formData.budget) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      let attachmentPaths: string[] = [];
      if (files.length > 0) {
        attachmentPaths = await Promise.all(files.map((f) => uploadAttachment(f)));
      }

      const { error } = await supabase.from('quote_requests').insert({
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        service_required: formData.service_required,
        budget: formData.budget,
        custom_budget: formData.budget === 'Custom Budget' ? formData.custom_budget.trim() || null : null,
        message: formData.message.trim() || null,
        attachment_paths: attachmentPaths.length > 0 ? attachmentPaths : null,
        status: 'new',
      });

      if (error) throw error;

      // Send Telegram notification
      try {
        const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        const chatId = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID;
        
        if (token && chatId) {
          const messageText = formData.message ? formData.message.trim() : 'None';
          const actualBudget = formData.budget === 'Custom Budget' && formData.custom_budget ? formData.custom_budget : formData.budget;
          
          const text = [
            '🔔 New Quote Request! 🔔',
            '',
            '👤 Name: ' + formData.full_name,
            '📞 Phone: ' + formData.phone,
            '✉️ Email: ' + (formData.email || 'Not Provided'),
            '',
            '🛠 Service: ' + formData.service_required,
            '💰 Budget: ' + actualBudget,
            '',
            '📝 Project Description:',
            messageText,
            '',
            '📅 Submitted at: ' + new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }) + ' (UK Time)',
          ].join('\n');

          const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: text,
            }),
          });
          const tgData = await tgRes.json();
          if (!tgData.ok) {
            console.error('Telegram API error:', tgData);
          }
        } else {
          console.warn('Telegram credentials not found in env');
        }
      } catch (err) {
        console.error('Failed to send telegram notification:', err);
      }

      setFormData(emptyForm);
      setFiles([]);
      setFileErrors([]);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit:', error);
      setErrorMsg('Something went wrong. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-cream-50 min-h-screen">
        <div className="min-h-[60vh] flex items-center justify-center pt-16 pb-16">
          <div className="max-w-lg px-5 w-full space-y-8">
            <div className="text-center space-y-5 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mx-auto border border-navy-200">
                <Check className="w-10 h-10 text-navy-800" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-display">Thank You for Your Quote Request</h2>
              <p className="text-charcoal-500 font-body leading-relaxed">We have received your request and will contact you within 24 hours to discuss your project and arrange a site visit if needed.</p>
              <div className="pt-2 space-y-3">
                <a href="tel:+447383608438" className="btn-primary inline-flex items-center gap-2 font-body text-sm px-6 py-3.5">
                  <Phone size={18} /> +44 7383 608438
                </a>
                <p className="text-charcoal-400 text-xs font-body">Call us directly if you need an immediate response</p>
              </div>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <button onClick={() => setSubmitted(false)} className="text-navy-800 text-sm font-medium font-body hover:underline">
                Submit another request
              </button>
              <span className="text-charcoal-300 mx-2">|</span>
              <Link to="/" className="text-navy-800 text-sm font-medium font-body hover:underline">Return to Homepage</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 min-h-screen">
      <Helmet>
        <title>Contact Us & Get a Quote | Cambridgeshire Building Services</title>
        <meta name="description" content="Get in touch with Cambridgeshire Building Services for a free, no-obligation quote on your next home improvement, renovation, or building project." />
      </Helmet>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/two images/pro.webp" alt="Get a quote" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/50 via-charcoal-900/40 to-cream-50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 text-center space-y-4 pt-20 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-display text-white">Get Free Quote</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto font-body">A simple, fast way to get started on your building project</p>
        </div>
      </section>

      {/* Form + Contact Info */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-charcoal-100 shadow-sm p-7 md:p-10">
                <div className="space-y-1 mb-8">
                  <h2 className="text-xl font-bold font-display">Request Your Free Quote</h2>
                  <p className="text-charcoal-500 text-sm font-body">Fill in the form below and we'll get back to you within 24 hours</p>
                </div>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-charcoal-700 font-medium mb-1.5 text-sm font-body">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.full_name} onChange={(e) => update('full_name', e.target.value)} className="input-field" placeholder="John Smith" />
                  </div>

                  {/* Phone + Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-charcoal-700 font-medium mb-1.5 text-sm font-body">Phone Number <span className="text-red-500">*</span></label>
                      <input type="tel" value={formData.phone} onChange={(e) => update('phone', e.target.value)} className="input-field" placeholder="07XXX XXXXXX" />
                    </div>
                    <div>
                      <label className="block text-charcoal-700 font-medium mb-1.5 text-sm font-body">Email Address <span className="text-charcoal-400 text-xs font-normal">(Optional)</span></label>
                      <input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)} className="input-field" placeholder="john@example.com" />
                    </div>
                  </div>

                  {/* Service Required */}
                  <div>
                    <label className="block text-charcoal-700 font-medium mb-1.5 text-sm font-body">Select Service <span className="text-red-500">*</span></label>
                    <select value={formData.service_required} onChange={(e) => update('service_required', e.target.value)} className="input-field cursor-pointer">
                      <option value="">Choose a service...</option>
                      {ALL_SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-charcoal-700 font-medium mb-1.5 text-sm font-body">Budget <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      {BUDGET_OPTIONS.map((b) => {
                        const selected = formData.budget === b;
                        return (
                          <button key={b} type="button" onClick={() => update('budget', b)}
                            className={`px-4 py-3 rounded-xl text-sm font-medium font-body transition-all duration-200 border text-center ${
                              selected ? 'bg-navy-50 border-navy-300 text-navy-800 shadow-sm' : 'bg-cream-50 border-charcoal-200 text-charcoal-500 hover:border-navy-200'
                            }`}>
                            {b}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Budget Input */}
                  {formData.budget === 'Custom Budget' && (
                    <div className="animate-fade-in">
                      <label className="block text-charcoal-700 font-medium mb-1.5 text-sm font-body">Enter Your Budget</label>
                      <input type="text" value={formData.custom_budget} onChange={(e) => update('custom_budget', e.target.value)} className="input-field" placeholder="e.g. £3,500" />
                    </div>
                  )}

                  {/* Project Description */}
                  <div>
                    <label className="block text-charcoal-700 font-medium mb-1.5 text-sm font-body">Project Description <span className="text-charcoal-400 text-xs font-normal">(Optional)</span></label>
                    <textarea value={formData.message} onChange={(e) => update('message', e.target.value)}
                      className="textarea-field h-28" placeholder="Tell us about your project, any specific requirements, or ideas you have in mind..." />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-charcoal-700 font-medium mb-1.5 text-sm font-body">Upload Photos <span className="text-charcoal-400 text-xs font-normal">(Optional)</span></label>
                    <p className="text-charcoal-400 text-xs font-body mb-3">Share photos of the area or project. JPG, PNG, WEBP, PDF up to 10MB each.</p>
                    <div
                      onDragOver={(e) => { e.preventDefault(); }}
                      onDrop={handleDrop}
                      onClick={() => inputRef.current?.click()}
                      className="border-2 border-dashed border-charcoal-200 rounded-xl p-6 text-center cursor-pointer hover:border-navy-300 hover:bg-navy-50/20 transition-all duration-200">
                      <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleFileChange} className="hidden" />
                      <Upload className="w-7 h-7 text-charcoal-300 mx-auto mb-2" />
                      <p className="text-charcoal-600 text-sm font-medium font-body">Drop files here or click to upload</p>
                      <p className="text-charcoal-400 text-xs font-body mt-1">Multiple files allowed</p>
                    </div>

                    {/* File Errors */}
                    {fileErrors.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {fileErrors.map((err, i) => (
                          <p key={i} className="text-red-500 text-xs font-body flex items-center gap-1.5">
                            <AlertCircle size={12} /> {err}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Selected Files */}
                    {files.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {files.map((f, i) => (
                          <div key={i} className="relative group rounded-lg overflow-hidden border border-charcoal-100 bg-cream-50 p-2 flex items-center gap-2">
                            {f.type.startsWith('image/') ? (
                              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-16 object-cover rounded" />
                            ) : (
                              <div className="w-full h-16 flex items-center justify-center text-charcoal-400 text-xs font-body">{f.name.split('.').pop()?.toUpperCase()}</div>
                            )}
                            <button type="button" onClick={() => removeFile(i)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm font-body">
                      <AlertCircle size={16} /> {errorMsg}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button type="button" onClick={handleSubmit} disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2 font-body text-sm py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading ? 'Sending...' : 'Get Free Quote'} <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-charcoal-100 p-6 space-y-5">
                <h3 className="text-lg font-bold font-display">Contact Information</h3>
                <div className="space-y-4">
                  <a href="tel:+447383608438" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                      <Phone size={16} className="text-navy-800" />
                    </div>
                    <div>
                      <p className="text-charcoal-400 text-xs font-body">Phone</p>
                      <p className="text-charcoal-800 font-medium text-sm font-body group-hover:text-navy-800 transition-colors">+44 7383 608438</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={16} className="text-navy-800" />
                    </div>
                    <div>
                      <p className="text-charcoal-400 text-xs font-body">Address</p>
                      <p className="text-charcoal-800 font-medium text-sm font-body">Cambridge, UK</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-navy-800" />
                    </div>
                    <div>
                      <p className="text-charcoal-400 text-xs font-body">Business Hours</p>
                      <p className="text-charcoal-800 font-medium text-sm font-body">Mon–Fri: 7:30am – 6:00pm</p>
                      <p className="text-charcoal-800 font-medium text-sm font-body">Sat: 8:00am – 2:00pm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map removed by user request */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
