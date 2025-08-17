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

        // --- Simulated Cloudflare API Layer for User Data ---
        // !!! IMPORTANT: THIS IS A SIMULATION FOR LOCAL TESTING !!!
        // FOR PRODUCTION, YOU WOULD DEPLOY A CLOUDFLARE WORKER AND USE KV NAMESPACES.

        const CLOUDFLARE_KV_SIMULATION_KEY = 'cloudflare_kv_sim'; // Master key for simulated KV store

        // Helper to get the full simulated KV store
        function getSimulatedKV() {
            try {
                const data = localStorage.getItem(CLOUDFLARE_KV_SIMULATION_KEY);
                return JSON.parse(data) || {};
            } catch (e) {
                console.error("Error parsing simulated KV data from localStorage:", e);
                localStorage.removeItem(CLOUDFLARE_KV_SIMULATION_KEY); // Clear corrupted data
                return {};
            }
        }

        // Helper to put data into the simulated KV store
        function putSimulatedKV(key, value) {
            const kv = getSimulatedKV();
            kv[key] = value;
            localStorage.setItem(CLOUDFLARE_KV_SIMULATION_KEY, JSON.stringify(kv));
            console.log(`Simulated KV: Put key "${key}".`);
        }

        // Helper to get data from the simulated KV store
        function getSimulatedKVItem(key) {
            const kv = getSimulatedKV();
            const item = kv[key];
            console.log(`Simulated KV: Get key "${key}" -`, item ? 'found' : 'not found');
            return item;
        }

        // Simulated API Endpoint for User Operations
        const simulatedCloudflareApi = {
            async login(email, password) {
                return new Promise(resolve => {
                    setTimeout(() => { // Simulate network delay
                        const userJson = getSimulatedKVItem(email.toLowerCase());
                        const user = userJson ? JSON.parse(userJson) : null;
                        if (user && user.password === password) { // In real app, hash and compare passwords securely!
                            console.log('Simulated API Login Success for:', email);
                            resolve({ success: true, user: user.profile, email: user.email, uid: user.uid });
                        } else {
                            console.log('Simulated API Login Failed for:', email);
                            resolve({ success: false, message: 'Invalid username/email or password.' });
                        }
                    }, 500);
                });
            },
            async register(email, password, minecraftUsername, accountName, minecraftEdition) { // Added minecraftEdition
                return new Promise(resolve => {
                    setTimeout(() => { // Simulate network delay
                        const lowerCaseEmail = email.toLowerCase();
                        if (getSimulatedKVItem(lowerCaseEmail)) {
                            console.log('Simulated API Register Failed: User exists', email);
                            resolve({ success: false, message: 'Account with this email already exists.' });
                            return;
                        }
                        const uid = generateUID(lowerCaseEmail);
                        const newUser = {
                            email: lowerCaseEmail,
                            password: password, // Still plaintext for testing
                            uid: uid,
                            profile: {
                                minecraftUsername: minecraftUsername,
                                minecraftEdition: minecraftEdition, // Store edition
                                accountId: uid,
                                accountName: accountName,
                                avatar: ''
                            }
                        };
                        putSimulatedKV(lowerCaseEmail, JSON.stringify(newUser));
                        console.log('Simulated API Register Success for:', email);
                        resolve({ success: true, user: newUser.profile, email: newUser.email, uid: newUser.uid });
                    }, 500);
                });
            },
            async updateProfile(email, newProfileData) {
                return new Promise(resolve => {
                    setTimeout(() => { // Simulate network delay
                        const userJson = getSimulatedKVItem(email.toLowerCase());
                        if (!userJson) {
                            console.log('Simulated API Update Profile Failed: User not found', email);
                            resolve({ success: false, message: 'User not found.' });
                            return;
                        }
                        const user = JSON.parse(userJson);
                        // Merge newProfileData, ensuring tickets array is not overwritten
                        user.profile = { ...user.profile, ...newProfileData };
                        putSimulatedKV(email.toLowerCase(), JSON.stringify(user));
                        console.log('Simulated API Update Profile Success for:', email);
                        resolve({ success: true, user: user.profile });
                    }, 500);
                });
            },
            async changePassword(email, currentPassword, newPassword) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const userJson = getSimulatedKVItem(email.toLowerCase());
                        if (!userJson) {
                            resolve({ success: false, message: 'User not found.' });
                            return;
                        }
                        const user = JSON.parse(userJson);
                        if (user.password !== currentPassword) { // Direct comparison for simulation
                            resolve({ success: false, message: 'Incorrect current password.' });
                            return;
                        }
                        user.password = newPassword; // Update password (still plaintext)
                        putSimulatedKV(email.toLowerCase(), JSON.stringify(user));
                        resolve({ success: true, message: 'Password updated successfully!' });
                    }, 500);
                });
            }
        };


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

                const response = await simulatedCloudflareApi.register(email, password, minecraftUsername, accountName, minecraftEdition); // Pass edition

                if (response.success) {
                    currentUser = { email: response.email, uid: response.uid };
                    userProfile = response.user;
                    sessionStorage.setItem('current_auth_email', email);
                    handleSuccessfulAuth();
                    showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, 'Account created successfully!', 'success');
                } else {
                    showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, response.message, 'error');
                }

            } else {
                // Login logic
                const response = await simulatedCloudflareApi.login(email, password);

                if (response.success) {
                    currentUser = { email: response.email, uid: response.uid };
                    userProfile = response.user;
                    sessionStorage.setItem('current_auth_email', email);
                    handleSuccessfulAuth();
                    showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, 'Login successful!', 'success');
                } else {
                    showCustomMessage(MAIN_AUTH_MESSAGE_ELEM, response.message, 'error');
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

            const response = await simulatedCloudflareApi.updateProfile(currentUser.email, updatedProfile);

            if (response.success) {
                userProfile = response.user; // Update local profile with confirmed changes
                renderProfile(); // Re-render to update display fields and header
                showCustomMessage(PROFILE_MESSAGE_ELEM, 'Profile saved successfully!', 'success');
            } else {
                showCustomMessage(PROFILE_MESSAGE_ELEM, response.message, 'error');
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

                    const response = await simulatedCloudflareApi.updateProfile(currentUser.email, updatedProfile);

                    if (response.success) {
                        userProfile = response.user; // Update local profile
                        updateAvatarDisplay(userProfile.avatar, currentUser.email);
                        showCustomMessage(PROFILE_MESSAGE_ELEM, 'Profile picture updated!', 'success');
                    } else {
                        showCustomMessage(PROFILE_MESSAGE_ELEM, response.message, 'error');
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

            const response = await simulatedCloudflareApi.changePassword(currentUser.email, currentPassword, newPassword);

            if (response.success) {
                showCustomMessage(CHANGE_PASSWORD_MESSAGE, response.message, 'success');
                // Clear fields on success
                CURRENT_PASSWORD_INPUT.value = '';
                NEW_PASSWORD_INPUT.value = '';
                CONFIRM_NEW_PASSWORD_INPUT.value = '';
            } else {
                showCustomMessage(CHANGE_PASSWORD_MESSAGE, response.message, 'error');
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


        // --- UI Navigation & Sidebar Logic ---
        const SIDEBAR = document.getElementById('sidebar');
        const MAIN_CONTENT_WRAPPER = document.getElementById('main-content-wrapper');
        const OVERLAY = document.querySelector('.overlay');
        const SIDEBAR_NAV_LINKS = document.querySelectorAll('#sidebar nav a');
        const HOMEPAGE_NAV_SECTION = document.getElementById('homepage-nav-section'); // The section with the 3 main buttons
        const DYNAMIC_CONTENT_AREA = document.getElementById('dynamic-content-area'); // The container for content below buttons
        const ALL_CONTENT_SECTIONS = document.querySelectorAll('#dynamic-content-area > .content-section'); // All sections that live *inside* dynamic-content-area

        function toggleSidebar() {
            SIDEBAR.classList.toggle('open');
            MAIN_CONTENT_WRAPPER.classList.toggle('sidebar-open');
            OVERLAY.classList.toggle('active');
        }

        // Function to show a specific content section and hide others
        function showSection(sectionId) {
            ALL_CONTENT_SECTIONS.forEach(section => {
                section.classList.remove('active');
            });

            // Adjust homepage nav section visibility based on the type of content
            if (['server-info-content', 'plugins-content', 'how-to-play-content'].includes(sectionId)) {
                HOMEPAGE_NAV_SECTION.style.display = 'flex'; // Show the main buttons
                document.getElementById(sectionId).classList.add('active'); // Show the requested content below
            } else {
                HOMEPAGE_NAV_SECTION.style.display = 'none'; // Hide the main buttons
                document.getElementById(sectionId).classList.add('active'); // Show the requested content
            }

            // Update active class in sidebar nav
            SIDEBAR_NAV_LINKS.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.section === sectionId) {
                    link.classList.add('active');
                }
                // Special case for 'Home' in sidebar: activate if any of the main 3 are active
                if (link.dataset.section === "server-info-content" && ['server-info-content', 'plugins-content', 'how-to-play-content'].includes(sectionId)) {
                    link.classList.add('active');
                }
            });
        }

        // Add click listeners to sidebar navigation links
        SIDEBAR_NAV_LINKS.forEach(link => {
            // Check if the link should open an external URL (like Discord/Instagram)
            if (link.href && link.target === '_blank') {
                link.addEventListener('click', (e) => {
                    // Do nothing, let the browser handle the target="_blank"
                });
            } else if (link.dataset.section) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    showSection(link.dataset.section);
                    toggleSidebar(); // Close sidebar after navigation
                });
            }
        });


        // --- Server Status Script (Directly provided logic) ---
        const serverIP = "mc1524209.fmcs.cloud"; // Your FreeMcServer IP

        async function fetchServerStatus() {
            const statusDiv = document.getElementById("server-status");
            const playersDiv = document.getElementById("player-count");
            const onlinePlayersList = document.getElementById("online-players-list");
            const serverControlOptions = document.getElementById('server-control-options');
            serverControlOptions.innerHTML = ''; // Clear previous buttons

            // Update static IP/Port displays (always the same)
            document.getElementById("server-ip").textContent = serverIP;
            document.getElementById("server-port").textContent = "38762"; // Hardcoded as requested

            try {
                const res = await fetch(`https://api.mcsrvstat.us/2/${serverIP}`);
                const data = await res.json();

                if (!data || typeof data.online === "undefined") {
                    statusDiv.innerHTML = "⚠️ Error checking server status.";
                    statusDiv.className = "status-offline";
                    playersDiv.innerHTML = "";
                    onlinePlayersList.innerHTML = '<li>Error: Could not retrieve server status.</li>';
                    serverControlOptions.innerHTML = `<a href="https://freemcserver.net/server/1524209" target="_blank"><button style="background-color: var(--button-primary);"><i class="fas fa-play"></i> Start Server</button></a>`;
                    return;
                }

                if (!data.online) {
                    statusDiv.innerHTML = "🔴 Offline";
                    statusDiv.className = "status-offline";
                    playersDiv.innerHTML = "";
                    onlinePlayersList.innerHTML = '<li>Server is offline. Invalid player names (server does not exist to provide names).</li>';
                    serverControlOptions.innerHTML = `<a href="https://freemcserver.net/server/1524209" target="_blank"><button style="background-color: var(--button-primary);"><i class="fas fa-play"></i> Start Server</button></a>`;
                } else {
                    statusDiv.innerHTML = "🟢 Online";
                    statusDiv.className = "status-online";
                    playersDiv.innerHTML = `👥 ${data.players.online}/${data.players.max} Players`;
                    serverControlOptions.innerHTML = `<button style="background-color: var(--button-red);" disabled><i class="fas fa-stop"></i> Server Running</button>`;

                    // Display online players
                    let playersListHtml = '';
                    if (data.players && data.players.list && data.players.list.length > 0) {
                        playersListHtml = data.players.list.map(p => `<li><span>${p}</span></li>`).join('');
                    } else {
                        playersListHtml = '<li>No players currently online.</li>';
                    }
                    onlinePlayersList.innerHTML = playersListHtml;
                }
            } catch (error) {
                console.error("Fetch error:", error);
                statusDiv.innerHTML = "⚠️ Network Error: Cannot reach API.";
                statusDiv.className = "status-offline";
                playersDiv.innerHTML = "";
                onlinePlayersList.innerHTML = '<li>Network error. Please check your connection.</li>';
                serverControlOptions.innerHTML = `<a href="https://freemcserver.net/server/1524209" target="_blank"><button style="background-color: var(--button-primary);"><i class="fas fa-play"></i> Start Server</button></a>`;
            }
        }

        fetchServerStatus(); // Initial call
        setInterval(fetchServerStatus, 5000); // Repeat every 5 seconds


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

        // --- Plugin Data & Render Logic ---
        const pluginsData = [
            { name: "EssentialsX", description: "Core plugin for server management, homes, warps, kits, and more.", videoLink: "https://www.youtube.com/embed/dQw4w9WgXcQ", detailsLink: "https://essentialsx.net/wiki.html", status: "working" },
            { name: "LuckPerms", description: "Powerful permissions plugin with a web editor.", videoLink: "", detailsLink: "https://luckperms.net/", status: "working" },
            { name: "WorldEdit", description: "Fast and easy to use in-game world editor.", videoLink: "https://www.youtube.com/embed/aYd2I9B5G60", detailsLink: "https://enginehub.org/worldedit/", status: "working" },
            { name: "GriefPrevention", description: "Prevents griefing and protects player builds with land claims.", videoLink: "https://www.youtube.com/embed/p_G-o2r9D2s", detailsLink: "https://www.spigotmc.org/resources/griefprevention.1884/", status: "working" },
            { name: "PlaceholderAPI", description: "Adds placeholders to plugins, allowing dynamic text display.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/placeholderapi.6245/", status: "working" },
            { name: "Vault", description: "A permissions, chat, & economy API to allow plugins to hook into.", videoLink: "https://www.youtube.com/embed/lIeXvD3xG4w", detailsLink: "https://www.spigotmc.org/resources/vault.34315/", status: "working" },
            { name: "EconomyTaxerWeb", description: "This custom plugin is not made by CraftOne. Unsupported version by Ansh_2613 and i._Sakshamm.", videoLink: "", detailsLink: "", status: "non-working", problem: "This custom plugin is not made by CraftOne. Unsupported version by Ansh_2613 and i._Sakshamm." }, // Updated problem
            { name: "Movecraft", description: "Allows players to build and pilot custom ships and vehicles.", videoLink: "https://www.youtube.com/embed/some_movecraft_video", detailsLink: "https://www.spigotmc.org/resources/movecraft.20364/", status: "non-working", problem: "Unsupported version." } // Updated problem
            // Add more plugins here with their status
        ];

        const pluginSubNavButtons = document.querySelectorAll('#plugins-content .player-sub-nav button');
        let currentPluginFilter = "all-plugins"; // Default filter

        function renderPlugins(pluginsToRender) {
            const pluginListElement = document.getElementById("plugin-list");
            pluginListElement.innerHTML = ''; // Clear existing list

            let filteredPlugins = pluginsToRender;

            if (currentPluginFilter === "non-working-plugins") {
                filteredPlugins = pluginsToRender.filter(p => p.status === "non-working").sort((a,b) => a.name.localeCompare(b.name));
            } else { // "all-plugins" - sort working first, then non-working
                const workingPlugins = pluginsToRender.filter(p => p.status === "working").sort((a,b) => a.name.localeCompare(b.name));
                const nonWorkingPlugins = pluginsToRender.filter(p => p.status === "non-working").sort((a,b) => a.name.localeCompare(b.name));
                filteredPlugins = [...workingPlugins, ...nonWorkingPlugins];
            }


            if (filteredPlugins.length === 0) {
                pluginListElement.innerHTML = '<li style="text-align: center; color: #ccc; padding: 20px;">No plugins found matching your criteria.</li>';
                return;
            }

            filteredPlugins.forEach(plugin => {
                const li = document.createElement("li");
                let videoHtml = '';
                if (plugin.videoLink) {
                    videoHtml = `
                        <div class="plugin-video">
                            <iframe src="${plugin.videoLink}"
                                    title="${plugin.name} Tutorial"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowfullscreen>
                            </iframe>
                        </div>`;
                } else {
                    videoHtml = `
                        <div class="plugin-video placeholder">
                            No tutorial video available for this plugin.
                        </div>`;
                }

                let problemMessageHtml = '';
                if (plugin.status === "non-working" && plugin.problem) {
                    problemMessageHtml = `<p class="problem-message">Problem: ${plugin.problem}</p>`;
                    li.classList.add('non-working-plugin'); // Add class for styling
                }

                li.innerHTML = `
                    <h3>${plugin.name}</h3>
                    <p class="description">${plugin.description}</p>
                    ${problemMessageHtml}
                    ${videoHtml}
                    <div class="plugin-links">
                        ${plugin.detailsLink ? `<a class="plugin-link-btn" href="${plugin.detailsLink}" target="_blank">
                            <i class="fas fa-info-circle"></i> Details
                        </a>` : ''}
                    </div>
                `;
                pluginListElement.appendChild(li);
            });
        }

        // Plugin sub-navigation click handlers
        pluginSubNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                pluginSubNavButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentPluginFilter = button.dataset.pluginSubSection;
                renderPlugins(pluginsData); // Re-render with new filter
            });
        });


        // Plugin Search Filter (filters the currently displayed set)
        const searchInput = document.getElementById("plugin-search");
        searchInput.addEventListener("input", function () {
            const filter = this.value.toLowerCase();
            let pluginsToSearch = pluginsData;
            // The sorting logic in renderPlugins already handles the "all-plugins" view
            // and the "non-working-plugins" filter.
            // We only need to pass the full pluginsData to renderPlugins and let it sort/filter.

            const filteredPlugins = pluginsToSearch.filter(plugin =>
                plugin.name.toLowerCase().includes(filter) ||
                plugin.description.toLowerCase().includes(filter)
            );
            renderPlugins(filteredPlugins); // Always re-render based on current filter and search
        });

        // --- Players Section Logic (ONLY PLAYERS FROM IMAGE) ---
        const playerSubNavButtons = document.querySelectorAll('#players-content .player-sub-nav button');
        const playerSubContents = document.querySelectorAll('#players-content .player-sub-content');
        const allPlayersList = document.getElementById('all-players-list');
        const allPlayersSearch = document.getElementById('all-players-search');
        const richestPlayersList = document.getElementById('richest-players-list');
        const taxedPlayersList = document.getElementById('taxed-players-list');

        // This data now STRICTLY reflects players from the image with CORRECTED balances
        const allPlayersData = [
            { name: 'Ansh', status: 'Online', edition: 'Java', balance: 1673671.60, taxPaid: 171693.69 },
            { name: '.Atharva3044', status: 'Online', edition: 'Bedrock', balance: 879.97, taxPaid: 23780.87 }, // Exchanged balance
            { name: '.Atharva4617', status: 'Offline', edition: 'Bedrock', balance: 893572.56, taxPaid: 20683 }, // Exchanged balance
        ];

        // Ensure these are derived *after* allPlayersData is complete and sorted.
        const topRichestData = [...allPlayersData].sort((a, b) => b.balance - a.balance).slice(0, 3);
        const topTaxedData = [...allPlayersData].sort((a, b) => b.taxPaid - a.taxPaid).slice(0, 3);


        function showPlayerSubSection(sectionId) {
            playerSubContents.forEach(content => {
                content.classList.remove('active');
            });
            playerSubNavButtons.forEach(button => {
                button.classList.remove('active');
            });

            document.getElementById(sectionId).classList.add('active');
            document.querySelector(`[data-player-sub-section="${sectionId.replace('-content', '')}"]`).classList.add('active');

            if (sectionId === 'all-players-content') {
                renderAllPlayers(allPlayersData); // Render all players on activation
            } else if (sectionId === 'top-richest-content') {
                renderRichestPlayers();
            } else if (sectionId === 'top-taxed-content') {
                renderTaxedPlayers();
            }
        }

        function renderAllPlayers(playersToRender) {
            allPlayersList.innerHTML = '';
            if (playersToRender.length === 0) {
                allPlayersList.innerHTML = '<li>No players found.</li>';
                return;
            }
            playersToRender.forEach(player => {
                const li = document.createElement('li');
                // Displaying only name, status, and edition as requested
                li.innerHTML = `<strong>${player.name}:</strong> <span>${player.status}, Edition: ${player.edition}</span>`;
                allPlayersList.appendChild(li);
            });
        }

        function renderRichestPlayers() {
            richestPlayersList.innerHTML = '';
            topRichestData.forEach((player, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${index + 1}. ${player.name}:</strong> <span>$${player.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
                richestPlayersList.appendChild(li);
            });
        }

        function renderTaxedPlayers() {
            taxedPlayersList.innerHTML = '';
            topTaxedData.forEach((player, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${index + 1}. ${player.name}:</strong> <span>$${player.taxPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
                taxedPlayersList.appendChild(li);
            });
        }


        playerSubNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.dataset.playerSubSection + '-content';
                showPlayerSubSection(targetSection);
            });
        });

        // Player search functionality
        allPlayersSearch.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const filteredPlayers = allPlayersData.filter(player =>
                player.name.toLowerCase().includes(filter)
            );
            renderAllPlayers(filteredPlayers);
        });


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
        function applyTheme() {
            const root = document.documentElement.style;
            const savedBoxColor = localStorage.getItem("--box-color");
            const savedGlowColor = localStorage.getItem("saved-glow-color");
            const savedGlowSpeed = localStorage.getItem("--glow-speed");
            const savedGlowBrightness = localStorage.getItem("--glow-brightness");
            const savedBgTheme = localStorage.getItem("--bg-theme");
            const savedGlowEnabled = localStorage.getItem("--glow-enabled");
            const savedTextLight = localStorage.getItem("--text-light");
            const savedAccentGreen = localStorage.getItem("--accent-green");
            const savedAccentBlue = localStorage.getItem("--accent-blue");


            if (savedBoxColor) root.setProperty('--box-color', savedBoxColor);
            if (savedGlowSpeed) root.setProperty('--glow-speed', savedGlowSpeed);
            if (savedGlowBrightness) root.setProperty('--glow-brightness', savedGlowBrightness);
            if (savedBgTheme) root.setProperty('--bg-theme', savedBgTheme);
            if (savedTextLight) root.setProperty('--text-light', savedTextLight);
            if (savedAccentGreen) root.setProperty('--accent-green', savedAccentGreen);
            if (savedAccentBlue) root.setProperty('--accent-blue', savedAccentBlue);

            // Apply glow based on toggle state
            const glowToggleCheckbox = document.getElementById("glowToggle");
            if (glowToggleCheckbox) {
                glowToggleCheckbox.checked = (savedGlowEnabled === "true");
                root.setProperty('--glow-color', (savedGlowEnabled === "true" && savedGlowColor) ? savedGlowColor : "transparent");
            } else {
                root.setProperty('--glow-color', (savedGlowEnabled === "true" && savedGlowColor) ? savedGlowColor : "transparent");
            }


            // Set input values to current theme values
            document.getElementById("boxColor").value = savedBoxColor || getComputedStyle(document.documentElement).getPropertyValue('--box-color');
            document.getElementById("glowColor").value = savedGlowColor || getComputedStyle(document.documentElement).getPropertyValue('--accent-green');
            document.getElementById("glowSpeed").value = parseFloat((savedGlowSpeed || '3s').replace('s', ''));
            document.getElementById("glowBrightness").value = parseFloat(savedGlowBrightness || '0.6');
            document.getElementById("bgTheme").value = (savedBgTheme && !savedBgTheme.startsWith("url('") && !savedBgTheme.startsWith("linear-gradient")) ? savedBgTheme : ''; // Clear if complex gradient/url for input
            document.getElementById("textLightColor").value = savedTextLight || getComputedStyle(document.documentElement).getPropertyValue('--text-light');
            document.getElementById("accentGreenColor").value = savedAccentGreen || getComputedStyle(document.documentElement).getPropertyValue('--accent-green');
            document.getElementById("accentBlueColor").value = savedAccentBlue || getComputedStyle(document.documentElement).getPropertyValue('--accent-blue');
        }

        function saveTheme() {
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


            localStorage.setItem("--box-color", box);
            localStorage.setItem("saved-glow-color", glow); /* Store the glow color separately */
            localStorage.setItem("--glow-speed", speed);
            localStorage.setItem("--glow-brightness", brightness);
            localStorage.setItem("--bg-theme", bg);
            localStorage.setItem("--glow-enabled", enableGlow);
            localStorage.setItem("--text-light", textLight);
            localStorage.setItem("--accent-green", accentGreen);
            localStorage.setItem("--accent-blue", accentBlue);


            root.setProperty("--box-color", box);
            root.setProperty("--glow-color", enableGlow ? glow : "transparent");
            root.setProperty("--glow-speed", speed);
            root.setProperty("--glow-brightness", brightness);
            root.setProperty("--bg-theme", bg);
            root.setProperty("--text-light", textLight);
            root.setProperty("--accent-green", accentGreen);
            root.setProperty("--accent-blue", accentBlue);


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


        // --- Initial Load & Authentication Check ---
        window.addEventListener("DOMContentLoaded", () => {
            applyTheme(); // Apply saved theme on load
            console.log('DOM Content Loaded. Checking authentication status...');

            const mainContentWrapper = document.getElementById("main-content-wrapper");
            const authScreen = document.getElementById("auth-screen");

            const storedAuthEmail = sessionStorage.getItem('current_auth_email');
            if (storedAuthEmail) {
                console.log('Found stored email in session. Attempting re-login...');
                const userJson = getSimulatedKVItem(storedAuthEmail);
                if (userJson) {
                    const user = JSON.parse(userJson);
                    currentUser = { email: user.email, uid: user.uid };
                    userProfile = user.profile;
                    console.log('Re-login successful with stored email. User:', currentUser.email);
                    handleSuccessfulAuth();
                } else {
                    console.log('Stored email not found in simulated KV. Showing auth screen.');
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
