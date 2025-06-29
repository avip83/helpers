// Configuration - Google Apps Script URL
// Updated Google Apps Script URL - Connected to spreadsheet
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwh96H9Z-Hc3n2QWxMe5ElMmOrYfJUMZZSVJE-lBpiaMqEG_gLH1okRewRCCs6sKdnI/exec';



// DOM elements
let form, submitBtn, successMessage;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    setupConditionalFields();
    loadFormData(); // Load saved form data
});

function initializeForm() {
    form = document.getElementById('damageForm');
    submitBtn = document.querySelector('.submit-btn');
    successMessage = document.getElementById('successMessage');
    
    if (!form) {
        console.error('Form not found!');
        return;
    }
}

function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Auto-save functionality
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            saveFormData(); // Auto-save on change
        });
    });
}

function setupConditionalFields() {
    // No conditional fields currently needed
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = collectFormData();
    submitFormData(formData);
}



function collectFormData() {
    const formData = new FormData(form);
    const data = {};
    
    // Collect regular form data
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (like checkboxes)
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    

    
    // Add user message if exists
    if (userMessage) {
        data.additionalInfo = userMessage;
    }
    
    // Add timestamp
    data.timestamp = new Date().toLocaleString('he-IL');
    
    return data;
}

async function submitFormData(data) {
    try {
        setLoadingState(true);
        
        console.log('Sending data:', data); // Debug log
        
        // Send data as JSON to Google Apps Script
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Since mode is 'no-cors', we can't read the response
        // But if we reach this point, the request was sent successfully
        console.log('Form submitted successfully');
        
        // Clear form data and show success message
        clearFormData();
        showSuccessMessage();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        let errorMessage = 'אירעה שגיאה בשליחת הטופס.';
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'בעיית חיבור לאינטרנט. בדוק את החיבור ונסה שוב.';
        } else if (error.message.includes('TypeError')) {
            // This is expected with no-cors mode, so treat as success
            console.log('Form likely submitted successfully (no-cors mode)');
            clearFormData();
            showSuccessMessage();
            return;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showError(errorMessage + ' פרטי השגיאה זמינים בקונסול.');
        showTroubleshootingNotice();
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> שולח...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> שלח פרטים ותקבל טיפול אישי';
    }
}

function showSuccessMessage() {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth' });
}

function showError(message) {
    // Create or update error message
    let errorDiv = document.querySelector('.form-error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #f5c6cb;
            text-align: center;
        `;
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.remove();
        }
    }, 5000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for external use (if needed)
window.FormHandler = {
    collectFormData,
    submitFormData
};

// Message Dialog Functions
let userMessage = '';

function openMessageDialog() {
    const dialog = document.getElementById('messageDialog');
    dialog.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Focus on textarea
    setTimeout(() => {
        document.getElementById('userMessage').focus();
    }, 100);
}

function closeMessageDialog() {
    const dialog = document.getElementById('messageDialog');
    dialog.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function saveMessage() {
    const messageText = document.getElementById('userMessage').value.trim();
    
    if (messageText) {
        userMessage = messageText;
        
        // Update button text to show message was saved
        const messageBtn = document.querySelector('.message-btn');
        const originalText = messageBtn.innerHTML;
        messageBtn.innerHTML = '<i class="fas fa-check"></i> הודעה נשמרה';
        messageBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        
        // Reset button after 3 seconds
        setTimeout(() => {
            messageBtn.innerHTML = originalText;
        }, 3000);
        
        closeMessageDialog();
    } else {
        // Show error if message is empty
        const textarea = document.getElementById('userMessage');
        textarea.style.borderColor = '#dc3545';
        textarea.placeholder = 'אנא כתוב הודעה לפני השמירה';
        
        setTimeout(() => {
            textarea.style.borderColor = '#e9ecef';
            textarea.placeholder = 'כתוב כאן את ההודעה או השאלה שלך...';
        }, 3000);
    }
}

// Close dialog when clicking outside
document.addEventListener('click', function(event) {
    const dialog = document.getElementById('messageDialog');
    if (event.target === dialog) {
        closeMessageDialog();
    }
});

// Close dialog with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMessageDialog();
    }
});

// Form Data Persistence Functions
function saveFormData() {
    try {
        if (!form) return; // Make sure form is initialized
        
        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.name] = input.value;
            }
        });
        
        localStorage.setItem('helpersFormData', JSON.stringify(formData));
    } catch (error) {
        console.error('Error saving form data:', error);
    }
}

function loadFormData() {
    try {
        if (!form) return; // Make sure form is initialized
        
        const savedData = localStorage.getItem('helpersFormData');
        if (!savedData) return;
        
        const formData = JSON.parse(savedData);
        const inputs = form.querySelectorAll('input, select, textarea');
        let hasData = false;
        
        inputs.forEach(input => {
            const value = formData[input.name];
            if (value !== undefined && value !== null && value !== '') {
                hasData = true;
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else if (input.type === 'radio') {
                    if (input.value === value) {
                        input.checked = true;
                    }
                } else {
                    input.value = value;
                }
            }
        });
        
        // Show notification only if data was actually restored
        if (hasData) {
            showRestoreNotification();
        }
        
    } catch (error) {
        console.error('Error loading form data:', error);
    }
}

function clearFormData() {
    try {
        localStorage.removeItem('helpersFormData');
    } catch (error) {
        console.error('Error clearing form data:', error);
    }
}

function showRestoreNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 14px;
        max-width: 300px;
        text-align: center;
    `;
    notification.innerHTML = '✅ הפרטים שלך שוחזרו מהשמירה האוטומטית';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

function clearAllFormData() {
    if (confirm('האם אתה בטוח שברצונך לנקות את כל הפרטים?')) {
        // Clear localStorage
        clearFormData();
        
        // Clear form fields
        if (form) {
            form.reset();
        }
        
        // Show notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            text-align: center;
        `;
        notification.innerHTML = '🗑️ הטופס נוקה בהצלחה';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 2000);
    }
}





// Troubleshooting functions
function showTroubleshootingNotice() {
    const notice = document.getElementById('troubleshootingNotice');
    if (notice) {
        notice.style.display = 'block';
        notice.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideNotice() {
    const notice = document.getElementById('troubleshootingNotice');
    if (notice) {
        notice.style.display = 'none';
    }
}

console.log('טופס נפגעי מלחמה מוכן לעבודה!');
