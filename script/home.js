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
                const playersResponse = await fetch('https://mainweb.mk2899833.workers.dev/players');
                const allPlayers = await playersResponse.json();

                const onlinePlayers = allPlayers.filter(p => p.online);
                const totalPlayers = Object.keys(allPlayers).length;

                if (onlinePlayers.length > 0) {
                    statusDiv.innerHTML = "🟢 Online";
                    statusDiv.className = "status-online";
                    playersDiv.innerHTML = `👥 ${onlinePlayers.length}/${totalPlayers} Players`;
                    serverControlOptions.innerHTML = `<button style="background-color: var(--button-red);" disabled><i class="fas fa-stop"></i> Server Running</button>`;

                    let playersListHtml = onlinePlayers.map(p => `<li><span>${p.name}</span></li>`).join('');
                    onlinePlayersList.innerHTML = playersListHtml;
                } else {
                    statusDiv.innerHTML = "🔴 Offline";
                    statusDiv.className = "status-offline";
                    playersDiv.innerHTML = "";
                    onlinePlayersList.innerHTML = '<li>Server is offline or no players are currently online.</li>';
                    serverControlOptions.innerHTML = `<a href="https://freemcserver.net/server/1524209" target="_blank"><button style="background-color: var(--button-primary);"><i class="fas fa-play"></i> Start Server</button></a>`;
                }
            } catch (error) {
                console.error("Fetch error:", error);
                statusDiv.innerHTML = "⚠️ Network Error: Cannot reach API.";
                statusDiv.className = "status-offline";
                playersDiv.innerHTML = '<li>Network error. Please check your connection.</li>';
                serverControlOptions.innerHTML = `<a href="https://freemcserver.net/server/1524209" target="_blank"><button style="background-color: var(--button-primary);"><i class="fas fa-play"></i> Start Server</button></a>`;
            }
        }

fetchServerStatus(); // Initial call
setInterval(fetchServerStatus, 5000); // Repeat every 5 seconds

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