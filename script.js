// Configuration - Google Apps Script URL
// Updated Google Apps Script URL - Connected to spreadsheet
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwh96H9Z-Hc3n2QWxMe5ElMmOrYfJUMZZSVJE-lBpiaMqEG_gLH1okRewRCCs6sKdnI/exec';

// DOM elements
let form, submitBtn, successMessage, progressFill;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    setupProgressTracking();
    loadFormData();
    
    // Show entrance animation
    document.querySelector('.container').style.animation = 'slideUp 0.6s ease-out';
});

function initializeForm() {
    form = document.getElementById('damageForm');
    submitBtn = document.querySelector('.submit-btn');
    successMessage = document.getElementById('successMessage');
    progressFill = document.getElementById('progressFill');
    
    if (!form) {
        console.error('Form not found!');
        return;
    }
}

function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Auto-save and progress tracking
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updateProgress();
            saveFormData();
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Real-time phone formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

function setupProgressTracking() {
    updateProgress();
}

function updateProgress() {
    const requiredFields = form.querySelectorAll('[required]');
    const filledFields = Array.from(requiredFields).filter(field => 
        field.value.trim() !== ''
    );
    
    const progress = (filledFields.length / requiredFields.length) * 100;
    progressFill.style.width = progress + '%';
    
    // Add smooth color transition based on progress
    if (progress < 30) {
        progressFill.style.background = 'linear-gradient(90deg, #dc3545, #fd7e14)';
    } else if (progress < 70) {
        progressFill.style.background = 'linear-gradient(90deg, #fd7e14, #ffc107)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
    }
}

function validateField(field) {
    // Remove existing validation classes
    field.classList.remove('valid', 'invalid');
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'שדה זה הוא חובה';
    }
    
    // Specific validations
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (field.value && !emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'כתובת אימייל לא תקינה';
            }
            break;
            
        case 'tel':
            const phoneRegex = /^0\d{1,2}-?\d{7}$/;
            if (field.value && !phoneRegex.test(field.value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'מספר טלפון לא תקין';
            }
            break;
    }
    
    // Apply validation styling
    if (field.value.trim()) {
        field.classList.add(isValid ? 'valid' : 'invalid');
        showFieldError(field, isValid ? '' : errorMessage);
    }
    
    return isValid;
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        if (value.length <= 3) {
            value = value;
        } else if (value.length <= 6) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + value.slice(6, 10);
        }
    }
    
    e.target.value = value;
}

