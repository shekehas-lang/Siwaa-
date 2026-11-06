// دالة خادمية: تستقبل النص من الصفحة وتستدعي Claude بمفتاحك السري
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const TYPES = "gender | disability | origin | social | age | family";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && event.headers.origin !== allowed) return { statusCode: 403, body: "Forbidden" };

  let text = "";
  try { text = String(JSON.parse(event.body).text || "").trim().slice(0, 4000); }
  catch (e) { return { statusCode: 400, body: "Bad Request" }; }
  if (!text) return { statusCode: 400, body: "Empty" };

  const prompt = `أنت خبير في حقوق الإنسان وعدم التمييز. حلّل النص التالي واكشف كل عبارة تحمل تحيزًا غير مباشر أو أثرًا تمييزيًا خفيًا، حتى لو خلا النص من أي كلمة تمييز صريحة، مع التركيز على ما قد يخالف مبادئ حقوق الإنسان (عدم التمييز، المساواة أمام القانون، الحق في العمل والضمان الاجتماعي والسكن، حقوق المرأة وذوي الإعاقة والطفل).
القواعد:
- phrase مقتطعة حرفيًا من النص كما وردت تمامًا (نسخ مطابق).
- type واحد من: ${TYPES} (gender جندري، disability إعاقة وصحة، origin أصل وجنسية وإقامة، social أصل اجتماعي وطبقي، age عمر، family حالة أسرية ورعاية).
- w رقم من 5 إلى 25 يمثل شدة الأثر.
- tip جملة عربية قصيرة تبيّن من يتضرر ولماذا.
- hr مرجع حقوقي مختصر ومؤكد (مثل CEDAW م11 أو CRPD م27 أو ICESCR م9). لا تخترع أرقام مواد، وإن لم تتأكد فاكتب المبدأ العام فقط.
- rep صياغة بديلة محايدة قصيرة.
- لا تُدرج الشروط المشروعة والمبررة موضوعيًا. إن كان النص سليمًا فأعد hits فارغة.
أعد JSON فقط بهذا الشكل: {"hits":[{"phrase":"","type":"","w":0,"tip":"","hr":"","rep":""}]}

النص:
${text}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
    });
    if (!r.ok) return { statusCode: 502, body: "Upstream error" };
    const d = await r.json();
    const out = (d.content || []).map((c) => c.text || "").join("");
    const m = out.match(/\{[\s\S]*\}/);
    let json = { hits: [] };
    try { json = JSON.parse(m[0]); } catch (e) {}
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(json) };
  } catch (e) {
    return { statusCode: 500, body: "Server error" };
  }
};
