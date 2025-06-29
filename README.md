# עזרא - דף נחיתה לסיוע לנפגעי מלחמה 🇮🇱

דף נחיתה מקצועי לאיסוף פרטי נפגעי מלחמה ושליחתם ישירות לגוגל שיטס למעקב ניהול יעיל.

## ✨ תכונות

- 📱 **רספונסיבי** - עובד מושלם על כל המכשירים
- 🔒 **בטוח** - כל הנתונים מוצפנים ומוגנים
- ⚡ **מהיר** - טעינה מהירה וחוויית משתמש חלקה
- 🎯 **ממוקד** - טופס מותאם במיוחד לנפגעי מלחמה
- 📊 **מחובר לגוגל שיטס** - מסד נתונים אוטומטי
- ✅ **ולידציה חכמה** - וולידציה בזמן אמת של כל השדות

## 🚀 התחלה מהירה

### 1. הורדת הקבצים
```bash
git clone [your-repo-url]
cd EZRA
```

### 2. פתיחת הדף
פתח את הקובץ `index.html` בדפדפן או העלה לשרת ווב.

### 3. הגדרת Google Apps Script (חובה!)

#### שלב א': יצירת Google Sheets
1. עבור ל-[Google Sheets](https://sheets.google.com)
2. צור גיליון חדש
3. שמור את המזהה של הגיליון (מה-URL)

#### שלב ב': יצירת Google Apps Script
1. עבור ל-[Google Apps Script](https://script.google.com)
2. לחץ על "פרויקט חדש"
3. מחק את הקוד הקיים והדבק את הקוד הבא:

```javascript
function doPost(e) {
  try {
    // החלף את המזהה בגיליון שלך
    const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // יצירת כותרות (רק בפעם הראשונה)
    if (sheet.getLastRow() === 0) {
      const headers = [
        'תאריך וזמן',
        'שם פרטי',
        'שם משפחה', 
        'טלפון',
        'אימייל',
        'תעודת זהות',
        'עיר',
        'רחוב',
        'מספר בית',
        'דירה',
        'מיקוד',
        'סוג נכס',
        'גודל נכס (מ"ר)',
        'מספר חדרים',
        'תאריך הנזק',
        'סוג הנזק',
        'תיאור הנזק',
        'הערכת עלות תיקון',
        'יש ביטוח',
        'חברת ביטוח',
        'תביעה קודמת',
        'דרגת דחיפות',
        'הערות נוספות'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // עיצוב כותרות
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
    }
    
    // הוספת הנתונים
    const row = [
      data.timestamp || new Date().toLocaleString('he-IL'),
      data.firstName || '',
      data.lastName || '',
      data.phone || '',
      data.email || '',
      data.idNumber || '',
      data.city || '',
      data.street || '',
      data.houseNumber || '',
      data.apartment || '',
      data.zipCode || '',
      data.propertyType || '',
      data.propertySize || '',
      data.rooms || '',
      data.damageDate || '',
      data.damageType || '',
      data.damageDescription || '',
      data.estimatedValue || '',
      data.hasInsurance || '',
      data.insuranceCompany || '',
      data.previousClaim || '',
      data.urgency || '',
      data.additionalInfo || ''
    ];
    
    sheet.appendRow(row);
    
    // הגדרת עיצוב לשורה החדשה
    const lastRow = sheet.getLastRow();
    const range = sheet.getRange(lastRow, 1, 1, row.length);
    range.setBorder(true, true, true, true, false, false);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

#### שלב ג': פרסום הסקריפט
1. שמור את הפרויקט (Ctrl+S)
2. לחץ על "Deploy" (פרסום) > "New deployment" (פריסה חדשה)
3. לחץ על סמל הגלגל השיניים ובחר "Web app"
4. הגדר:
   - **Execute as**: Me
   - **Who has access**: Anyone
5. לחץ "Deploy"
6. העתק את ה-URL שתקבל

#### שלב ד': חיבור לדף
1. פתח את הקובץ `script.js`
2. מצא את השורה:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. החלף את `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` ב-URL שהעתקת

## 📋 שדות הטופס

הטופס כולל את השדות הבאים:

### פרטים אישיים
- ✅ שם פרטי (חובה)
- ✅ שם משפחה (חובה) 
- ✅ טלפון (חובה)
- אימייל (אופציונלי)
- ✅ תעודת זהות (חובה)

### כתובת הנכס הפגוע
- ✅ עיר (חובה)
- ✅ רחוב (חובה)
- ✅ מספר בית (חובה)
- דירה (אופציונלי)
- מיקוד (אופציונלי)

### סוג הנכס
- ✅ סוג נכס (חובה) - דירה/בית פרטי/נכס מסחרי/משרד/אחר
- גודל הנכס במ"ר (אופציונלי)
- מספר חדרים (אופציונלי)

### פרטי הנזק
- ✅ תאריך הנזק (חובה)
- ✅ סוג הנזק (חובה) - רקטה/רסיסים/פיצוץ/שריפה/אחר
- ✅ תיאור הנזק (חובה)
- הערכת עלות התיקון (אופציונלי)

### ביטוח
- יש ביטוח נכס? (כן/לא)
- חברת הביטוח (אם יש ביטוח)

### מידע נוסף
- האם הוגשה כבר תביעה? (כן/לא)
- דרגת דחיפות (נמוכה/בינונית/גבוהה/קריטית)
- הערות נוספות (אופציונלי)
- ✅ הסכמה לפניות (חובה)

## 🎨 עיצוב והתאמה אישית

### שינוי צבעים
ערוך את הקובץ `styles.css` ושנה את המשתנים:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48CAE4;
  --error-color: #dc3545;
}
```

### שינוי שם ולוגו
ערוך את הקובץ `index.html` בקטע ה-hero:
```html
<h1 class="hero-title">
    <i class="fas fa-heart text-red"></i>
    השם החדש שלך
</h1>
```

## 🌐 הצעות דומיין

- `ezra-legal.co.il`
- `war-claims.co.il`
- `legal-support.co.il`
- `nifgaei-milchama.co.il`
- `mishpat-ezra.co.il`

## 📱 תמיכה במכשירים

הדף מותאם לכל המכשירים:
- 💻 דסקטופ
- 💻 לפטופ  
- 📱 טלפון נייד
- 📱 טאבלט

## 🔧 פתרון בעיות נפוצות

### הטופס לא נשלח
1. בדוק שהגדרת את Google Apps Script נכון
2. וודא שהחלפת את ה-URL בקובץ `script.js`
3. בדוק שהגיליון זמין וניתן לעריכה

### שגיאת CORS
הוסף את הדומיין שלך לרשימת הדומיינים המורשים ב-Google Apps Script.

### הנתונים לא מגיעים לגיליון
1. בדוק שמזהה הגיליון נכון
2. וודא שיש הרשאות כתיבה לגיליון
3. בדוק את הלוגים ב-Google Apps Script

## 🚀 העלאה לשרת

### אחסון חינמי מומלץ:
- [Vercel](https://vercel.com) - לחץ deploy ותן קישור לגיט
- [Netlify](https://netlify.com) - גרור והשלך את התיקייה
- [GitHub Pages](https://pages.github.com) - העלה לגיטהאב והפעל Pages

### אחסון מקצועי:
- [Hostinger](https://hostinger.com)
- [Bluehost](https://bluehost.com) 
- שרת VPS

## 📞 תמיכה

לתמיכה טכנית או שאלות:
- 📧 אימייל: [your-email@domain.com]
- 📱 טלפון: [your-phone]
- 💬 WhatsApp: [your-whatsapp]

## 📄 רישיון

הפרויקט הזה נוצר במיוחד לסיוע לנפגעי מלחמה. 
ניתן לשימוש חופשי למטרות צדקה וסיוע.

---

**💙 נוצר מתוך רצון לעזור לעם ישראל בזמן קשה**

> "מי שמציל נפש אחת מישראל כאילו הציל עולם ומלואו" 