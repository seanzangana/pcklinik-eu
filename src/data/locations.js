// Location/area pages — audience: internationals, students, companies, embassies.
// The workshop is in Frederiksberg; neighbourhood pages are "we serve X residents".
export const locations = [
  {
    slug: 'computer-repair-copenhagen', hub: true,
    title: 'Computer & Mac Repair in Copenhagen | English-Speaking | PCKlinik',
    description: 'PC and Mac repair in Copenhagen for internationals, students, and businesses. No Danish required. Free diagnostics, fixed quote.',
    h1: 'Computer Repair in Copenhagen', subhead: 'English-speaking, workshop-based, no Danish required',
    intro: [
      "New to Copenhagen, studying here, or running a business with international staff? PCKlinik repairs PCs and Macs for the city's international community — students, expats, embassy staff, and companies — entirely in English. You don't need to speak Danish to explain what's wrong or understand your quote.",
      "We're based in Frederiksberg, a short trip from most of central Copenhagen by metro or bike, and we serve the whole city plus the rest of Denmark via remote support. Standard diagnostics are free (2–4 days), or express for 600 kr (1–2 hours) — with repair and delivery within 24 hours if no special parts need ordering.",
    ],
    faq: [
      { q: "Do you offer pickup and delivery within Copenhagen?", a: "Yes — contact us for details based on your specific location." },
      { q: 'Do I need to speak Danish to get my computer repaired?', a: 'No, our service is entirely in English.' },
      { q: "I'm only in Copenhagen for a semester/short posting — is that a problem?", a: 'Not at all, we work with international students and short-term residents regularly.' },
      { q: 'Do you serve companies and embassies, not just individuals?', a: 'Yes — see our Business IT Support page for ongoing IT service agreements, in addition to individual device repairs.' },
    ],
    areas: ['computer-repair-frederiksberg', 'computer-repair-vesterbro', 'computer-repair-vanloese', 'computer-repair-valby', 'computer-repair-nordvest'],
    crosslinks: [{ label: 'Business IT Support', href: '/business-it-service-agreement/' }, { label: 'Contact', href: '/contact/' }],
  },
  {
    slug: 'computer-repair-frederiksberg',
    title: 'Computer Repair Frederiksberg | Near CBS | PCKlinik',
    description: 'PC and Mac repair in Frederiksberg, walking distance from Copenhagen Business School (CBS). English-speaking, free diagnostics.',
    h1: 'Computer Repair in Frederiksberg', subhead: 'Right where you are — walking distance from CBS',
    intro: [
      'Our workshop is on Falkoner Allé, right in Frederiksberg — the same area as Copenhagen Business School (CBS), which welcomes around 2,400–3,000 international students every year. If your laptop dies right before an exam or deadline, we\'re close enough to actually help in time.',
      "We work with CBS students, international staff, and Frederiksberg residents in English, no Danish needed. Standard diagnostics are free (2–4 days), or express for 600 kr (1–2 hours) — with repair and delivery within 24 hours if no special parts need ordering, which matters when you're on a deadline.",
    ],
    trustLine: "We understand exam and deadline pressure — tell us if you're on a tight timeline, and we'll do what we can with express diagnostics.",
    faq: [
      { q: "Is there a busier time of year for student laptop repairs?", a: "Yes, typically around exam periods — if you're on a deadline, mention it and we'll prioritize with express diagnostics where possible." },
      { q: 'Are you close to CBS?', a: "Yes, we're in Frederiksberg, the same area as CBS's campus buildings." },
      { q: 'Can you help if I need my laptop back before an exam?', a: "Tell us the timeline — express diagnostics (600 kr, 1–2 hours) is your fastest option, and we'll be upfront about whether we can meet your deadline." },
      { q: 'Do you work with international students specifically?', a: 'Yes, regularly — no Danish required.' },
    ],
    crosslinks: [{ label: 'Copenhagen (overview)', href: '/computer-repair-copenhagen/' }, { label: 'Business IT Support', href: '/business-it-service-agreement/' }, { label: 'Contact', href: '/contact/' }],
  },
  {
    slug: 'computer-repair-vesterbro',
    title: 'Computer Repair Vesterbro | English-Speaking | PCKlinik',
    description: 'PC and Mac repair for Vesterbro residents — popular with CBS students and internationals. English-speaking, free diagnostics.',
    h1: 'Computer Repair in Vesterbro', subhead: "A short trip from one of Copenhagen's most international neighborhoods",
    intro: [
      'Vesterbro is one of the most popular neighborhoods for CBS students and internationals living in Copenhagen. We\'re a short trip away in neighboring Frederiksberg, and we serve Vesterbro residents entirely in English — no Danish required to explain your problem or get your quote.',
      'Standard diagnostics are free (2–4 days), or express for 600 kr (1–2 hours) — with repair and delivery within 24 hours if no special parts need ordering.',
    ],
    faq: [
      { q: "Is your workshop easy to reach from Vesterbro without a car?", a: "Yes — we're a short trip away in neighboring Frederiksberg, reachable by metro, bus, or bike." },
      { q: 'How far is Vesterbro from your workshop?', a: "We're right next door in Frederiksberg, easily reachable by metro, bus, or bike." },
      { q: 'Do you serve Vesterbro in English?', a: 'Yes, entirely — no Danish needed.' },
    ],
    crosslinks: [{ label: 'Copenhagen (overview)', href: '/computer-repair-copenhagen/' }, { label: 'Business IT Support', href: '/business-it-service-agreement/' }, { label: 'Contact', href: '/contact/' }],
  },
  {
    slug: 'computer-repair-vanloese',
    title: 'Computer Repair Vanløse | English-Speaking | PCKlinik',
    description: 'PC and Mac repair for Vanløse residents. English-speaking service, free diagnostics, fixed quote before any work starts.',
    h1: 'Computer Repair in Vanløse', subhead: 'English-speaking repair, a short trip from Vanløse',
    intro: ['We serve Vanløse residents from our Frederiksberg workshop, entirely in English — no Danish required. Standard diagnostics are free (2–4 days), or express for 600 kr (1–2 hours) — with repair and delivery within 24 hours if no special parts need ordering.'],
    faq: [
      { q: "What's the fastest way to get my device to you from Vanløse?", a: "Bring it in directly, or ask about pickup/delivery depending on your location." },
      { q: 'Is your service available in English for Vanløse customers?', a: 'Yes, entirely.' },
      { q: 'How do I get my computer to you from Vanløse?', a: 'Bring it in directly, or ask about pickup/delivery — available depending on your location.' },
    ],
    crosslinks: [{ label: 'Copenhagen (overview)', href: '/computer-repair-copenhagen/' }, { label: 'Business IT Support', href: '/business-it-service-agreement/' }, { label: 'Contact', href: '/contact/' }],
  },
  {
    slug: 'computer-repair-valby',
    title: 'Computer Repair Valby | English-Speaking | PCKlinik',
    description: 'PC and Mac repair for Valby residents. English-speaking service, free diagnostics, fixed quote before any work starts.',
    h1: 'Computer Repair in Valby', subhead: 'English-speaking repair, a short trip from Valby',
    intro: ['We serve Valby residents from our Frederiksberg workshop, entirely in English — no Danish required. Standard diagnostics are free (2–4 days), or express for 600 kr (1–2 hours) — with repair and delivery within 24 hours if no special parts need ordering.'],
    faq: [
      { q: "What's the fastest way to get my device to you from Valby?", a: "Bring it in directly, or ask about pickup/delivery depending on your location." },
      { q: 'Is your service available in English for Valby customers?', a: 'Yes, entirely.' },
      { q: 'How do I get my computer to you from Valby?', a: 'Bring it in directly, or ask about pickup/delivery — available depending on your location.' },
    ],
    crosslinks: [{ label: 'Copenhagen (overview)', href: '/computer-repair-copenhagen/' }, { label: 'Business IT Support', href: '/business-it-service-agreement/' }, { label: 'Contact', href: '/contact/' }],
  },
  {
    slug: 'computer-repair-nordvest',
    title: 'Computer Repair Nordvest Copenhagen | English-Speaking | PCKlinik',
    description: 'PC and Mac repair for Nordvest (NV) Copenhagen residents. English-speaking service, free diagnostics, fixed quote.',
    h1: 'Computer Repair in Nordvest (NV Copenhagen)', subhead: 'English-speaking repair, a short trip from NV',
    intro: ['We serve Nordvest (NV) residents from our Frederiksberg workshop, entirely in English — no Danish required. Standard diagnostics are free (2–4 days), or express for 600 kr (1–2 hours) — with repair and delivery within 24 hours if no special parts need ordering.'],
    faq: [
      { q: "What's the fastest way to get my device to you from Nordvest?", a: "Bring it in directly, or ask about pickup/delivery depending on your location." },
      { q: 'Is your service available in English for Nordvest customers?', a: 'Yes, entirely.' },
      { q: 'How do I get my computer to you from Nordvest?', a: 'Bring it in directly, or ask about pickup/delivery — available depending on your location.' },
    ],
    crosslinks: [{ label: 'Copenhagen (overview)', href: '/computer-repair-copenhagen/' }, { label: 'Business IT Support', href: '/business-it-service-agreement/' }, { label: 'Contact', href: '/contact/' }],
  },
];
