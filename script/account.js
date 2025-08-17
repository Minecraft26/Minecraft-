




// --- User Authentication and Profile Management ---
const AUTH_SCREEN = document.getElementById('auth-screen');
const MAIN_AUTH_FORM = document.getElementById('auth-form-main');
const MAIN_AUTH_SUBMIT_BTN = document.getElementById('main-auth-submit-btn'); // Unified submit button
const TOGGLE_AUTH_MODE_BTN = document.getElementById('toggle-auth-mode-btn'); // Toggle between login/create
const MAIN_AUTH_EMAIL_INPUT = document.getElementById('auth-email-input');
const MAIN_AUTH_PASSWORD_INPUT = document.getElementById('auth-password-input');
const AUTH_MINECRAFT_USERNAME_INPUT = document.getElementById('auth-minecraft-username-input');
const AUTH_ACCOUNT_NAME_INPUT = document.getElementById('auth-account-name-input');
const AUTH_PLATFORM_SELECT = document.getElementById('auth-platform-select'); // New platform select
const RULES_CHECKBOX_CONTAINER = document.getElementById('rules-checkbox-container');
const AGREE_RULES_CHECKBOX = document.getElementById('agree-rules-checkbox');
const MAIN_AUTH_MESSAGE_ELEM = document.getElementById('auth-message-main');
const AUTH_WELCOME_MESSAGE = document.getElementById('auth-welcome-message');


const PROFILE_FORM = document.getElementById('profile-form');
const DISPLAY_EMAIL = document.getElementById('display-email');
const DISPLAY_MINECRAFT_USERNAME = document.getElementById('display-minecraft-username');
const DISPLAY_MINECRAFT_EDITION = document.getElementById('display-minecraft-edition'); // New display for edition
const DISPLAY_ACCOUNT_ID = document.getElementById('display-account-id');
const DISPLAY_ACCOUNT_NAME = document.getElementById('display-account-name');

const MINECRAFT_USERNAME_INPUT = document.getElementById('minecraft-username');
const ACCOUNT_NAME_INPUT = document.getElementById('account-name');

const PROFILE_MESSAGE_ELEM = document.getElementById('profile-message');
const AVATAR_UPLOAD_INPUT = document.getElementById('avatar-upload');
const PROFILE_IMAGE_ELEM = document.getElementById('profile-image');
const PROFILE_INITIAL_ELEM = document.getElementById('profile-initial');
const SIDEBAR_LOGOUT_BTN = document.getElementById('sidebar-logout-btn');

const HEADER_PROFILE_DISPLAY = document.getElementById('header-profile-display');
const HEADER_PROFILE_AVATAR = document.getElementById('header-profile-avatar');
const HEADER_PROFILE_INITIAL = document.getElementById('header-profile-initial');
const HEADER_PROFILE_IMAGE = document.getElementById('header-profile-image');
const PROFILE_DROPDOWN_MENU = document.getElementById('profile-dropdown-menu');

const CHANGE_PASSWORD_FORM = document.getElementById('change-password-form');
const CURRENT_PASSWORD_INPUT = document.getElementById('current-password');
const NEW_PASSWORD_INPUT = document.getElementById('new-password');
const CONFIRM_NEW_PASSWORD_INPUT = document.getElementById('confirm-new-password');
const CHANGE_PASSWORD_MESSAGE = document.getElementById('change-password-message');


let currentUser = null; // Stores email, uid
let userProfile = null; // Stores detailed profile data

// Simple UID generator (for demo purposes)
function generateUID(email) {
    return 'user_' + btoa(email).replace(/=/g, '').substring(0, 10) + '_' + Date.now().toString().slice(-4);
}

// --- Auth Mode Toggle (Login / Create Account) ---
let isCreateMode = false; // Initial state: Login

