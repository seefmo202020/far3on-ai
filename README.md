# فرعون AI

موقع AI فيه: شات أسئلة عامة (DeepSeek V4.1 Flash المجاني) + توليد صور + توليد فيديو + تحويل نص لصوت. كله شغال بمفتاح SandBase واحد.

## التشغيل على Vercel (من الموبايل)

1. ارفع الملفات دي على ريبو GitHub جديد (Public أو Private).
2. افتح vercel.com وسجّل دخول بحساب GitHub.
3. Add New → Project → اختار الريبو → Deploy.
4. مهم جداً: قبل أو بعد الـDeploy روح Settings → Environment Variables وأضف:
   - Name: `SANDBASE_API_KEY`
   - Value: مفتاح SandBase بتاعك (sk-...)
   ثم Redeploy.

المفتاح مش موجود في الكود نهائياً عشان محدش يسرقه من الريبو.

## التركيب

- `index.html` — الواجهة كلها (شات / صور / فيديو / صوت).
- `api/chat.js` — بروكسي لشات DeepSeek المجاني.
- `api/run.js` — بروكسي لتوليد الصور والفيديو والصوت (Run API بتاع SandBase).

## الموديلات المستخدمة (متجربة وشغالة على المفتاح المجاني)

- شات: `deepseek/deepseek-v4.1-flash:free`
- صور: `z-image/turbo`
- فيديو: `minimax/h3-max-turbo/text-to-video`
- صوت: `alibaba/qwen-3-tts/0.6b`
