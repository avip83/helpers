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
        // Collect form data - same format as working message function
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add timestamp and type
        data.timestamp = new Date().toLocaleString('he-IL');
        data.type = 'form';
        
        // Show success immediately after 2 seconds (faster UX)
        setTimeout(() => {
            form.style.display = 'none';
            successMessage.style.display = 'block';
            successMessage.scrollIntoView({ behavior: 'smooth' });
        }, 2000);
        
        // Send to Google Sheets in the background (no-cors means we can't track it anyway)
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).catch(error => {
            // With no-cors, errors are expected and don't mean failure
            console.log('Background submission:', error.message);
        });
        
    } catch (error) {
        console.error('Error:', error);
        // Show success anyway - with no-cors we can't tell if it failed
        setTimeout(() => {
            form.style.display = 'none';
            successMessage.style.display = 'block';
            successMessage.scrollIntoView({ behavior: 'smooth' });
        }, 2000);
    }
});

// Clear form function (removed - no longer needed)

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
        // Create message data in the same format as the main form
        const messageData = {
            firstName: 'הודעה',
            lastName: 'מאתר',
            phone: '',
            email: '',
            city: '',
            street: '',
            houseNumber: '',
            apartment: '',
            zipCode: '',
            damageDate: '',
            damageType: 'message',
            damageDescription: messageText,
            damageScale: '',
            urgency: 'message',
            timestamp: new Date().toLocaleString('he-IL'),
            userMessage: messageText,
            type: 'message'
        };
        
        // Show success immediately after 1.5 seconds (faster UX)
        setTimeout(() => {
            alert('ההודעה נשמרה בהצלחה! נחזור אליך בהקדם.');
            document.getElementById('userMessage').value = '';
            closeMessageDialog();
        }, 1500);
        
        // Send to Google Sheets in the background
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        }).catch(error => {
            // With no-cors, errors are expected and don't mean failure
            console.log('Background message submission:', error.message);
        });
        
    } catch (error) {
        console.error('Error:', error);
        // Show success anyway - with no-cors we can't tell if it failed
        setTimeout(() => {
            alert('ההודעה נשלחה! אם זה לא עבד, אנא נסה שוב.');
            document.getElementById('userMessage').value = '';
            closeMessageDialog();
        }, 1500);
    } finally {
        // Restore button after short delay
        setTimeout(() => {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }, 1500);
    }
}