function setAuthMode(mode) {
    isCreateMode = mode;
    MAIN_AUTH_MESSAGE_ELEM.textContent = ''; // Clear messages

    // Hide all create-account-specific fields first
    AUTH_MINECRAFT_USERNAME_INPUT.style.display = 'none';
    AUTH_ACCOUNT_NAME_INPUT.style.display = 'none';
    AUTH_PLATFORM_SELECT.style.display = 'none';
    document.querySelector('label[for="auth-platform-select"]').style.display = 'none'; // Hide label too
    RULES_CHECKBOX_CONTAINER.style.display = 'none';
    AUTH_MINECRAFT_USERNAME_INPUT.removeEventListener('input', forceDotPrefix); // Remove listener when not in bedrock create mode


    if (isCreateMode) {
        AUTH_WELCOME_MESSAGE.textContent = 'Thanks for Joining!';
        AUTH_MINECRAFT_USERNAME_INPUT.style.display = 'block';
        AUTH_ACCOUNT_NAME_INPUT.style.display = 'block';
        AUTH_PLATFORM_SELECT.style.display = 'block';
        document.querySelector('label[for="auth-platform-select"]').style.display = 'block';
        RULES_CHECKBOX_CONTAINER.style.display = 'flex'; // Show rules checkbox
        MAIN_AUTH_SUBMIT_BTN.textContent = 'Register Account';
        TOGGLE_AUTH_MODE_BTN.textContent = 'Have an account? Login'; // Changed text
    } else {
        AUTH_WELCOME_MESSAGE.textContent = 'Welcome Back!';
        MAIN_AUTH_SUBMIT_BTN.textContent = 'Login';
        TOGGLE_AUTH_MODE_BTN.textContent = 'Don\'t have an account? Create one'; // Changed text
    }
    // Clear inputs when switching modes
    MAIN_AUTH_EMAIL_INPUT.value = '';
    MAIN_AUTH_PASSWORD_INPUT.value = '';
    AUTH_MINECRAFT_USERNAME_INPUT.value = '';
    AUTH_ACCOUNT_NAME_INPUT.value = '';
    AUTH_PLATFORM_SELECT.value = ''; // Reset platform select
    AGREE_RULES_CHECKBOX.checked = false;
}

// Event listener for platform selection
AUTH_PLATFORM_SELECT.addEventListener('change', () => {
    if (AUTH_PLATFORM_SELECT.value === 'bedrock') {
        // Prepend and make non-removable dot for Bedrock
        AUTH_MINECRAFT_USERNAME_INPUT.value = '.';
        AUTH_MINECRAFT_USERNAME_INPUT.addEventListener('input', forceDotPrefix);
    } else {
        AUTH_MINECRAFT_USERNAME_INPUT.removeEventListener('input', forceDotPrefix);
        AUTH_MINECRAFT_USERNAME_INPUT.value = ''; // Clear if not bedrock
    }
});

// Function to force the dot prefix for Bedrock usernames
function forceDotPrefix() {
    if (AUTH_PLATFORM_SELECT.value === 'bedrock' && !AUTH_MINECRAFT_USERNAME_INPUT.value.startsWith('.')) {
        AUTH_MINECRAFT_USERNAME_INPUT.value = '.' + AUTH_MINECRAFT_USERNAME_INPUT.value.replace(/^\.+/, ''); // Ensure only one dot at start
    }
}


TOGGLE_AUTH_MODE_BTN.addEventListener('click', (e) => {
    e.preventDefault();
    setAuthMode(!isCreateMode);
});

MAIN_AUTH_SUBMIT_BTN.addEventListener('click', async (e) => {
    e.preventDefault();
    MAIN_AUTH_MESSAGE_ELEM.textContent = '';

    const email = MAIN_AUTH_EMAIL_INPUT.value;
    const password = MAIN_AUTH_PASSWORD_INPUT.value;

    if (isCreateMode) {
        // Register logic
        const minecraftUsername = AUTH_MINECRAFT_USERNAME_INPUT.value.trim();
        const accountName = AUTH_ACCOUNT_NAME_INPUT.value.trim();
        const minecraftEdition = AUTH_PLATFORM_SELECT.value; // Get selected edition

        if (!email || !password || !minecraftUsername || !accountName || !minecraftEdition) {
            showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, 'Please fill all required fields for registration (including Minecraft Edition).', 'error');
            return;
        }
        if (!AGREE_RULES_CHECKBOX.checked) {
            showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, 'You must agree to the Minecraft Server Rules to create an account.', 'error');
            return;
        }

        const response = await fetch('https://mainweb.mk2899833.workers.dev/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, minecraftUsername, accountName, minecraftEdition })
        });
        const responseData = await response.json();

        if (responseData.success) {
            currentUser = { email: responseData.email, uid: responseData.uid };
            userProfile = responseData.user;
            sessionStorage.setItem('current_auth_email', email);
            handleSuccessfulAuth();
            showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, 'Account created successfully!', 'success');
        } else {
            showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, responseData.message, 'error');
        }

    } else {
        // Login logic
        const response = await fetch('https://mainweb.mk2899833.workers.dev/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const responseData = await response.json();

        if (responseData.success) {
            currentUser = { email: responseData.email, uid: responseData.uid };
            userProfile = responseData.user;
            sessionStorage.setItem('current_auth_email', email);
            handleSuccessfulAuth();
            showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, 'Login successful!', 'success');
        } else {
            showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, responseData.message, 'error');
        }
    }
});


