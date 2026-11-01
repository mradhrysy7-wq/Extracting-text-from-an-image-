// High-fidelity SVG-based realistic sample images converted to base64 data URIs
// These provide instant, reliable testing without network dependencies.

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  description: string;
  recommendedMode: 'raw' | 'formatted' | 'table' | 'receipt' | 'business_card' | 'handwriting';
  dataUrl: string;
}

// 1. Official Arabic Letter Sample
const officialLetterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#fdfcf7; font-family:'Cairo', 'Arial', sans-serif;">
  <rect width="800" height="1100" fill="#fdfbf7"/>
  <rect x="40" y="40" width="720" height="1020" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" rx="6"/>
  
  <!-- Header -->
  <line x1="80" y1="170" x2="720" y2="170" stroke="#0f766e" stroke-width="3"/>
  <text x="700" y="95" text-anchor="end" font-size="20" font-weight="bold" fill="#0f766e">المملكة العربية السعودية</text>
  <text x="700" y="125" text-anchor="end" font-size="16" fill="#334155">هيئة تطوير التقنية والابتكار</text>
  <text x="700" y="150" text-anchor="end" font-size="13" fill="#64748b">الإدارة العامة للتحول الرقمي</text>
  
  <circle cx="400" cy="105" r="35" fill="none" stroke="#0f766e" stroke-width="3"/>
  <text x="400" y="112" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f766e">شعار</text>

  <text x="100" y="95" text-anchor="start" font-size="14" fill="#334155">التاريخ: ١٤٤٦/٠٥/١٥ هـ</text>
  <text x="100" y="125" text-anchor="start" font-size="14" fill="#334155">الرقم: ٤٤٦/١٠٨٩/د</text>
  <text x="100" y="150" text-anchor="start" font-size="14" fill="#334155">المرفقات: (٢)</text>
  
  <!-- Subject -->
  <rect x="180" y="210" width="440" height="45" fill="#f1f5f9" rx="4"/>
  <text x="400" y="240" text-anchor="middle" font-size="17" font-weight="bold" fill="#0f172a">الموضوع: اعتماد خطة التحول الرقمي والذكاء الاصطناعي لعام ٢٠٢٥م</text>
  
  <!-- Salutation -->
  <text x="700" y="300" text-anchor="end" font-size="16" font-weight="bold" fill="#0f172a">سعادة مدراء الإدارات ورؤساء الأقسام المحترمين،</text>
  <text x="700" y="335" text-anchor="end" font-size="15" fill="#334155">السلام عليكم ورحمة الله وبركاته، أما بعد:</text>
  
  <!-- Body Paragraphs -->
  <text x="700" y="380" text-anchor="end" font-size="15" fill="#1e293b">إشارة إلى الأمر السامي الكريم، وبناءً على ما تقتضيه مصلحة العمل الرامية إلى رفع كفاءة</text>
  <text x="700" y="415" text-anchor="end" font-size="15" fill="#1e293b">الخدمات وأتمتة الإجراءات الداخلية بالاعتماد على أحدث تقنيات الذكاء الاصطناعي التوليدي،</text>
  <text x="700" y="450" text-anchor="end" font-size="15" fill="#1e293b">نحيطكم علماً بأنه قد تقرر بدء تطبيق منظومة استخراج النصوص ومعالجة المستندات الرقمية</text>
  <text x="700" y="485" text-anchor="end" font-size="15" fill="#1e293b">اعتباراً من مطلع الشهر القادم وفقاً للبنود التالية:</text>
  
  <!-- Bullet Points -->
  <circle cx="685" cy="540" r="4" fill="#0f766e"/>
  <text x="670" y="545" text-anchor="end" font-size="15" fill="#1e293b">أولاً: أرشفة كافة المعاملات الورقية القديمة وتحويلها إلى نصوص رقمية قابلة للبحث.</text>

  <circle cx="685" cy="585" r="4" fill="#0f766e"/>
  <text x="670" y="590" text-anchor="end" font-size="15" fill="#1e293b">ثانياً: تفعيل التدقيق الآلي والتعرف على الخطوط المكتوبة يدوياً والمستندات الرسمية.</text>

  <circle cx="685" cy="630" r="4" fill="#0f766e"/>
  <text x="670" y="635" text-anchor="end" font-size="15" fill="#1e293b">ثالثاً: عقد ورش تدريبية للموظفين لتعزيز المهارات الرقمية في التعامل مع التقنيات الحديثة.</text>

  <!-- Conclusion -->
  <text x="700" y="710" text-anchor="end" font-size="15" fill="#1e293b">آملين من الجميع التعاون وتسهيل مهام فرق العمل المعنية لتحقيق الأهداف المنشودة.</text>
  <text x="700" y="750" text-anchor="end" font-size="15" font-weight="bold" fill="#0f172a">وتقبلوا وافر التحية والتقدير،،،</text>

  <!-- Signature -->
  <text x="250" y="850" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f766e">المدير العام التنفيذي</text>
  <text x="250" y="885" text-anchor="middle" font-size="17" font-weight="bold" fill="#0f172a">د. عبد الرحمن بن عبد العزيز آل الشيخ</text>
  <path d="M 180 920 Q 240 890 280 940 T 340 920" fill="none" stroke="#1e293b" stroke-width="2.5"/>

  <!-- Footer Seal -->
  <circle cx="580" cy="900" r="50" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 2"/>
  <text x="580" y="895" text-anchor="middle" font-size="13" font-weight="bold" fill="#dc2626">خاتم الإدارة العامة</text>
  <text x="580" y="915" text-anchor="middle" font-size="11" fill="#dc2626">معتمد رقمياً</text>
