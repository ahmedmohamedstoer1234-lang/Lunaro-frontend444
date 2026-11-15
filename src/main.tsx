
import './dynamic-bridge';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowUpLeft, ArrowUpRight, Check, ChevronDown, Code2, Globe2, Layers3, Menu, MessageCircle, MonitorSmartphone, Palette, Search, ShieldCheck, Sparkles, X, Zap } from 'lucide-react';
import { projects } from './projects';
import { fetchRemoteProjects, subscribeToRemoteProjects } from './dynamic-bridge';
import './styles.css';

const email = 'ahmedmohamedstoer1234@gmail.com', whatsapp = 'https://wa.me';
type Lang = 'ar' | 'en';

const copy = {
  ar: {
    nav: ['الرئيسية', 'من نحن', 'خدماتنا', 'أعمالنا', 'تواصل معنا'],
    heroTag: 'شريكك الرقمي للنمو',
    heroTitle: 'نحوّل أفكارك إلى\nتجارب رقمية استثنائية',
    heroDesc: 'نصمم ونطوّر مواقع وتطبيقات وحلولًا رقمية تجمع بين الأداء، الأمان، وتجربة المستخدم التي تستحقها علامتك التجارية.',
    cta: 'ابدأ مشروعك',
    works: 'اكتشف أعمالنا',
    trusted: 'من الفكرة إلى الإطلاق — بخطوات واضحة',
    services: 'حلول رقمية مصممة لأهدافك',
    servicesDesc: 'نربط التصميم بالتقنية لنقدم تجربة متكاملة تخدم عملاءك وتدعم نمو أعمالك.',
    portfolio: 'نماذج من أعمالنا',
    portfolioDesc: 'مجموعة من التصورات والمشروعات التي توضح تنوع الحلول التي يمكننا بناؤها.',
    all: 'الكل',
    search: 'ابحث عن مشروع...',
    why: 'لماذا لونارو؟',
    whyDesc: 'شراكة واضحة، تنفيذ مدروس، واهتمام بالتفاصيل من أول نقاش حتى التسليم.',
    process: 'رحلة العمل',
    faq: 'أسئلة يطرحها عملاؤنا',
    contactTitle: 'لديك فكرة؟ لنبنِها معًا.',
    contactDesc: 'احكِ لنا عن مشروعك وسنساعدك في تحديد الخطوة التالية.',
    name: 'الاسم',
    mail: 'البريد الإلكتروني',
    service: 'نوع الخدمة',
    message: 'تفاصيل المشروع',
    send: 'إرسال الطلب',
    sending: 'جارٍ الإرسال...',
    success: 'تم إرسال طلبك بنجاح. سنتواصل معك قريبًا.',
    error: 'تعذر إرسال الطلب الآن. يمكنك التواصل معنا عبر واتساب أو البريد الإلكتروني.',
    footer: 'حلول رقمية تبدأ بفكرة وتكبر بالتنفيذ.',
    demo: 'مشروع تجريبي',
    more: 'تفاصيل المشروع',
    close: 'إغلاق',
    select: 'اختر الخدمة',
    about: 'نحن لونارو',
    aboutText: 'استوديو حلول رقمية يركز على بناء تجارب عملية وجذابة للشركات ورواد الأعمال في مصر والخليج.',
    privacy: 'الخصوصية',
    rights: 'جميع الحقوق محفوظة.'
  },
  en: {
    nav: ['Home', 'About', 'Services', 'Portfolio', 'Contact'],
    heroTag: 'Your digital growth partner',
    heroTitle: 'We turn ideas into\nexceptional digital experiences',
    heroDesc: 'We design and build websites, apps, and digital solutions that bring together performance, security, and thoughtful user experience.',
    cta: 'Start a project',
    works: 'Explore our work',
    trusted: 'From idea to launch — with a clear process',
    services: 'Digital solutions built around your goals',
    servicesDesc: 'We connect design and technology to create useful experiences for your customers and business.',
    portfolio: 'Selected projects',
    portfolioDesc: 'A collection of projects showcasing the range of digital experiences we can build.',
    all: 'All',
    search: 'Search projects...',
    why: 'Why Lunaro?',
    whyDesc: 'Clear collaboration, thoughtful execution, and attention to detail from first conversation to handoff.',
    process: 'How we work',
    faq: 'Frequently asked questions',
    contactTitle: 'Have an idea? Let’s build it.',
    contactDesc: 'Tell us about your project and we’ll help you define the next step.',
    name: 'Name',
    mail: 'Email',
    service: 'Service type',
    message: 'Project details',
    send: 'Send inquiry',
    sending: 'Sending...',
    success: 'Your inquiry was sent successfully. We’ll be in touch soon.',
    error: 'We couldn’t send your inquiry. Please use WhatsApp or email instead.',
    footer: 'Digital solutions that grow from an idea.',
    demo: 'Concept project',
    more: 'Project details',
    close: 'Close',
    select: 'Select a service',
    about: 'About Lunaro',
    aboutText: 'A digital solutions studio focused on practical, polished experiences for businesses across Egypt and the Gulf.',
    privacy: 'Privacy',
    rights: 'All rights reserved.'
  }
};

