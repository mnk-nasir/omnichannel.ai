import Link from 'next/link';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Integrations', href: '#integrations' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Channels',
    links: [
      { name: 'WhatsApp Bot', href: '#' },
      { name: 'Voice AI', href: '#' },
      { name: 'Instagram DM', href: '#' },
      { name: 'Messenger', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Contact', href: '#' },
    ],
  },
];

const socialLinks = [
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.98 1.98 0 01-1.984-1.983 1.98 1.98 0 011.984-1.984 1.98 1.98 0 011.984 1.984 1.98 1.98 0 01-1.984 1.983zm1.71 13.019H3.623V9h3.424v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#111823] border-t border-white/[0.06] overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] blur-[150px] opacity-[0.08] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #00E88F, transparent 70%)' }}
      />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="pt-72 pb-32 grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center">
              <img src="/omnixa-logo-dark.png" alt="Omnixa" className="h-[38px] w-auto object-contain" />
            </Link>
            <p className="text-neutral-400 text-sm max-w-sm leading-relaxed">
              Omnixa is the world's first truly autonomous customer engagement platform. We build AI that doesn't just chat, but closes.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-neutral-500 hover:text-[#00E88F] hover:border-[#00E88F]/30 transition-all"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h3 className="text-white text-xs font-black uppercase tracking-widest">{column.title}</h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-neutral-500 hover:text-white text-sm transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs">
          <p className="text-neutral-600">
            &copy; {new Date().getFullYear()} Omnixa.Ai. Built for the era of automation.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-neutral-600 hover:text-white transition-colors">Security</Link>
            <Link href="#" className="text-neutral-600 hover:text-white transition-colors">Status</Link>
            <Link href="#" className="text-neutral-600 hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