</svg>`;

// 2. Arabic Tax Invoice Sample (Receipt / Table)
const invoiceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 950" width="600" height="950" style="background:#ffffff; font-family:'Cairo', 'Arial', sans-serif;">
  <rect width="600" height="950" fill="#fafafa"/>
  <rect x="25" y="25" width="550" height="900" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" rx="8"/>

  <!-- Store Header -->
  <text x="300" y="80" text-anchor="middle" font-size="22" font-weight="900" fill="#1e293b">أسواق ومكتبة النور الحديثة</text>
  <text x="300" y="110" text-anchor="middle" font-size="14" fill="#64748b">الرياض - حي الملز - طريق صلاح الدين</text>
  <text x="300" y="135" text-anchor="middle" font-size="13" fill="#64748b">الرقم الضريبي: 310245678900003</text>
  
  <rect x="200" y="155" width="200" height="30" fill="#f8fafc" stroke="#e2e8f0" rx="4"/>
  <text x="300" y="176" text-anchor="middle" font-size="14" font-weight="bold" fill="#0f766e">فاتورة ضريبية مبسطة</text>
  
  <line x1="50" y1="205" x2="550" y2="205" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="5 5"/>

  <!-- Invoice Meta -->
  <text x="540" y="235" text-anchor="end" font-size="13" fill="#334155">رقم الفاتورة: INV-2025-0894</text>
  <text x="60" y="235" text-anchor="start" font-size="13" fill="#334155">التاريخ: 2025/03/12 - 14:45</text>
  <text x="540" y="260" text-anchor="end" font-size="13" fill="#334155">الكاشير: أحمد عثمان</text>
  <text x="60" y="260" text-anchor="start" font-size="13" fill="#334155">طريقة الدفع: مدى (Mada POS)</text>

  <!-- Table Header -->
  <rect x="50" y="285" width="500" height="35" fill="#f1f5f9"/>
  <text x="535" y="308" text-anchor="end" font-size="13" font-weight="bold" fill="#1e293b">الصنف</text>
  <text x="320" y="308" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">الكمية</text>
  <text x="210" y="308" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">السعر</text>
  <text x="80" y="308" text-anchor="start" font-size="13" font-weight="bold" fill="#1e293b">الإجمالي</text>

  <!-- Table Rows -->
  <g fill="#334155" font-size="13">
    <text x="535" y="350" text-anchor="end">دفتر جامعي سلك 200 ورقة</text>
    <text x="320" y="350" text-anchor="middle">2</text>
    <text x="210" y="350" text-anchor="middle">18.00</text>
    <text x="80" y="350" text-anchor="start">36.00 ر.س</text>
    <line x1="50" y1="365" x2="550" y2="365" stroke="#f1f5f9"/>

    <text x="535" y="395" text-anchor="end">طقم أقلام حبر جاف أزرق (12 قلم)</text>
    <text x="320" y="395" text-anchor="middle">1</text>
    <text x="210" y="395" text-anchor="middle">24.50</text>
    <text x="80" y="395" text-anchor="start">24.50 ر.س</text>
    <line x1="50" y1="410" x2="550" y2="410" stroke="#f1f5f9"/>

    <text x="535" y="440" text-anchor="end">كتاب الذكاء الاصطناعي وتطبيقاته</text>
    <text x="320" y="440" text-anchor="middle">1</text>
    <text x="210" y="440" text-anchor="middle">65.00</text>
    <text x="80" y="440" text-anchor="start">65.00 ر.س</text>
    <line x1="50" y1="455" x2="550" y2="455" stroke="#f1f5f9"/>

    <text x="535" y="485" text-anchor="end">ورق طباعة A4 دبل إيه (500 ورقة)</text>
    <text x="320" y="485" text-anchor="middle">3</text>
    <text x="210" y="485" text-anchor="middle">22.00</text>
    <text x="80" y="485" text-anchor="start">66.00 ر.س</text>
    <line x1="50" y1="500" x2="550" y2="500" stroke="#f1f5f9"/>

    <text x="535" y="530" text-anchor="end">آلة حاسبة علمية كاسيو FX-991</text>
    <text x="320" y="530" text-anchor="middle">1</text>
    <text x="210" y="530" text-anchor="middle">95.00</text>
    <text x="80" y="530" text-anchor="start">95.00 ر.س</text>
  </g>

  <!-- Totals Section -->
  <line x1="50" y1="565" x2="550" y2="565" stroke="#334155" stroke-width="1.5"/>

  <text x="540" y="600" text-anchor="end" font-size="14" fill="#64748b">المجموع الفرعي الخاضع للضريبة:</text>
  <text x="80" y="600" text-anchor="start" font-size="14" font-weight="bold" fill="#1e293b">286.50 ر.س</text>

  <text x="540" y="635" text-anchor="end" font-size="14" fill="#64748b">ضريبة القيمة المضافة (15%):</text>
  <text x="80" y="635" text-anchor="start" font-size="14" font-weight="bold" fill="#1e293b">42.98 ر.س</text>

  <rect x="50" y="660" width="500" height="50" fill="#0f766e" rx="6"/>
  <text x="525" y="693" text-anchor="end" font-size="17" font-weight="bold" fill="#ffffff">المبلغ الإجمالي المستحق:</text>
  <text x="80" y="693" text-anchor="start" font-size="20" font-weight="900" fill="#ffffff">329.48 ر.س</text>

  <!-- QR Code Mockup -->
  <rect x="250" y="735" width="100" height="100" fill="#ffffff" stroke="#000000" stroke-width="2"/>
  <rect x="260" y="745" width="25" height="25" fill="#000000"/>
  <rect x="315" y="745" width="25" height="25" fill="#000000"/>
  <rect x="260" y="800" width="25" height="25" fill="#000000"/>
  <rect x="295" y="775" width="10" height="10" fill="#000000"/>
  <rect x="315" y="800" width="15" height="15" fill="#000000"/>

  <text x="300" y="865" text-anchor="middle" font-size="12" fill="#64748b">شكراً لزيارتكم - البضاعة المباعة ترد خلال 7 أيام</text>
  <text x="300" y="885" text-anchor="middle" font-size="11" fill="#94a3b8">www.alnoor-stationery.com</text>
</svg>`;

