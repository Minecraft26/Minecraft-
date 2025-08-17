// --- Custom Message Box (Replaces alert()) ---
const messageBoxOverlay = document.getElementById('message-box-overlay');
const messageBoxTitle = document.getElementById('message-box-title');
const messageBoxContent = document.getElementById('message-box-content');

// Function to show custom alert that auto-dismisses
function showCustomAlert(title, message, duration = 3000) { // Default 3 seconds
    messageBoxTitle.textContent = title;
    messageBoxContent.textContent = message;
    messageBoxOverlay.classList.add('active');

    setTimeout(() => {
        messageBoxOverlay.classList.remove('active');
    }, duration);
}

// Intercept standard alert calls to use custom box (for development/testing)
const originalAlert = window.alert;
window.alert = function(message) {
    showCustomAlert('Alert', message);
};

// --- Loading Screen Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    console.log('DOMContentLoaded: Hiding loading screen after 1.5s.');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        loadingScreen.addEventListener('transitionend', () => {
            loadingScreen.remove(); // Remove from DOM after animation
            console.log('Loading screen removed.');
        });
    }, 1500); // Display loading for 1.5 seconds
});

// --- Copy-to-Clipboard ---
function copyToClipboard(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text).then(() => {
        showCustomAlert('Copied!', 'Text copied to clipboard: ' + text);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showCustomAlert('Error', 'Failed to copy text.');
    });
}

// --- Contact Us Form Submission ---
const contactUsForm = document.getElementById("contact-us-form");
const contactUsStatus = document.getElementById("contact-us-status");

contactUsForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const minecraftUsername = document.getElementById("contact-minecraft-username").value.trim();
    const discordId = document.getElementById("contact-discord-id").value.trim();
    const message = document.getElementById("contact-message").value.trim();

    if (!minecraftUsername || !discordId || !message) {
        contactUsStatus.innerText = "⚠️ Please fill in all required fields.";
        contactUsStatus.classList.add('error');
        return;
    }

    const fullMessage = `📧 **NEW CONTACT US MESSAGE** 📧
**Submitted By Email:** ${currentUser ? currentUser.email : 'Not Logged In'} (UID: ${currentUser ? currentUser.uid : 'N/A'})
**Minecraft User:** ${minecraftUsername}
**Discord ID:** ${discordId}
**Message:**
${message}`;

    fetch("https://discordapp.com/api/webhooks/1383347956182290462/b1k7PVanxmP6InWfH9k4Npj7WNP9dUM-nD6xXRZGZwFOsODahyDoBnxlmNdGCCyLDetz", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: fullMessage })
    })
    .then(res => {
        if (res.ok) {
            contactUsStatus.innerText = "✅ Message sent successfully! We'll get back to you soon.";
            contactUsStatus.classList.remove('error');
            contactUsForm.reset();
        } else {
            contactUsStatus.innerText = "❌ Failed to send. Try again later.";
            contactUsStatus.classList.add('error');
        }
    })
    .catch(error => {
        console.error("Contact form error:", error);
        contactUsStatus.innerText = "❌ Error sending message.";
        contactUsStatus.classList.add('error');
    });
});


// --- Theme Panel Logic ---
async function applyTheme() {
    let theme = JSON.parse(localStorage.getItem("theme")) || {};

    if (currentUser && currentUser.uid) {
        const response = await fetch(`/theme/${currentUser.uid}`);
        if (response.ok) {
            theme = await response.json();
        }
    }

    const root = document.documentElement.style;
    root.setProperty('--box-color', theme.boxColor || '#0d0d0d');
    root.setProperty('--glow-speed', theme.glowSpeed || '3s');
    root.setProperty('--glow-brightness', theme.glowBrightness || '0.6');
    root.setProperty('--bg-theme', theme.bgTheme || 'linear-gradient(-45deg, #0a0a0a, #111111, #1a1a1a, #0d0d0d)');
    root.setProperty('--text-light', theme.textLight || '#e0e0e0');
    root.setProperty('--accent-green', theme.accentGreen || '#00ffcc');
    root.setProperty('--accent-blue', theme.accentBlue || '#42a5f5');

    const glowToggleCheckbox = document.getElementById("glowToggle");
    if (glowToggleCheckbox) {
        glowToggleCheckbox.checked = theme.glowEnabled || false;
        root.setProperty('--glow-color', theme.glowEnabled ? (theme.glowColor || '#00ffcc') : "transparent");
    }

    // Set input values to current theme values
    document.getElementById("boxColor").value = theme.boxColor || '#0d0d0d';
    document.getElementById("glowColor").value = theme.glowColor || '#00ffcc';
    document.getElementById("glowSpeed").value = parseFloat((theme.glowSpeed || '3s').replace('s', ''));
    document.getElementById("glowBrightness").value = parseFloat(theme.glowBrightness || '0.6');
    document.getElementById("bgTheme").value = (theme.bgTheme && !theme.bgTheme.startsWith("url('") && !theme.bgTheme.startsWith("linear-gradient")) ? theme.bgTheme : ''; // Clear if complex gradient/url for input
    document.getElementById("textLightColor").value = theme.textLight || '#e0e0e0';
    document.getElementById("accentGreenColor").value = theme.accentGreen || '#00ffcc';
    document.getElementById("accentBlueColor").value = theme.accentBlue || '#42a5f5';
}

