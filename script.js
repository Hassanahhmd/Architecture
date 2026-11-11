/**
 * HASSAN AHMED | ARCHITECTURAL PORTFOLIO SCRIPT
 * Bilingual Engine (AR/EN), Smooth Interactivity & Filtering
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Bilingual Translation Engine (AR / EN)
  // ==========================================
  const translations = {
    ar: {
      "nav.name": "حسن أحمد",
      "nav.role": "مهندس معماري",
      "nav.about": "نبذة",
      "nav.stats": "الإنجازات",
      "nav.projects": "المشاريع",
      "nav.experience": "الخبرات",
      "nav.skills": "المهارات والبرامج",
      "nav.contact": "تواصل معي",

      "hero.badge": "متاح للمشاريع والاستشارات المعمارية",
      "hero.greeting": "أهلاً، أنا",
      "hero.name": "حسن أحمد",
      "hero.subtitle": "مهندس معماري ومصمم إظهار بصري ثلاثي الأبعاد",
      "hero.desc": "حاصل على بكالوريوس الهندسة المعمارية (CIC) معتمد من جامعة كيب بريتون - كندا. متخصص في التصميم المعماري، الديكور الداخلي، واللاندسكيب، مع سجل حافل بتسليم أكثر من 50 مشروعاً سكنياً وتجارياً وصناعياً من مرحلة الفكرة وحتى التسليم النهائي في كبرى المجمعات السكنية بمصر.",
      "hero.zero_violations": "صفر مخالفات هندسية عبر 30+ مشروع",
      "hero.view_work": "تصفح المشاريع",
      "hero.whatsapp": "محادثة واتساب",
      "hero.avatar_label": "HASSAN AHMED ARCHITECTURE",
      "hero.floating_projects": "مشروع منفذ",
      "hero.floating_satisfaction": "جودة وتسليم للمفتاح",

      "stats.p1_title": "مشروع معماري وديكور",
      "stats.p1_desc": "سكني، تجاري، وصناعي تم تسليمهم بنجاح",
      "stats.p2_title": "مخالفات هندسية",
      "stats.p2_desc": "التزام تام بأكواد البناء في 30+ مشروع مرخص",
      "stats.p3_title": "مهندسين تحت القيادة",
      "stats.p3_desc": "قيادة فرق عمل معمارية وتنفيذية على أعلى مستوى",
      "stats.p4_title": "مجمعات سكنية كبرى",
      "stats.p4_desc": "Mivida, Mountain View, Orascom, Al-Futtaim وغيرهم",

      "projects.tag": "أبرز الأعمال",
      "projects.title": "مشاريع مختارة بعناية",
      "projects.subtitle": "نماذج حقيقية من مشاريع تم قيادتها من التصميم النظري وحتى التسليم النهائي",
      "projects.filter_all": "الكل",
      "projects.filter_retail": "تجاري & ريتيل",
      "projects.filter_residential": "سكني فاخر",
      "projects.filter_industrial": "صناعي وإنشائي",
      "projects.view_details": "عرض التفاصيل المعمارية",

      "projects.p1_cat": "تصميم ريتيل & تجاري",
      "projects.p1_title": "فرع متجر Baxster الإيطالي - ميفيدا (Mivida)",
      "projects.p1_desc": "قيادة التصميم المعماري للفرع المصري للعلامة الإيطالية الفاخرة، تطبيق كسوات من الحجر والخشب بطابع فينتدج راقي وتنسيق كامل لأعمال الـ MEP في وقت قياسي.",

      "projects.p2_cat": "ديكور وتنفيذ سكني متكامل",
      "projects.p2_title": "شقة هايد بارك - ماونتن فيو (Hyde Park)",
      "projects.p2_desc": "تنفيذ متكامل للديكور الداخلي من الطوب الأحمر (Bare Shell) وحتى التسليم للعميل، شملت أعمال الإلكتروميكانيك والتشطيبات المعمارية والإشراف الموقعي الدقيق.",

      "projects.p3_cat": "بناء وتشطيب صناعي",
      "projects.p3_title": "مجمع مصنعين صناعيين - 6 أكتوبر",
      "projects.p3_desc": "التعاقد كمقاول حر ومالك لشركة مقاولات وتنفيذ المبنيين بالكامل شاملين أعمال الإنشاء الخرساني والتشطيبات الصناعية المتكاملة حتى التسليم النهائي.",

      "projects.p4_cat": "هندسة وتنفيذ مصانع",
      "projects.p4_title": "مصنع شركة أرابيا للألومنيوم (Arabia Aluminium)",
      "projects.p4_desc": "تنفيذ المبنى الصناعي المتخصص من مرحلة الهيكل والإنشاء وحتى التشطيبات الميكانيكية والمعمارية الكاملة طبقاً للمواصفات القياسية.",

      "exp.tag": "المسيرة المهنية",
      "exp.title": "خبرات عملية مثبتة بالنتائج",
      "exp.subtitle": "تدرج وتنوع مهني في كبرى الشركات والمشاريع الريادية",
      "exp.r1_role": "مصمم ومعماري مشاريع سكنية وفاخرة",
      "exp.r1_comp": "مشاريع سكنية وتجارية خاصة",
      "exp.r1_p1": "إدارة وتوجيه مشاريع الفلل والشقق الفاخرة من الفكرة والتصميم وحتى التنفيذ والتسليم في كمبوندات النخبة (Mivida, Mountain View, Orascom, E-Tapa, Al-Futtaim).",
      "exp.r1_p2": "المشاركة في مرحلة التصميم المبدئي لمركز التأهيل وعلاج الإدمان في المملكة العربية السعودية (Saudi Rehab & Detox Center).",
      "exp.r1_p3": "تصميم وتسليم أكثر من 50 مشروعاً معمارياً وداخلياً متضمناً اللوحات التنفيذية، لوحات المزاج (Mood boards)، ومخططات الفرش والإظهار ثلاثي الأبعاد 3D.",
      "exp.r1_p4": "قيادة فريق يضم 4 مهندسين وتحقيق صفر مخالفات هندسية عبر 30 مشروعاً خاضعاً للإشراف.",

      "exp.r2_role": "مهندس معماري",
      "exp.r2_p1": "مراجعة وتطوير المخططات المعمارية ومطابقة ودمج مفاهيم التصميم الداخلي مع الرسومات التنفيذية.",

      "exp.r3_role": "مهندس معماري",
      "exp.r3_p1": "تقييم تطوير المخططات واستراتيجيات الاستجابة للطوارئ طبقاً لاشتراطات ومعايير الدفاع المدني والسلامة الإنشائية.",

      "skills.tag": "الكفاءات والأدوات",
      "skills.title": "البرمجيات الهندسية والتدريب التخصصي",
      "skills.software_title": "البرمجيات والأدوات الهندسية",
      "skills.training_title": "التدريبات والشهادات الموقعية",
      "skills.t1_title": "مشروع Zed Park — أوراسكوم (Jan–Feb 2024)",
      "skills.t1_desc": "تدريب عملي على الواجهات الزجاجية (Curtain Walls)، العزل الحراري والمائي، وكسوات الـ GRC المتطورة.",
      "skills.t2_title": "مشروع Linear Park — ريدكون إسبانيا (Jul–Aug 2023)",
      "skills.t2_desc": "إشراف وتدريب على أعمال اللاندسكيب (Softscape & Hardscape) وأعمال التشطيبات الخارجية.",
      "skills.t3_title": "شركة Alco Eg للألومنيوم والقطاعات الخاصة",
      "skills.t3_desc": "شهادة تدريبية معتمدة في تقنيات قطاعات الألومنيوم الخاصة والأنظمة المعمارية المتقدمة.",

      "domain.d1": "التصميم المعماري (Architectural Design)",
      "domain.d2": "التصميم الداخلي (Interior Design)",
      "domain.d3": "اللاندسكيب وتنسيق الموقع (Landscape Design)",
      "domain.d4": "التخطيط العمراني (Urban Planning)",
      "domain.d5": "المخططات التنفيذية (Working Drawings)",
      "domain.d6": "الإظهار ثلاثي الأبعاد (3D Visualization)",

      "edu.degree": "بكالوريوس الهندسة المعمارية (B.Sc. Architecture Engineering)",
      "edu.school": "الكلية الكندية الدولية (Canadian International College - CIC)، الجيزة",
      "edu.validation": "معتمد رسمياً من جامعة كيب بريتون - كندا (Validated by Cape Breton University, Canada)",

      "contact.tag": "ابدأ مشروعك الآن",
      "contact.title": "جاهز لتحويل رؤيتك المعمارية إلى واقع ملموس؟",
      "contact.desc": "سواء كنت تبحث عن تصميم فيلا فاخرة، تشطيب متكامل لمقرك أو شقتك، أو استشارة معمارية وإشراف هندسي — يسعدني تواصلك المباشر.",
      "contact.phone_call": "اتصال هاتفي",
      "contact.email_label": "البريد الإلكتروني",
      "contact.location": "القاهرة، مصر (Cairo, Egypt) — متاح للعمل الموقعي وعن بُعد للمشاريع الدولية",
      "footer.to_top": "العودة للأعلى ↑"
    },
    en: {
      "nav.name": "Hassan Ahmed",
      "nav.role": "Architect",
      "nav.about": "About",
      "nav.stats": "Achievements",
      "nav.projects": "Projects",
      "nav.experience": "Experience",
      "nav.skills": "Skills & Software",
      "nav.contact": "Contact",

      "hero.badge": "Available for Architectural & Interior Projects",
      "hero.greeting": "Hello, I am",
      "hero.name": "Hassan Ahmed",
      "hero.subtitle": "Architect | Architectural Design & 3D Visualization",
      "hero.desc": "B.Sc. Architecture Engineering from Canadian International College (CIC), validated by Cape Breton University, Canada. Specializing in architectural design, interior design, landscape, and 3D visualization. Proven record of delivering 50+ residential, retail, and industrial projects from concept to final client handover across Egypt's premier developments.",
      "hero.zero_violations": "Zero Code Violations across 30+ Projects",
      "hero.view_work": "Explore Projects",
      "hero.whatsapp": "WhatsApp Chat",
      "hero.avatar_label": "HASSAN AHMED ARCHITECTURE",
      "hero.floating_projects": "Delivered Projects",
      "hero.floating_satisfaction": "Turnkey Excellence",

      "stats.p1_title": "Delivered Projects",
      "stats.p1_desc": "Residential, retail & industrial successfully handed over",
      "stats.p2_title": "Code Violations",
      "stats.p2_desc": "Full compliance across 30+ audited & licensed projects",
      "stats.p3_title": "Engineers Led",
      "stats.p3_desc": "Mentoring and directing architectural & site execution teams",
      "stats.p4_title": "Top Compounds",
      "stats.p4_desc": "Mivida, Mountain View, Orascom, Al-Futtaim, and more",

      "projects.tag": "Featured Work",
      "projects.title": "Curated Architectural Portfolio",
      "projects.subtitle": "Real-world projects managed from theoretical concept through to final client handover",
      "projects.filter_all": "All",
      "projects.filter_retail": "Retail & Commercial",
      "projects.filter_residential": "Luxury Residential",
      "projects.filter_industrial": "Industrial & Construction",
      "projects.view_details": "View Architectural Details",

      "projects.p1_cat": "Retail & Commercial Design",
      "projects.p1_title": "Baxster Italian Retail Store - Mivida (Emaar)",
      "projects.p1_desc": "Led the architectural design of the Egyptian branch of the Italian luxury brand, implementing vintage wood and stone cladding and coordinating all MEP works under tight deadlines.",

      "projects.p2_cat": "Turnkey Residential Fit-out",
      "projects.p2_title": "Hyde Park Apartment - Mountain View",
      "projects.p2_desc": "Delivered a complete interior fit-out from bare shell to client handover, covering MEP systems, refined architectural finishes, and meticulous on-site supervision.",

      "projects.p3_cat": "Industrial Construction & Finishing",
      "projects.p3_title": "Two Industrial Factories - 6th of October",
      "projects.p3_desc": "Contracted as freelance contractor and construction firm owner, executing both factory buildings including reinforced concrete works and full turnkey industrial finishing.",

      "projects.p4_cat": "Industrial Engineering & Handover",
      "projects.p4_title": "Arabia Aluminium Factory",
      "projects.p4_desc": "Executed specialized industrial manufacturing facility from structural shell construction to full architectural and mechanical fit-out complying with strict industrial standards.",

      "exp.tag": "Career History",
      "exp.title": "Demonstrated Professional Track Record",
      "exp.subtitle": "Experience across top-tier real estate developers and engineering studios",
      "exp.r1_role": "Architectural Designer, Residential & Commercial",
      "exp.r1_comp": "Private Architectural Projects",
      "exp.r1_p1": "Direct villa and apartment projects from concept and design through execution and handover, remotely and on-site, within premium compounds (Mivida, Mountain View, Orascom, E-Tapa, Al-Futtaim).",
      "exp.r1_p2": "Contributed to the preliminary concept design for a specialized rehabilitation and detox center in Saudi Arabia.",
      "exp.r1_p3": "Designed and delivered 50+ architectural and interior projects, including working drawings, mood boards, space plans, and 3D visualizations tailored to each client.",
      "exp.r1_p4": "Led a team of 4 architects and engineers, achieving zero code violations across 30 projects.",

      "exp.r2_role": "Architecture Engineer",
      "exp.r2_p1": "Reviewed the development of architectural plans and the seamless integration of interior design concepts with technical documentation.",

      "exp.r3_role": "Architecture Engineer",
      "exp.r3_p1": "Evaluated plan development and emergency-response strategies in strict compliance with Civil Defense and fire-safety codes.",

      "skills.tag": "Core Competencies",
      "skills.title": "Software Proficiency & Field Training",
      "skills.software_title": "Engineering & Visualization Software",
      "skills.training_title": "Field Training & Certifications",
      "skills.t1_title": "Zed Park Project — Orascom (Jan–Feb 2024)",
      "skills.t1_desc": "Hands-on training in curtain walls, thermal/acoustic insulation, and GRC cladding installation.",
      "skills.t2_title": "Linear Park — Redcon Spain (Jul–Aug 2023)",
      "skills.t2_desc": "Site supervision and training in hardscape, softscape, and premium exterior finishes.",
      "skills.t3_title": "Alco Eg (Aluminium & Special Sections)",
      "skills.t3_desc": "Certified professional training in specialized architectural aluminum sections and framing systems.",

      "domain.d1": "Architectural Design",
      "domain.d2": "Interior Design",
      "domain.d3": "Landscape Design",
      "domain.d4": "Urban Planning",
      "domain.d5": "Working Drawings",
      "domain.d6": "3D Visualization",

      "edu.degree": "B.Sc. Architecture Engineering",
      "edu.school": "Canadian International College (CIC), Giza",
      "edu.validation": "Validated by Cape Breton University, Canada (Sep 2019 – Jul 2024)",

      "contact.tag": "Start Your Project",
      "contact.title": "Ready to bring your architectural vision to life?",
      "contact.desc": "Whether you are looking to design a luxury villa, complete a turnkey interior fit-out, or need engineering site supervision — feel free to reach out directly.",
      "contact.phone_call": "Phone Call",
      "contact.email_label": "Direct Email",
      "contact.location": "Cairo, Egypt — Available for on-site & remote international projects",
      "footer.to_top": "Back to Top ↑"
    }
  };

  let currentLang = localStorage.getItem('ha_portfolio_lang') || 'ar';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ha_portfolio_lang', lang);

    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    const langToggleBtn = document.getElementById('langToggle');
    if (langToggleBtn) {
      langToggleBtn.querySelector('.lang-text').textContent = lang === 'ar' ? 'EN' : 'عربي';
    }

    // Update all text nodes with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });
  }

  // Language Toggle Button Event
  const langToggleBtn = document.getElementById('langToggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
    });
  }

  // Initialize Language
  applyLanguage(currentLang);


  // ==========================================
  // 2. Mobile Menu Drawer Navigation
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', openDrawer);
  }

  if (closeDrawerBtn && mobileDrawer) {
    closeDrawerBtn.addEventListener('click', closeDrawer);
  }

  // Close drawer on link click
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });


  // ==========================================
  // 3. Project Filter Tabs
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });


  // ==========================================
  // 4. Smooth Scroll & Active Nav Spy
  // ==========================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link:not(.btn-nav-cta)');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

});
