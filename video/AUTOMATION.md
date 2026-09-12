# אוטומציה: הפקת YouTube Shorts והעלאה אוטומטית

Pipeline מלא שמייצר Short (עובדות מעניינות, "Did You Know?"), עם קריינות
TTS אוטומטית וכתוביות מסונכרנות מילה-אחר-מילה, ומעלה אותו ליוטיוב — ידנית
או בלוח זמנים קבוע (GitHub Actions).

## איך זה עובד

```
scripts/facts.json  →  TTS (OpenAI)  →  Whisper (תזמון מילים)  →  Remotion render  →  YouTube upload
```

1. `scripts/pipeline.ts` בוחר עובדה שעוד לא נוצל מ-`scripts/facts.json`.
2. יוצר קריינות אודיו עם OpenAI TTS.
3. מתמלל את האודיו בחזרה עם Whisper כדי לקבל תזמון מדויק של כל מילה,
   ומזין אותו לקומפוזיציית `FactShort` (`src/FactShort.tsx`) ליצירת כתוביות
   בסגנון TikTok/Shorts (מילה מודגשת בזמן אמת).
4. מרנדר וידאו אנכי (1080x1920) עם `@remotion/renderer`.
5. מעלה אוטומטית ליוטיוב עם ה-YouTube Data API.
6. מסמן את העובדה כ"נוצלה" ב-`facts.json` כדי שלא תחזור שוב.

## הגדרה חד-פעמית

### 1. OpenAI API key (קריינות + תמלול)

1. היכנס ל-https://platform.openai.com/api-keys וצור מפתח.
2. הוסף אשראי/יתרה לחשבון (TTS ו-Whisper הן שירותים בתשלום, אבל זולים
   מאוד לסרטון קצר — סנטים בודדים לכל short).

### 2. YouTube Data API (העלאה אוטומטית)

1. היכנס ל-https://console.cloud.google.com/ וצור פרויקט חדש.
2. תחת "APIs & Services" → "Library", הפעל את **YouTube Data API v3**.
3. תחת "APIs & Services" → "Credentials" → "Create Credentials" →
   "OAuth client ID". בחר סוג **Desktop app** (זה חשוב — זה מאפשר את
   תהליך ה-loopback ללא הגדרת redirect URI ידנית).
4. שמור את ה-Client ID וה-Client Secret.
5. אם הפרויקט במצב "Testing" ב-OAuth consent screen, הוסף את חשבון
   הג'ימייל שמנהל את הערוץ תחת "Test users".

### 3. קבלת Refresh Token (חד-פעמי, **חייב להיות במחשב שלך עם דפדפן**)

זה השלב היחיד שלא ניתן להריץ בסביבה מרוחקת — כי גוגל מפנה את הדפדפן
שלך בחזרה ל-`localhost`, וזה חייב להיות אותו מחשב שבו פתחת את הדפדפן.

במחשב שלך, בתוך תיקיית `video/`:

```bash
npm i
export YOUTUBE_CLIENT_ID=...
export YOUTUBE_CLIENT_SECRET=...
npm run youtube:auth
```

זה יפתח קישור — תפתח אותו בדפדפן, תאשר גישה לערוץ שלך, ותקבל בטרמינל
שורה כמו:

```
YOUTUBE_REFRESH_TOKEN=1//0g...
```

### 4. יצירת קובץ `.env` (להרצה מקומית)

```bash
cp .env.example .env
```

ומלא את הערכים: `OPENAI_API_KEY`, `YOUTUBE_CLIENT_ID`,
`YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`.

**חשוב:** `.env` נמצא ב-`.gitignore` ולעולם לא ייכנס ל-git. אל תדביק את
המפתחות האלה בצ'אט או ב-commit.

## הרצה ידנית

```bash
npm run pipeline            # מייצר short ומעלה אותו ליוטיוב
npm run pipeline -- --no-upload   # רק מרנדר, בלי להעלות (לבדיקה)
```

הסרטון המרונדר נשמר ב-`out/<fact-id>.mp4`.

## אוטומציה מלאה עם GitHub Actions

הקובץ `.github/workflows/daily-short.yml` מריץ את ה-pipeline פעם ביום
(אפשר לשנות את השעה ב-cron), ומעלה סרטון חדש אוטומטית בלי שתצטרך לגעת
בכלום.

כדי להפעיל את זה:

1. בהגדרות הריפו ב-GitHub: **Settings → Secrets and variables →
   Actions → New repository secret**, והוסף:
   - `OPENAI_API_KEY`
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_REFRESH_TOKEN`
2. זהו. ה-workflow ירוץ אוטומטית לפי הלוח זמנים, וגם אפשר להריץ אותו
   ידנית מטאב "Actions" בגיטהאב ("Run workflow").

## הוספת עובדות נוספות

פשוט הוסף אובייקטים נוספים ל-`scripts/facts.json`:

```json
{
  "id": "unique-id",
  "topic": "Did You Know?",
  "text": "הטקסט שהקריין יקריא.",
  "used": false
}
```

## מגבלות וכנות

- זו לא "מכונת כסף" — RPM על Shorts נמוך, וצריך נפח צפיות גדול כדי
  שההכנסה תהיה משמעותית.
- אחריות על תוכן: ודא שהעובדות מדויקות — תוכן שגוי/מטעה עלול להוריד
  אמון וחשיפה, ובמקרים חוזרים אף עלול לפגוע בסטטוס מוניטיזציה של הערוץ.
- כדאי לבדוק את הסרטון הראשון עם `--no-upload` לפני שמפעילים העלאה
  אוטומטית מלאה.