async function saveTheme() {
    const root = document.documentElement.style;
    const box = document.getElementById("boxColor").value;
    const glow = document.getElementById("glowColor").value;
    const speed = document.getElementById("glowSpeed").value + "s";
    const brightness = document.getElementById("glowBrightness").value;
    let bg = document.getElementById("bgTheme").value.trim();
    const enableGlow = document.getElementById("glowToggle").checked;
    const textLight = document.getElementById("textLightColor").value;
    const accentGreen = document.getElementById("accentGreenColor").value;
    const accentBlue = document.getElementById("accentBlueColor").value;

    const theme = {
        boxColor: box,
        glowColor: glow,
        glowSpeed: speed,
        glowBrightness: brightness,
        bgTheme: bg,
        glowEnabled: enableGlow,
        textLight: textLight,
        accentGreen: accentGreen,
        accentBlue: accentBlue
    };

    if (currentUser && currentUser.uid) {
        await fetch(`/theme/${currentUser.uid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(theme)
        });
    }

    localStorage.setItem("theme", JSON.stringify(theme));

    applyTheme();

    showCustomMessage(document.getElementById('theme-settings-content').querySelector('h2'), "🎨 Theme saved!", "success");
}

function resetTheme() {
    const defaults = {
        "--box-color": "#0d0d0d",
        "saved-glow-color": "#00ffcc",
        "--glow-speed": "3s",
        "--glow-brightness": "0.6",
        "--bg-theme": "linear-gradient(-45deg, #0a0a0a, #111111, #1a1a1a, #0d0d0d)",
        "--glow-enabled": "false",
        "--text-light": "#e0e0e0",
        "--accent-green": "#00ffcc",
        "--accent-blue": "#42a5f5"
    };

    for (let key in defaults) {
        localStorage.setItem(key, defaults[key]);
    }
    applyTheme(); // Re-apply the default theme
    showCustomMessage(document.getElementById('theme-settings-content').querySelector('h2'), "🔄 Theme reset to default and glow disabled.", "success");
}


// --- Custom Message Display for small inline messages (not the full modal alert) ---
function showCustomMessage(element, message, type) {
    let msgElement = null;
    // Find the closest parent that can contain a message, or create one
    const closestForm = element.closest('form');
    if (closestForm) {
        msgElement = closestForm.querySelector('.custom-message');
        if (!msgElement) {
            msgElement = document.createElement('p');
            msgElement.classList.add('custom-message');
            closestForm.appendChild(msgElement);
        }
    } else {
        // For existing message areas like #auth-message-main or section titles
        if (element.tagName === 'H2' || element.tagName === 'P') {
            msgElement = element;
        } else {
             // Fallback, append to body or a general area if specific parent not found
            msgElement = document.querySelector('#dynamic-content-area') || document.body;
            const existingTempMsg = msgElement.querySelector('.custom-message.temp');
            if(existingTempMsg) existingTempMsg.remove();
            const newTempMsg = document.createElement('p');
            newTempMsg.classList.add('custom-message', 'temp');
            msgElement.appendChild(newTempMsg);
            msgElement = newTempMsg;
        }
    }

    if (msgElement) {
        msgElement.textContent = message;
        msgElement.className = `custom-message ${type}`; // 'error' or 'success'
        setTimeout(() => {
            msgElement.textContent = '';
            msgElement.classList.remove('error', 'success');
            if (msgElement.classList.contains('temp')) {
                msgElement.remove(); // Remove temporary messages
            }
        }, 3000); // Clear message after 3 seconds
    }
}