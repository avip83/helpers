# 🔧 הגדרת Google Apps Script - מדריך מפורט

מדריך שלב אחר שלב להגדרת חיבור דף הנחיתה לגוגל שיטס.

## 📋 סקירה כללית

Google Apps Script מאפשר לנו לקבל את הנתונים מהטופס ולשמור אותם ישירות בגוגל שיטס. זה הפתרון הפשוט והחינמי ביותר למסד נתונים.

## 🚀 שלב 1: יצירת Google Sheets

### 1.1 יצירת הגיליון
1. עבור ל-[Google Sheets](https://sheets.google.com)
2. לחץ על **+ ריק** ליצירת גיליון חדש
3. תן לגיליון שם משמעותי, למשל: "נפגעי מלחמה - בקשות סיוע"

### 1.2 קבלת מזהה הגיליון
1. העתק את ה-URL של הגיליון
2. המזהה נמצא בין `/d/` ל-`/edit`:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit#gid=0
   ```
3. שמור את המזהה בצד - תצטרך אותו בהמשך

## 🛠️ שלב 2: יצירת Google Apps Script

### 2.1 פתיחת הפלטפורמה
1. עבור ל-[Google Apps Script](https://script.google.com)
2. לחץ על **+ פרויקט חדש**
3. תן שם לפרויקט, למשל: "טופס נפגעי מלחמה"

### 2.2 הדבקת הקוד
מחק את כל הקוד הקיים והדבק את הקוד הבא:

```javascript
// הגדרות הגיליון - החלף במזהה שלך
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

function doPost(e) {
  try {
    // פתיחת הגיליון
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // בדיקה אם זו ההרצה הראשונה - יצירת כותרות
    if (sheet.getLastRow() === 0) {
      createHeaders(sheet);
    }
    
    // הוספת הנתונים
    addDataRow(sheet, data);
    
    // החזרת תשובה מוצלחת
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'הנתונים נשמרו בהצלחה',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // רישום השגיאה ביומן
    Logger.log('Error in doPost: ' + error.toString());
    
    // החזרת שגיאה למשתמש
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createHeaders(sheet) {
  const headers = [
    'תאריך וזמן קבלה',
    'שם פרטי',
    'שם משפחה',
    'מספר טלפון',
    'כתובת אימייל',
    'מספר תעודת זהות',
    'עיר מגורים',
    'רחוב',
    'מספר בית',
    'מספר דירה',
    'מיקוד',
    'סוג הנכס',
    'גודל הנכס במ"ר',
    'מספר חדרים',
    'תאריך הנזק',
    'סוג הנזק',
    'תיאור מפורט של הנזק',
    'הערכת עלות התיקון',
    'קיים ביטוח נכס',
    'שם חברת הביטוח',
    'הוגשה תביעה בעבר',
    'רמת דחיפות',
    'הערות נוספות',
    'מצב טיפול',
    'הערות צוות'
  ];
  
  // הוספת הכותרות לשורה הראשונה
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // עיצוב הכותרות
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  
  // הגדרת רוחב עמודות
  sheet.setColumnWidth(1, 150); // תאריך
  sheet.setColumnWidth(2, 100); // שם פרטי
  sheet.setColumnWidth(3, 100); // שם משפחה
  sheet.setColumnWidth(4, 120); // טלפון
  sheet.setColumnWidth(5, 180); // אימייל
  sheet.setColumnWidth(17, 300); // תיאור נזק
  sheet.setColumnWidth(23, 200); // הערות נוספות
}

function addDataRow(sheet, data) {
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
    getPropertyTypeText(data.propertyType),
    data.propertySize || '',
    data.rooms || '',
    data.damageDate || '',
    data.damageType || '',
    data.damageDescription || '',
    data.estimatedValue || '',
    getInsuranceText(data.hasInsurance),
    data.insuranceCompany || '',
    getPreviousClaimText(data.previousClaim),
    getUrgencyText(data.urgency),
    data.additionalInfo || '',
    'חדש', // מצב טיפול ברירת מחדל
    '' // הערות צוות - ריק בהתחלה
  ];
  
  // הוספת השורה
  sheet.appendRow(row);
  
  // עיצוב השורה החדשה
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(lastRow, 1, 1, row.length);
  
  // מסגרת לשורה
  range.setBorder(true, true, true, true, false, false);
  
  // צבע רקע לפי דחיפות
  if (data.urgency === 'critical') {
    range.setBackground('#ffebee'); // אדום בהיר
  } else if (data.urgency === 'high') {
    range.setBackground('#fff3e0'); // כתום בהיר
  }
  
  // הדגשת מספר הטלפון
  sheet.getRange(lastRow, 4).setFontWeight('bold');
}

// פונקציות עזר לתרגום ערכים
function getPropertyTypeText(type) {
  const types = {
    'apartment': 'דירה',
    'house': 'בית פרטי',
    'business': 'נכס מסחרי',
    'office': 'משרד',
    'other': 'אחר'
  };
  return types[type] || type || '';
}

function getInsuranceText(hasInsurance) {
  if (hasInsurance === 'yes') return 'כן';
  if (hasInsurance === 'no') return 'לא';
  return '';
}

function getPreviousClaimText(previousClaim) {
  if (previousClaim === 'yes') return 'כן';
  if (previousClaim === 'no') return 'לא';
  return '';
}

function getUrgencyText(urgency) {
  const urgencyLevels = {
    'low': 'נמוכה',
    'medium': 'בינונית',
    'high': 'גבוהה',
    'critical': 'קריטית'
  };
  return urgencyLevels[urgency] || urgency || '';
}

// פונקציה לבדיקת החיבור (אופציונלי)
function testConnection() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    Logger.log('חיבור תקין! שם הגיליון: ' + sheet.getName());
    return true;
  } catch (error) {
    Logger.log('שגיאה בחיבור: ' + error.toString());
    return false;
  }
}
```

### 2.3 החלפת מזהה הגיליון
1. מצא את השורה:
   ```javascript
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
   ```
2. החלף `YOUR_GOOGLE_SHEET_ID_HERE` במזהה הגיליון שלך

### 2.4 שמירה ובדיקה
1. לחץ **Ctrl+S** לשמירה
2. לחץ על **testConnection** בתפריט הפונקציות ולחץ **Run** לבדיקת החיבור
3. אם יש שגיאות הרשאות, תאשר את ההרשאות הנדרשות

## 🚀 שלב 3: פרסום הסקריפט

### 3.1 יצירת דפלויי
1. לחץ על **Deploy** (פרסום) בפינה הימנית העליונה
2. בחר **New deployment** (פריסה חדשה)
3. לחץ על סמל הגלגל השיניים ליד "Select type"
4. בחר **Web app** (אפליקציית ווב)

### 3.2 הגדרת ההרשאות
הגדר את הפרטים הבאים:
- **Description**: תיאור כמו "טופס נפגעי מלחמה v1.0"
- **Execute as**: **Me** (כך הסקריפט ירוץ עם ההרשאות שלך)
- **Who has access**: **Anyone** (כך כל אחד יוכל לשלוח טופס)

### 3.3 פרסום והעתקת URL
1. לחץ **Deploy**
2. אשר את ההרשאות אם נדרש
3. העתק את ה-**Web app URL** שמופיע
4. שמור אותו בצד - תצטרך אותו בשלב הבא

## 🔗 שלב 4: חיבור הדף לסקריפט

### 4.1 עדכון קובץ JavaScript
1. פתח את הקובץ `script.js` בפרויקט שלך
2. מצא את השורה:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. החלף `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` ב-URL שקיבלת בשלב הקודם

### 4.2 בדיקת החיבור
1. פתח את הדף `index.html` בדפדפן
2. מלא את הטופס בנתונים לבדיקה
3. לחץ שלח
4. בדוק שהנתונים מגיעים לגיליון

## ✅ שלב 5: וויפיקציה ובדיקות

### 5.1 בדיקות בסיסיות
- [ ] הטופס נשלח ללא שגיאות
- [ ] הנתונים מופיעים בגיליון
- [ ] הכותרות מופיעות נכון
- [ ] התאריכים מוצגים בפורמט הנכון

### 5.2 בדיקות מתקדמות
- [ ] שליחת טופס עם שדות ריקים
- [ ] שליחת מספר טפסים ברצף
- [ ] בדיקה ממכשירים שונים (נייד/דסקטופ)

### 5.3 טיפול בשגיאות נפוצות

#### "Script function not found"
- בדוק שפרסמת את הסקריפט מחדש
- וודא שיש פונקציה בשם `doPost`

#### "Permission denied"
- בדוק שההרשאות מוגדרות ל-"Anyone"
- נסה לפרסם מחדש

#### "Invalid JSON"
- בדוק שהנתונים נשלחים בפורמט JSON תקין
- הוסף `console.log` לבדיקה

## 🔄 שלב 6: עדכונים ותחזוקה  

### 6.1 עדכון הסקריפט
כשאתה רוצה לעדכן:
1. ערוך את הקוד ב-Google Apps Script
2. שמור
3. לחץ **Deploy > Manage deployments**
4. לחץ על העט ליד הדפלויי הקיים
5. שנה את הגרסה ל-"New version"
6. לחץ **Deploy**

### 6.2 גיבוי הנתונים
- גוגל שיטס עושה גיבוי אוטומטי
- מומלץ להוריד העתק מדי פעם (File > Download)
- שקול שיתוף הגיליון עם בעלי תפקידים נוספים

### 6.3 מעקב ודוחות
נצל את היכולות של גוגל שיטס:
- יצירת גרפים וסטטיסטיקות
- סינון ומיון הנתונים
- יצירת דפי סיכום

## 🆘 פתרון בעיות נפוצות

### CORS Errors
אם מקבל שגיאות CORS:
1. וודא שה-URL של הסקריפט נכון
2. בדוק שההרשאות מוגדרות נכון
3. נסה לפתוח את הדף מ-localhost או מדומיין רשמי

### שגיאות רשת
- בדוק חיבור לאינטרנט
- נסה שוב מאוחר יותר (ייתכנו בעיות זמניות בגוגל)
- בדוק שה-URL לא השתנה

### נתונים לא מופיעים
- בדוק את הלוגים ב-Google Apps Script
- וודא שמזהה הגיליון נכון
- בדוק שיש הרשאות כתיבה

## 📞 צריך עזרה?

אם נתקעת בתהליך:
1. בדוק את הלוגים ב-Google Apps Script (View > Logs)
2. השתמש ב-Developer Tools בדפדפן (F12)
3. חפש בגוגל את הודעת השגיאה הספציפית
4. שאל בקהילות כמו Stack Overflow

---

**💡 טיפ**: שמור את כל ה-URLs וקודי המזהה במסמך נפרד לשימוש עתידי! 