// 3. Arabic Handwriting Sample (ملاحظات بخط اليد)
const handwritingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 800" width="700" height="800" style="background:#fefae0; font-family:'Cairo', 'Arial', sans-serif;">
  <rect width="700" height="800" fill="#fffdfa"/>
  
  <!-- Lined Notebook background -->
  <g stroke="#e2e8f0" stroke-width="1.2">
    <line x1="50" y1="120" x2="650" y2="120"/>
    <line x1="50" y1="180" x2="650" y2="180"/>
    <line x1="50" y1="240" x2="650" y2="240"/>
    <line x1="50" y1="300" x2="650" y2="300"/>
    <line x1="50" y1="360" x2="650" y2="360"/>
    <line x1="50" y1="420" x2="650" y2="420"/>
    <line x1="50" y1="480" x2="650" y2="480"/>
    <line x1="50" y1="540" x2="650" y2="540"/>
    <line x1="50" y1="600" x2="650" y2="600"/>
    <line x1="50" y1="660" x2="650" y2="660"/>
  </g>
  <line x1="620" y1="60" x2="620" y2="740" stroke="#fca5a5" stroke-width="1.5"/>

  <!-- Handwritten Style Arabic Content -->
  <text x="590" y="112" text-anchor="end" font-size="24" font-weight="bold" fill="#1e3a8a" transform="rotate(-1 590 112)">ملاحظات اجتماع مشروع الذكاء الاصطناعي</text>
  <text x="100" y="110" text-anchor="start" font-size="16" fill="#1e3a8a">الأحد: ١٨ رجب</text>

  <text x="590" y="172" text-anchor="end" font-size="20" fill="#1e3a8a" transform="rotate(0.5 590 172)">١. مراجعة نموذج التعرف على النصوص باللغة العربية بدقة ٩٩٪</text>
  
  <text x="590" y="232" text-anchor="end" font-size="20" fill="#1e3a8a" transform="rotate(-0.8 590 232)">٢. التواصل مع فريق التصميم لتحسين واجهة المستخدم وتطبيق الوضع الليلي</text>

  <text x="590" y="292" text-anchor="end" font-size="20" fill="#1e3a8a" transform="rotate(1.2 590 292)">٣. تجهيز ملفات الفواتير والخطابات الرسمية للاختبار النهائي</text>

  <text x="590" y="352" text-anchor="end" font-size="20" fill="#1e3a8a" transform="rotate(-0.4 590 352)">٤. موعد إطلاق النسخة التجريبية للمستخدمين يوم الخميس القادم بمشيئة الله</text>

  <rect x="120" y="420" width="460" height="150" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" rx="6" opacity="0.8" transform="rotate(-1.5 350 495)"/>
  <text x="550" y="460" text-anchor="end" font-size="19" font-weight="bold" fill="#854d0e">تنبيه هام جداً:</text>
  <text x="550" y="500" text-anchor="end" font-size="18" fill="#713f12">يجب التأكد من دعم قراءة النصوص المشكولة</text>
  <text x="550" y="535" text-anchor="end" font-size="18" fill="#713f12">وإتاحة خيار إزالة التشكيل أو الإبقاء عليه حسب رغبة المستخدم!</text>

  <text x="200" y="650" text-anchor="middle" font-size="22" font-weight="bold" fill="#1e3a8a" transform="rotate(2 200 650)">تمت مراجعة الخطة والاعتماد ✓</text>