// What happens after successful login/create
function handleSuccessfulAuth() {
    AUTH_SCREEN.style.display = 'none';
    document.getElementById('main-content-wrapper').style.display = 'block';
    console.log('Auth successful: showing main content.');
    renderProfile(); // Populate profile fields and header profile
    renderPlugins(pluginsData); // Initial render of sorted plugins
    showSection('server-info-content'); // Default to SERVER DETAILS on home
    fetchServerStatus(); // Fetch server status immediately
}

// Render profile details in Account Settings and header
function renderProfile() {
    if (currentUser && userProfile) {
        // Display fields in Account Settings
        DISPLAY_EMAIL.textContent = currentUser.email;
        DISPLAY_MINECRAFT_USERNAME.textContent = userProfile.minecraftUsername || 'N/A';
        DISPLAY_MINECRAFT_EDITION.textContent = (userProfile.minecraftEdition === 'java' ? 'Java Edition' : (userProfile.minecraftEdition === 'bedrock' ? 'Bedrock Edition' : 'N/A')); // Display edition
        DISPLAY_ACCOUNT_ID.textContent = currentUser.uid || 'N/A';
        DISPLAY_ACCOUNT_NAME.textContent = userProfile.accountName || 'N/A';

        // Input fields (for editing) in Account Settings
        MINECRAFT_USERNAME_INPUT.value = userProfile.minecraftUsername || '';
        ACCOUNT_NAME_INPUT.value = userProfile.accountName || '';

        // Render header profile picture
        updateAvatarDisplay(userProfile.avatar, currentUser.email);
    }
}

// Update avatar display (large for profile section, small for header)
function updateAvatarDisplay(avatarDataUrl, email) {
    // Main profile avatar
    const mainProfileImage = document.getElementById('profile-image');
    const mainProfileInitial = document.getElementById('profile-initial');
    if (avatarDataUrl) {
        mainProfileImage.src = avatarDataUrl;
        mainProfileImage.style.display = 'block';
        mainProfileInitial.style.display = 'none';
    } else {
        mainProfileImage.style.display = 'none';
        mainProfileInitial.style.display = 'flex';
        mainProfileInitial.textContent = email ? email.charAt(0).toUpperCase() : '?';
    }

    // Header profile avatar
    if (HEADER_PROFILE_IMAGE && HEADER_PROFILE_INITIAL) {
        if (avatarDataUrl) {
            HEADER_PROFILE_IMAGE.src = avatarDataUrl;
            HEADER_PROFILE_IMAGE.style.display = 'block';
            HEADER_PROFILE_INITIAL.style.display = 'none';
        } else {
            HEADER_PROFILE_IMAGE.style.display = 'none';
            HEADER_PROFILE_INITIAL.style.display = 'flex';
            HEADER_PROFILE_INITIAL.textContent = email ? email.charAt(0).toUpperCase() : '?';
        }
    }
}

// Handle profile form submission (saving to simulated Cloudflare KV)
PROFILE_FORM.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser || !userProfile) {
        showCustomMessage(PROFILE_MESSAGE_ELEM, 'Please log in first.', 'error');
        return;
    }

    const updatedProfile = {
        minecraftUsername: MINECRAFT_USERNAME_INPUT.value,
        accountName: ACCOUNT_NAME_INPUT.value,
        avatar: userProfile.avatar // Retain current avatar unless changed via file input
    };

    const response = await fetch(`https://mainweb.mk2899833.workers.dev/profile/${currentUser.email}` , {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
    });
    const responseData = await response.json();

    if (responseData.success) {
        userProfile = responseData.user; // Update local profile with confirmed changes
        renderProfile(); // Re-render to update display fields and header
        showCustomMessage(PROFILE_MESSAGE_ELEM, 'Profile saved successfully!', 'success');
    } else {
        showCustomMessage(PROFILE_MESSAGE_ELEM, responseData.message, 'error');
    }
});

// Handle avatar upload (saving to simulated Cloudflare KV)
AVATAR_UPLOAD_INPUT.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && currentUser && userProfile) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const avatarDataUrl = event.target.result; // Data URL of the image
            const updatedProfile = { ...userProfile, avatar: avatarDataUrl }; // Update avatar in profile

            const response = await fetch(`https://mainweb.mk2899833.workers.dev/profile/${currentUser.email}` , {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProfile)
            });
            const responseData = await response.json();

            if (responseData.success) {
                userProfile = responseData.user; // Update local profile
                updateAvatarDisplay(userProfile.avatar, currentUser.email);
                showCustomMessage(PROFILE_MESSAGE_ELEM, 'Profile picture updated!', 'success');
            } else {
                showCustomMessage(PROFILE_MESSAGE_ELEM, responseData.message, 'error');
            }
        };
        reader.readAsDataURL(file); // Read file as Data URL
    } else if (!currentUser) {
        showCustomMessage(PROFILE_MESSAGE_ELEM, 'Please log in to upload an avatar.', 'error');
    }
});