const serviceItems = [
  { icon: MonitorSmartphone, title: { ar: 'المواقع الإلكترونية', en: 'Websites' }, desc: { ar: 'مواقع سريعة ومتجاوبة تعكس قيمة علامتك وتحوّل الزيارات إلى فرص.', en: 'Fast, responsive websites that communicate your value and turn visits into opportunities.' } },
  { icon: Code2, title: { ar: 'تطبيقات الويب', en: 'Web applications' }, desc: { ar: 'أنظمة ولوحات تحكم مصممة لتبسيط العمليات اليومية.', en: 'Custom systems and dashboards that simplify everyday workflows.' } },
  { icon: Layers3, title: { ar: 'المتاجر الإلكترونية', en: 'E-commerce' }, desc: { ar: 'تجارب تسوق واضحة تساعد عملاءك على اكتشاف المنتجات والشراء بسهولة.', en: 'Clear shopping experiences that help customers discover and buy with confidence.' } },
  { icon: Palette, title: { ar: 'تصميم UI/UX', en: 'UI/UX design' }, desc: { ar: 'واجهات مدروسة تجمع بين الجمال وسهولة الاستخدام.', en: 'Thoughtful interfaces balancing visual craft with usability.' } }
];

const categories = ['متاجر إلكترونية', 'مواقع شركات', 'لوحات تحكم', 'تطبيقات ويب', 'تطبيقات موبايل', 'حجوزات', 'تعليم', 'خدمات رقمية'];

function App() {
  const [lang, setLang] = useState<Lang>('ar');
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState('الكل');
  const [query, setQuery] = useState('');
  const [remoteProjects, setRemoteProjects] = useState<(typeof projects)[number][]>([]);
  const [active, setActive] = useState<(typeof projects)[number] | null>(null);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  const t = copy[lang];
  const isAr = lang === 'ar';

  useEffect(() => {
    let mounted = true;
    const loadRemote = async () => {
      const list = await fetchRemoteProjects();
      if (mounted) setRemoteProjects(list);
    };
    void loadRemote();
    const unsubscribe = subscribeToRemoteProjects(() => {
      void loadRemote();
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const allProjects = useMemo(() => [...remoteProjects, ...projects], [remoteProjects]);

  const shown = useMemo(
    () =>
      allProjects.filter(
        p =>
          (filter === 'الكل' || filter === t.all || p.category === filter) &&
          `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query.toLowerCase())
      ),
    [allProjects, filter, query, t.all]
  );

  function jump(id: string) {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setStatus('');
    setSending(true);
    const form = new FormData(formElement);
    try {
      const r = await fetch(import.meta.env.VITE_API_URL || 'https://vercel.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          service: form.get('service'),
          message: form.get('message')
        })
      });
      if (!r.ok) throw new Error('Request failed');
      setStatus('success');
      formElement.reset();
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} lang={lang} className="app">
      <header className="header">
        <a className="brand" href="#home" onClick={e => { e.preventDefault(); jump('home'); }}>
          <span className="moon">☾</span>
          <span>LUNARO<small>لونارو للحلول الرقمية</small></span>
        </a>
        <nav className={menu ? 'nav open' : 'nav'}>
          {t.nav.map((n, i) => (
            <a key={n} href={'#' + ['home', 'about', 'services', 'portfolio', 'contact'][i]} onClick={e => { e.preventDefault(); jump(['home', 'about', 'services', 'portfolio', 'contact'][i]); }}>
              {n}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <div data-dynamic-links className="dynamic-links-bar" />
          <button className="lang" onClick={() => { setLang(isAr ? 'en' : 'ar'); setFilter('الكل'); }}>
            <Globe2 size={16} />{isAr ? 'EN' : 'عربي'}
          </button>
          <a className="small-cta" href={whatsapp} target="_blank" rel="noreferrer">
            {t.cta}<ArrowUpLeft size={16} />
          </a>
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenu(!menu)}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse" />{t.heroTag}</div>
            <h1>{t.heroTitle.split('\n').map((line, i) => <React.Fragment key={line}>{i > 0 && <br />}{line}</React.Fragment>)}</h1>
            <p className="lead">{t.heroDesc}</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => jump('contact')}>{t.cta}<ArrowLeft size={18} /></button>
              <button className="secondary" onClick={() => jump('portfolio')}>{t.works}<ArrowUpRight size={18} /></button>
            </div>
            <div className="hero-proof">
              <span><ShieldCheck size={17} />{isAr ? 'اهتمام بالأمان' : 'Security-minded'}</span>
              <span><Zap size={17} />{isAr ? 'أداء وتجربة' : 'Performance & UX'}</span>
              <span><Check size={17} />{isAr ? 'خطوات واضحة' : 'Clear process'}</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="glow-ball" />
            <div className="editor">