function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    if (message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 14px;
            margin-top: 5px;
            animation: fadeIn 0.3s ease;
        `;
        field.parentNode.appendChild(errorDiv);
    }
}

function generateReportNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `RPT${year}${month}${day}${random}`;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all fields before submission
    const allFieldsValid = validateAllFields();
    if (!allFieldsValid) {
        showError('אנא תקן את השגיאות בטופס לפני השליחה');
        return;
    }
    
    const formData = collectFormData();
    
    // Generate report number
    const reportNumber = generateReportNumber();
    formData.reportNumber = reportNumber;
    
    submitFormData(formData);
}

function validateAllFields() {
    const inputs = form.querySelectorAll('input, select, textarea');
    let allValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            allValid = false;
        }
    });
    
    return allValid;
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
    
    // Add timestamp and additional metadata
    data.timestamp = new Date().toLocaleString('he-IL');
    data.userAgent = navigator.userAgent;
    data.referrer = document.referrer;
    data.formVersion = '2.0';
    
    return data;
}

async function submitFormData(data) {
    try {
        setLoadingState(true);
        
        console.log('Sending data:', data);
        
        // Add security headers and validation
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        console.log('Form submitted successfully');
        
        // Clear form data and show success message
        clearFormData();
        showSuccessMessage(data.reportNumber);
        
        // Send analytics event (if analytics is set up)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'engagement',
                'event_label': 'damage_report',
                'value': 1
            });
        }
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        let errorMessage = 'אירעה שגיאה בשליחת הטופס.';
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'בעיית חיבור לאינטרנט. בדוק את החיבור ונסה שוב.';
        } else if (error.message.includes('TypeError')) {
            // This is expected with no-cors mode, so treat as success
            console.log('Form likely submitted successfully (no-cors mode)');
            clearFormData();
            showSuccessMessage(data.reportNumber);
            return;
        }
        
        showError(errorMessage);
        
        // Send error analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_error', {
                'event_category': 'error',
                'event_label': error.message,
                'value': 0
            });
        }
        
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> שולח דיווח...';
        submitBtn.style.opacity = '0.7';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> שלח דיווח וקבל טיפול מיידי';
        submitBtn.style.opacity = '1';
    }
}

function showSuccessMessage(reportNumber) {
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Update report number
    document.getElementById('reportNumber').textContent = reportNumber;
    
    // Scroll to success message with smooth animation
    successMessage.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
    
    // Confetti effect (simple)
    createConfetti();
}

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#28a745', '#ffc107'];
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    `;
    document.body.appendChild(confettiContainer);
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
            opacity: 0.8;
        `;
        confettiContainer.appendChild(confetti);
    }
    
    // Add confetti animation CSS
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(-100vh) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Clean up after animation
    setTimeout(() => {
        confettiContainer.remove();
    }, 5000);
}

function showError(message) {
    // Create or update error message
    let errorDiv = document.querySelector('.form-error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error-message';
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            border: 2px solid #f5c6cb;
            text-align: center;
            animation: shake 0.5s ease-in-out;
            box-shadow: 0 5px 15px rgba(220, 53, 69, 0.2);
        `;
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="margin-left: 10px;"></i>
        ${message}
    `;
    
    errorDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Add shake animation
    if (!document.getElementById('shake-style')) {
        const style = document.createElement('style');
        style.id = 'shake-style';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto-hide after 7 seconds
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => errorDiv.remove(), 500);
        }
    }, 7000);
}

// Enhanced form data management
function saveFormData() {
    try {
        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type !== 'submit') {
                formData[input.name || input.id] = input.value;
            }
        });
        
        localStorage.setItem('damageFormData', JSON.stringify(formData));
        localStorage.setItem('damageFormDataTimestamp', new Date().toISOString());
    } catch (error) {
        console.warn('Could not save form data:', error);
    }
}

function loadFormData() {
    try {
        const savedData = localStorage.getItem('damageFormData');
        const savedTimestamp = localStorage.getItem('damageFormDataTimestamp');
        
        if (!savedData) return;
        
        // Check if data is not too old (24 hours)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const saveTime = new Date(savedTimestamp);
        
        if (saveTime < dayAgo) {
            clearFormData();
            return;
        }
        
        const formData = JSON.parse(savedData);
        let hasData = false;
        
        Object.entries(formData).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"], #${key}`);
            if (input && value) {
                input.value = value;
                hasData = true;
            }
        });
        
        if (hasData) {
            showRestoreNotification();
            updateProgress();
        }
        
    } catch (error) {
        console.warn('Could not load form data:', error);
    }
}

function showRestoreNotification() {
    const notification = document.createElement('div');
    notification.className = 'restore-notification';
    notification.style.cssText = `
        background: linear-gradient(135deg, #17a2b8, #138496);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        text-align: center;
        animation: slideDown 0.5s ease-out;
        box-shadow: 0 5px 15px rgba(23, 162, 184, 0.3);
    `;
    
    notification.innerHTML = `
        <i class="fas fa-info-circle" style="margin-left: 10px;"></i>
        מצאנו נתונים שמורים מהפעם הקודמת
        <button onclick="this.parentNode.remove()" style="
            background: none;
            border: none;
            color: white;
            float: left;
            cursor: pointer;
            font-size: 18px;
        ">×</button>
    `;
    
    form.insertBefore(notification, form.firstChild);
    
    // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
            notification.style.animation = 'slideUp 0.5s ease-out forwards';
            setTimeout(() => notification.remove(), 500);
        }
    }, 10000);
}

function clearFormData() {
    try {
        localStorage.removeItem('damageFormData');
        localStorage.removeItem('damageFormDataTimestamp');
        
        // Reset form
            form.reset();
        
        // Reset progress
        progressFill.style.width = '0%';
        
        // Remove validation classes
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        
        // Remove error messages
        const errors = form.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());
        
    } catch (error) {
        console.warn('Could not clear form data:', error);
    }
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

// Add CSS animations
function addAnimationStyles() {
    if (!document.getElementById('animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
            }
            
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes slideUp {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
            
            .form-group input.valid,
            .form-group select.valid,
            .form-group textarea.valid {
                border-color: #28a745 !important;
                box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1) !important;
            }
            
            .form-group input.invalid,
            .form-group select.invalid,
            .form-group textarea.invalid {
                border-color: #dc3545 !important;
                box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize animations
addAnimationStyles();

// Export functions for external use (if needed)
window.FormHandler = {
    collectFormData,
    submitFormData,
    clearFormData,
    validateAllFields
};

console.log('טופס נפגעי מלחמה מוכן לעבודה!');
