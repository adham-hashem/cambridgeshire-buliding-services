import { Helmet } from 'react-helmet-async';

export function PrivacyPolicyPage() {
  const lastUpdated = 'July 20, 2026';

  const sections = [
    {
      title: '1. Introduction',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            Welcome to Cambridgeshire Building Services (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We are committed to protecting your personal information and your privacy. This Privacy Policy details how we collect, use, store, and disclose your personal data when you visit our website (
            <a href="https://www.cambridgeshirebuildingservices.co.uk" className="text-navy-800 hover:text-gold-500 transition-colors font-medium">
              www.cambridgeshirebuildingservices.co.uk
            </a>
            ) or when you engage with us to receive building, renovation, or property maintenance services.
          </p>
          <p className="text-charcoal-700 leading-relaxed font-body">
            By accessing our website or utilizing our services, you consent to the collection and use of information in accordance with this Privacy Policy and the UK General Data Protection Regulation (UK GDPR).
          </p>
        </>
      ),
    },
    {
      title: '2. Information We Collect',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            We collect personal data that you voluntarily provide to us when you request a quotation, book a consultation, subscribe to our newsletter, or communicate with us directly. This information may include:
          </p>
          <ul className="list-disc pl-6 text-charcoal-700 leading-relaxed font-body space-y-2 mb-4">
            <li><strong>Identity Details:</strong> Full name, company name (if applicable), and title.</li>
            <li><strong>Contact Details:</strong> Email address, phone number, and physical billing/site addresses.</li>
            <li><strong>Project Details:</strong> Information regarding your property improvements, requirements, photos, and budget choices.</li>
            <li><strong>Newsletter Preferences:</strong> Email address and consent status for newsletter subscription.</li>
          </ul>
          <p className="text-charcoal-700 leading-relaxed font-body">
            We also automatically collect technical data when you browse our site, such as your IP address, browser type, operating system, and details about your interaction with our website (using cookies and analytics).
          </p>
        </>
      ),
    },
    {
      title: '3. How We Use Your Information',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            We use your personal data to operate our business efficiently and provide you with high-quality services. Specifically, we use it to:
          </p>
          <ul className="list-disc pl-6 text-charcoal-700 leading-relaxed font-body space-y-2">
            <li>Generate precise and competitive project quotations.</li>
            <li>Schedule, coordinate, and perform consultations and physical building works.</li>
            <li>Respond to your enquiries and provide customer support.</li>
            <li>Send you relevant updates, newsletters, and inspiration journal articles (where you have explicitly subscribed).</li>
            <li>Comply with financial, tax, and legal obligations required by UK authorities.</li>
            <li>Analyze web performance to enhance our website functionality and user experience.</li>
          </ul>
        </>
      ),
    },
    {
      title: '4. Data Sharing & Disclosure',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            We do not sell, rent, or lease your personal information to third parties. We will only share your information in the following situations:
          </p>
          <ul className="list-disc pl-6 text-charcoal-700 leading-relaxed font-body space-y-2">
            <li><strong>Subcontractors & Suppliers:</strong> We may share site address and project details with trusted trade partners (e.g. registered electricians, plumbers, scaffolders) solely to deliver specific portions of your building works.</li>
            <li><strong>Service Providers:</strong> We share data with hosting platforms (e.g. Supabase, Vercel) and notification systems (e.g. Telegram alert bots) that assist us in operating our digital services.</li>
            <li><strong>Legal Obligations:</strong> We may disclose data if required by UK law, government authorities, or to defend our rights and safety.</li>
          </ul>
        </>
      ),
    },
    {
      title: '5. Cookies and Caching',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            We use essential and analytics cookies to optimize page speeds and monitor site traffic patterns.
          </p>
          <p className="text-charcoal-700 leading-relaxed font-body">
            You can modify your browser settings to decline cookies. However, some aspects of the website may not function correctly without them. Furthermore, we leverage advanced caching protocols via our hosting provider to deliver images and stylesheets quickly and efficiently.
          </p>
        </>
      ),
    },
    {
      title: '6. Data Security',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            The security of your personal data is paramount to us. We implement appropriate physical, technical, and administrative controls (including SSL encryption, secure hosting architectures, and restricted access rights) to protect your details from unauthorized access, loss, or disclosure.
          </p>
          <p className="text-charcoal-700 leading-relaxed font-body">
            Please note that no transmission over the internet or database storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </>
      ),
    },
    {
      title: '7. Your Rights under UK GDPR',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            Under the UK General Data Protection Regulation, you possess several rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 text-charcoal-700 leading-relaxed font-body space-y-2 mb-4">
            <li>The right to request a copy of the personal data we hold about you.</li>
            <li>The right to request correction of inaccurate or incomplete information.</li>
            <li>The right to request the deletion of your personal data (&ldquo;the right to be forgotten&rdquo;), subject to legal record-keeping requirements.</li>
            <li>The right to withdraw your consent to receive newsletters at any time.</li>
          </ul>
          <p className="text-charcoal-700 leading-relaxed font-body">
            To exercise any of these rights, please contact us using the details provided below.
          </p>
        </>
      ),
    },
    {
      title: '8. Contact Us',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            If you have questions about this Privacy Policy or how we handle your personal data, please reach out to us:
          </p>
          <div className="bg-cream-100 p-6 rounded-lg border border-charcoal-200/50 space-y-2 font-body text-sm text-charcoal-700">
            <p><strong>Company:</strong> Cambridgeshire Building Services</p>
            <p><strong>Email:</strong> <a href="mailto:cambridgeshirebuildingservices@gmail.com" className="text-navy-800 hover:text-gold-500 transition-colors font-medium">cambridgeshirebuildingservices@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:07383608438" className="text-navy-800 hover:text-gold-500 transition-colors font-medium">07383608438</a></p>
            <p><strong>Location:</strong> Cambridge, United Kingdom</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="bg-cream-50 min-h-screen">
      <Helmet>
        <title>Privacy Policy | Cambridgeshire Building Services</title>
        <meta name="description" content="Privacy Policy for Cambridgeshire Building Services. Understand how we collect, use, and secure your personal information." />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/279607/pexels-photo-279607.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Privacy Policy banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-900/50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 text-center space-y-4 pt-16">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-[10px] tracking-[0.25em] uppercase font-body">Legal</span>
          <h1 className="text-4xl md:text-5xl font-light font-display text-white tracking-tight">Privacy Policy</h1>
          <p className="text-white/70 text-sm font-body">Last Updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-10 bg-white border border-charcoal-200/60 p-8 md:p-14 shadow-sm">
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <div key={idx} className="border-b border-charcoal-100 last:border-0 pb-10 last:pb-0">
                <h2 className="text-2xl font-light font-display text-navy-800 mb-5 tracking-tight">{section.title}</h2>
                {section.content}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
