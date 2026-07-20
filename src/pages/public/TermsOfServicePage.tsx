import { Helmet } from 'react-helmet-async';

export function TermsOfServicePage() {
  const lastUpdated = 'July 20, 2026';

  const sections = [
    {
      title: '1. Agreement to Terms',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            Welcome to Cambridgeshire Building Services. By accessing and using our website (
            <a href="https://www.cambridgeshirebuildingservices.co.uk" className="text-navy-800 hover:text-gold-500 transition-colors font-medium">
              www.cambridgeshirebuildingservices.co.uk
            </a>
            ) and our services, you agree to comply with and be bound by the following Terms of Service.
          </p>
          <p className="text-charcoal-700 leading-relaxed font-body">
            Please read these terms carefully. If you do not agree with any part of these terms, you must not use our website or services.
          </p>
        </>
      ),
    },
    {
      title: '2. Scope of Services',
      content: (
        <p className="text-charcoal-700 leading-relaxed font-body">
          Cambridgeshire Building Services provides residential and commercial property maintenance, building, renovation, tiling, flooring, and landscaping services. All descriptions of services on this website are subject to change at any time without notice. We reserve the right to modify or discontinue any service at our discretion.
        </p>
      ),
    },
    {
      title: '3. Quotations & Consultations',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            Any quote request, price calculator estimate, or booking form submitted via our website is an enquiry for a consultation. It does not constitute a binding contract or a guaranteed quote.
          </p>
          <p className="text-charcoal-700 leading-relaxed font-body">
            A binding quotation will only be provided in writing following a detailed physical site survey and written specification agreement between us and the client.
          </p>
        </>
      ),
    },
    {
      title: '4. Accuracy of User Information',
      content: (
        <p className="text-charcoal-700 leading-relaxed font-body">
          When submitting any details through our contact forms, quote requests, or consultation bookings, you warrant that all information provided is accurate, current, and complete. If we have grounds to suspect that the information is false or misleading, we reserve the right to reject your request and refuse service.
        </p>
      ),
    },
    {
      title: '5. Intellectual Property Rights',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            Unless otherwise stated, all materials on this website (including but not limited to the design, layout, logo, graphics, photos of building projects, text, and source code) are the intellectual property of Cambridgeshire Building Services and are protected by copyright laws.
          </p>
          <p className="text-charcoal-700 leading-relaxed font-body">
            You may view, download, and print content for your personal, non-commercial reference only. You must not copy, reproduce, republish, redistribute, or use any content from this website for commercial purposes without our express written permission.
          </p>
        </>
      ),
    },
    {
      title: '6. Limitation of Liability',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            The information on our website is provided for general guidance and inspiration. While we endeavor to keep the website up-to-date and accurate, we make no representations or warranties of any kind regarding its completeness or accuracy.
          </p>
          <p className="text-charcoal-700 leading-relaxed font-body">
            We will not be liable for any direct or indirect loss or damage arising under these terms or in connection with the use of our website. Physical building works are subject to separate contract terms which govern liability, warranties, and insurance.
          </p>
        </>
      ),
    },
    {
      title: '7. Governing Law',
      content: (
        <p className="text-charcoal-700 leading-relaxed font-body">
          These Terms of Service are governed by and construed in accordance with the laws of England and Wales. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>
      ),
    },
    {
      title: '8. Contact Information',
      content: (
        <>
          <p className="text-charcoal-700 leading-relaxed font-body mb-4">
            If you have questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-cream-100 p-6 rounded-lg border border-charcoal-200/50 space-y-2 font-body text-sm text-charcoal-700">
            <p><strong>Company:</strong> Cambridgeshire Building Services</p>
            <p><strong>Email:</strong> <a href="mailto:cambridgeshirebuildingservices@gmail.com" className="text-navy-800 hover:text-gold-500 transition-colors font-medium">cambridgeshirebuildingservices@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:+447383608438" className="text-navy-800 hover:text-gold-500 transition-colors font-medium">+44 7383 608438</a></p>
            <p><strong>Location:</strong> Cambridge, United Kingdom</p>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="bg-cream-50 min-h-screen">
      <Helmet>
        <title>Terms of Service | Cambridgeshire Building Services</title>
        <meta name="description" content="Terms of Service for Cambridgeshire Building Services. Learn about our website terms, quotations, and legal agreements." />
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/279607/pexels-photo-279607.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="Terms of Service banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-charcoal-900/50" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 text-center space-y-4 pt-16">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-[10px] tracking-[0.25em] uppercase font-body">Legal</span>
          <h1 className="text-4xl md:text-5xl font-light font-display text-white tracking-tight">Terms of Service</h1>
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
