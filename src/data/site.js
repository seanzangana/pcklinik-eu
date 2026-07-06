// Central site config — single source of truth for NAP, nav, and URL mapping.
export const site = {
  name: 'PCKlinik',
  domain: 'https://www.pcklinik.eu',
  phone: '91 81 61 81',
  phoneHref: 'tel:+4591816181',
  formMode: 'cloudflare', // 'formspree' (Formspree) or 'cloudflare' (Resend via /api/submit-form). LIVE-GATED: verify domain in Resend + set RESEND_API_KEY secret before deploying.
  emailConsumer: 'contact@pcklinik.eu',
  emailBusiness: 'support@pcklinik.eu',
  address: 'Falkoner Allé 108, 2000 Frederiksberg',
  addressStreet: 'Falkoner Allé 108',
  addressLocality: 'Frederiksberg',
  addressPostal: '2000',
  hours: 'Mon–Fri 10:00–18:00 · Sat 10:00–14:00 · Sun closed',
  mapsEmbed: 'https://www.google.com/maps?q=Falkoner+All%C3%A9+108,+2000+Frederiksberg&output=embed',
};

// Dropdown children may include { header: 'Label' } items — rendered as a
// non-clickable section divider inside the menu.
export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Business IT Support', href: '/business-it-service-agreement/' },
  {
    label: 'Websites & SEO',
    href: '/websites-seo-google-ads/',
    children: [
      { label: 'Overview', href: '/websites-seo-google-ads/' },
      { label: 'Website Design & Development', href: '/website-design-development/' },
      { label: 'SEO Services', href: '/seo-services/' },
      { label: 'Google Ads Management', href: '/google-ads-management/' },
    ],
  },
  {
    label: 'Services',
    href: '/faq/',
    // Cascading flyout: 6 categories, each opens a side panel of links.
    flyout: [
      { label: 'By Brand', children: [
        { label: 'Lenovo', href: '/lenovo-repair/' },
        { label: 'Acer', href: '/acer-repair/' },
        { label: 'HP', href: '/hp-repair/' },
        { label: 'Dell', href: '/dell-repair/' },
        { label: 'Asus', href: '/asus-repair/' },
        { label: 'MSI', href: '/msi-repair/' },
        { label: 'Huawei', href: '/huawei-repair/' },
        { label: 'MacBook', href: '/macbook-repair/' },
        { label: 'Microsoft Surface', href: '/microsoft-surface-repair/' },
        { label: 'Samsung', href: '/samsung-repair/' },
        { label: 'Mac Repair (overview)', href: '/mac-repair/' },
        { label: 'Mac (desktop)', href: '/mac-desktop-repair/' },
        { label: 'Gaming PCs & Custom Builds', href: '/gaming-pc-repair-and-build/' },
        { label: 'Toshiba / Dynabook', href: '/toshiba-dynabook-repair/' },
        { label: 'Fujitsu', href: '/fujitsu-repair/' },
        { label: 'LG gram', href: '/lg-gram-repair/' },
        { label: 'Razer Blade', href: '/razer-blade-repair/' },
        { label: 'Other Brands & Custom Builds', href: '/other-brands-repair/' },
      ] },
      { label: 'Repairs & Maintenance', children: [
        { label: 'SSD Upgrade', href: '/ssd-upgrade/' },
        { label: 'PC Optimization', href: '/pc-optimization/' },
        { label: 'Hard Drive Replacement', href: '/hard-drive-replacement/' },
        { label: 'Screen Replacement', href: '/screen-replacement/' },
        { label: 'Liquid Damage Repair', href: '/liquid-damage-repair/' },
        { label: 'PC Cleaning & Dust Removal', href: '/pc-cleaning/' },
        { label: 'Charging Port Repair', href: '/charging-port-repair/' },
        { label: 'Laptop Keyboard Replacement', href: '/keyboard-replacement/' },
        { label: 'Mac Cleaning', href: '/mac-cleaning/' },
        { label: 'Mac Battery Replacement', href: '/mac-battery-replacement/' },
        { label: 'Mac Screen Replacement', href: '/mac-screen-replacement/' },
        { label: 'MacBook Keyboard Replacement', href: '/mac-keyboard-replacement/' },
        { label: 'MacBook Trackpad Replacement', href: '/mac-trackpad-replacement/' },
      ] },
      { label: 'Data & Security', children: [
        { label: 'Data Backup & Recovery', href: '/data-backup-and-recovery/' },
        { label: 'Virus & Malware Removal', href: '/virus-removal/' },
      ] },
      { label: 'Remote & On-Site', children: [
        { label: 'Remote Support', href: '/remote-support/' },
        { label: 'On-Site Technician', href: '/on-site-technician/' },
        { label: 'System Installation', href: '/system-installation/' },
      ] },
      { label: 'Network Equipment', children: [
        { label: 'Network Equipment (overview)', href: '/network-equipment/' },
        { label: 'WiFi & Network Troubleshooting', href: '/wifi-network-troubleshooting/' },
        { label: 'UniFi Setup & Support', href: '/unifi-setup-support/' },
        { label: 'Netgear Setup & Support', href: '/netgear-setup-support/' },
        { label: 'TP-Link Setup & Support', href: '/tp-link-setup-support/' },
        { label: 'ASUS Router Setup & Support', href: '/asus-router-setup-support/' },
        { label: 'Eero & Google Nest WiFi Setup', href: '/eero-google-nest-wifi-setup/' },
      ] },
      { label: 'Help & Guides', children: [
        { label: "Computer Won't Turn On", href: '/computer-wont-turn-on/' },
        { label: 'Error Messages & Codes', href: '/error-messages/' },
        { label: 'General FAQ', href: '/faq/' },
      ] },
    ],
  },
  { label: 'Contact', href: '/contact/' },
];

// hreflang: EN URL -> DK equivalent. New pages omitted until DK parity exists.
export const hreflangMap = {
  '/': 'https://www.pcklinik.dk/',
  '/lenovo-repair/': 'https://www.pcklinik.dk/lenovo-reparation/',
  '/acer-repair/': 'https://www.pcklinik.dk/acer-reparation/',
  '/hp-repair/': 'https://www.pcklinik.dk/hp-reparation/',
  '/dell-repair/': 'https://www.pcklinik.dk/dell-reparation/',
  '/asus-repair/': 'https://www.pcklinik.dk/asus-reparation/',
  '/msi-repair/': 'https://www.pcklinik.dk/msi-reparation/',
  '/huawei-repair/': 'https://www.pcklinik.dk/huawei-reparation/',
  '/macbook-repair/': 'https://www.pcklinik.dk/macbook-reparation/',
  '/microsoft-surface-repair/': 'https://www.pcklinik.dk/microsoft-surface-reparation/',
  '/samsung-repair/': 'https://www.pcklinik.dk/samsung-reparation/',
  '/mac-desktop-repair/': 'https://www.pcklinik.dk/mac-reparation/',
  '/other-brands-repair/': 'https://www.pcklinik.dk/andre-maerker-reparation/',
  '/shop/': 'https://www.pcklinik.dk/butik/',
  '/shop/computers/': 'https://www.pcklinik.dk/butik/computere/',
  '/shop/computers/new/': 'https://www.pcklinik.dk/butik/computere/nye/',
  '/shop/computers/refurbished/': 'https://www.pcklinik.dk/butik/computere/refurbished/',
  '/shop/backup-security/': 'https://www.pcklinik.dk/butik/backup-sikkerhed/',
  '/business-it-service-agreement/': 'https://www.pcklinik.dk/it-support-til-erhverv/',
  '/contact/': 'https://www.pcklinik.dk/kontakt/',
};
