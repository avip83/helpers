// Google Apps Script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwh96H9Z-Hc3n2QWxMe5ElMmOrYfJUMZZSVJE-lBpiaMqEG_gLH1okRewRCCs6sKdnI/exec';

// DOM Elements
const form = document.getElementById('damageForm');
const successMessage = document.getElementById('successMessage');

// Form Submission Handler
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<div class="loading"></div> שולח...';
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = new FormData(form);
        
        // Send to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Show success message
            form.style.display = 'none';
            successMessage.style.display = 'block';
            
            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth' });
        } else {
            throw new Error('שגיאה בשליחה');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('אירעה שגיאה בשליחת הטופס. אנא נסה שוב.');
        
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});

// Clear form function
function clearAllFormData() {
    if (confirm('האם אתה בטוח שברצונך לנקות את כל הנתונים?')) {
        form.reset();
    }
}

// Hide troubleshooting notice
function hideNotice() {
    const notice = document.getElementById('troubleshootingNotice');
    if (notice) {
        notice.style.display = 'none';
    }
}

// Message dialog functions
function openMessageDialog() {
    const dialog = document.getElementById('messageDialog');
    if (dialog) {
        dialog.style.display = 'flex';
    }
}

function closeMessageDialog() {
    const dialog = document.getElementById('messageDialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
}

async function saveMessage() {
    const messageText = document.getElementById('userMessage').value.trim();
    
    if (!messageText) {
        alert('אנא כתוב הודעה');
        return;
    }
    
    const saveBtn = document.querySelector('.save-message-btn');
    const originalText = saveBtn.innerHTML;
    
    // Show loading
    saveBtn.innerHTML = '<div class="loading"></div> שומר...';
    saveBtn.disabled = true;
    
    try {
        // Create form data for the message
        const formData = new FormData();
        formData.append('userMessage', messageText);
        formData.append('timestamp', new Date().toLocaleString('he-IL'));
        formData.append('type', 'message');
        
        // Send to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert('ההודעה נשמרה בהצלחה! נחזור אליך בהקדם.');
            document.getElementById('userMessage').value = '';
            closeMessageDialog();
        } else {
            throw new Error('שגיאה בשמירה');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('אירעה שגיאה בשמירת ההודעה. אנא נסה שוב.');
    } finally {
        // Restore button
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}