// Toggle profile dropdown in header
if (HEADER_PROFILE_AVATAR) {
    HEADER_PROFILE_AVATAR.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from closing immediately
        PROFILE_DROPDOWN_MENU.classList.toggle('active');
    });
    // Close dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!HEADER_PROFILE_DISPLAY.contains(e.target)) {
            PROFILE_DROPDOWN_MENU.classList.remove('active');
        }
    });
}
function toggleProfileDropdown() {
     PROFILE_DROPDOWN_MENU.classList.toggle('active');
}

// Handle Change Password Form
CHANGE_PASSWORD_FORM.addEventListener('submit', async (e) => {
    e.preventDefault();
    CHANGE_PASSWORD_MESSAGE.textContent = '';
    const currentPassword = CURRENT_PASSWORD_INPUT.value;
    const newPassword = NEW_PASSWORD_INPUT.value;
    const confirmNewPassword = CONFIRM_NEW_PASSWORD_INPUT.value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showCustomMessage(CHANGE_PASSWORD_MESSAGE, 'All password fields are required.', 'error');
        return;
    }
    if (newPassword.length < 6) { // Example strength check
        showCustomMessage(CHANGE_PASSWORD_MESSAGE, 'New password must be at least 6 characters long.', 'error');
        return;
    }
    if (newPassword !== confirmNewPassword) {
        showCustomMessage(CHANGE_PASSWORD_MESSAGE, 'New password and confirmation do not match.', 'error');
        return;
    }

    const response = await fetch(`https://mainweb.mk2899833.workers.dev/password/${currentUser.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
    });
    const responseData = await response.json();

    if (responseData.success) {
        showCustomMessage(CHANGE_PASSWORD_MESSAGE, responseData.message, 'success');
        // Clear fields on success
        CURRENT_PASSWORD_INPUT.value = '';
        NEW_PASSWORD_INPUT.value = '';
        CONFIRM_NEW_PASSWORD_INPUT.value = '';
    } else {
        showCustomMessage(CHANGE_PASSWORD_MESSAGE, responseData.message, 'error');
    }
});


// Logout function
function logoutUser() {
    currentUser = null;
    userProfile = null;
    sessionStorage.removeItem('current_auth_email'); // Clear auth session
    console.log('User logged out. Clearing session.');

    AUTH_SCREEN.style.display = 'flex'; // Show auth screen
    document.getElementById('main-content-wrapper').style.display = 'none'; // Hide main content
    showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, 'You have been logged out.', 'success');
    // Reset auth form fields and set to login mode
    setAuthMode(false); // Reset to login mode
    toggleSidebar(); // Close sidebar if open
}
SIDEBAR_LOGOUT_BTN.addEventListener('click', logoutUser);

// --- Initial Load & Authentication Check ---
window.addEventListener("DOMContentLoaded", async () => {
    applyTheme(); // Apply saved theme on load
    console.log('DOM Content Loaded. Checking authentication status...');

    const mainContentWrapper = document.getElementById("main-content-wrapper");
    const authScreen = document.getElementById("auth-screen");

    const storedAuthEmail = sessionStorage.getItem('current_auth_email');
    if (storedAuthEmail) {
        console.log('Found stored email in session. Attempting re-login...');
        // Attempt to re-login using the stored email (password is not stored for security)
        // This assumes the worker's /login endpoint can handle re-authentication with just email if a session is valid
        // For a real app, you'd use a token or more robust session management.
        const response = await fetch('https://mainweb.mk2899833.workers.dev/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: storedAuthEmail, password: "" }) // Send empty password for re-auth attempt
        });
        const responseData = await response.json();

        if (responseData.success) {
            currentUser = { email: responseData.email, uid: responseData.uid };
            userProfile = responseData.user;
            console.log('Re-login successful with stored email. User:', currentUser.email);
            handleSuccessfulAuth();
        } else {
            console.log('Stored email not found in worker or re-auth failed. Showing auth screen.');
            sessionStorage.removeItem('current_auth_email'); // Clear invalid session
            setAuthMode(false); // Default to login mode
            authScreen.style.display = "flex";
            mainContentWrapper.style.display = "none";
        }
    } else {
        console.log('No stored email found. Showing auth screen.');
        setAuthMode(false); // Default to login mode
        authScreen.style.display = "flex";
        mainContentWrapper.style.display = "none";
    }

    // Initial render of plugins (alphabetical order with non-working at bottom)
    renderPlugins(pluginsData);
    // Initial render for players section (default to richest)
    showPlayerSubSection('top-richest-content');
});