</svg>`;

// 4. Business Card Sample
const businessCardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 420" width="700" height="420" style="background:#0f172a; font-family:'Cairo', 'Arial', sans-serif;">
  <rect width="700" height="420" fill="#0f172a" rx="16"/>
  <rect x="15" y="15" width="670" height="390" fill="#1e293b" stroke="#334155" stroke-width="2" rx="12"/>

  <!-- Decorative element -->
  <path d="M 450 15 L 685 15 L 685 240 Z" fill="#0f766e" opacity="0.85"/>
  <circle cx="590" cy="95" r="35" fill="#ffffff" opacity="0.15"/>

  <!-- Person Info -->
  <text x="420" y="115" text-anchor="end" font-size="28" font-weight="900" fill="#ffffff">م. سلمان بن خالد التميمي</text>
  <text x="420" y="150" text-anchor="end" font-size="17" font-weight="bold" fill="#14b8a6">كبير مهندسي الذكاء الاصطناعي السحابي</text>
  <text x="420" y="175" text-anchor="end" font-size="14" fill="#94a3b8">شركة المدى المتقدمة للحلول الرقمية</text>

  <line x1="80" y1="210" x2="620" y2="210" stroke="#334155" stroke-width="1.5"/>

  <!-- Contacts -->
  <g fill="#e2e8f0" font-size="14">
    <text x="600" y="250" text-anchor="end">📱 هاتف: +966 50 123 4567</text>
    <text x="600" y="290" text-anchor="end">✉️ البريد: salman.tamimi@almada-tech.sa</text>
    <text x="600" y="330" text-anchor="end">🌐 الموقع: www.almada-tech.sa</text>
    <text x="600" y="370" text-anchor="end">📍 العنوان: واحة الملك سلمان للعلوم - الرياض، المملكة العربية السعودية</text>
  </g>
</svg>`;

// Convert SVG string to data URI
function svgToDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg.trim())
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'official_letter',
    title: 'خطاب رسمي حكومي',
    category: 'مستندات رسمية',
    description: 'خطاب رسمي مروّس يحتوي على توجيهات، وتاريخ، وتوقيع وخاتم معتمد.',
    recommendedMode: 'formatted',
    dataUrl: svgToDataUri(officialLetterSvg),
  },
  {
    id: 'tax_invoice',
    title: 'فاتورة ضريبية وإيصال',
    category: 'فواتير وإيصالات',
    description: 'فاتورة مشتريات مع تفاصيل الأصناف، والكميات، وضريبة القيمة المضافة والإجمالي.',
    recommendedMode: 'receipt',
    dataUrl: svgToDataUri(invoiceSvg),
  },
  {
    id: 'handwriting_notes',
    title: 'ملاحظات بخط اليد',
    category: 'خط يد وملاحظات',
    description: 'ورقة مفكرة مسطرة تحتوي على بنود وملاحظات مكتوبة يدوياً مع صندوق تنبيه ملون.',
    recommendedMode: 'handwriting',
    dataUrl: svgToDataUri(handwritingSvg),
  },
  {
    id: 'business_card',
    title: 'بطاقة عمل (كرت شخصي)',
    category: 'بطاقات عمل',
    description: 'بطاقة هوية عمل لمهندس ذكاء اصطناعي تتضمن معلومات الاتصال والموقع.',
    recommendedMode: 'business_card',
    dataUrl: svgToDataUri(businessCardSvg),
  },
];
