سواء: خطوات النشر على Netlify

1) ارفع محتويات هذا المجلد كما هي إلى مستودع GitHub جديد.
2) في netlify.com: Add new site > Import from Git، واختر المستودع. اترك الإعدادات كما هي.
3) من Site configuration > Environment variables أضف:
   ANTHROPIC_API_KEY = مفتاحك من console.anthropic.com   (إجباري)
   ALLOWED_ORIGIN    = رابط موقعك مثل https://siwaa.netlify.app   (اختياري، يمنع غيرك من استعمال المفتاح)
   CLAUDE_MODEL      = اسم نموذج آخر (اختياري)
4) من Deploys اضغط Trigger deploy لتفعيل المتغيرات.
5) افتح الموقع: سيظهر الزر البرتقالي «تحليل بالذكاء الاصطناعي».
