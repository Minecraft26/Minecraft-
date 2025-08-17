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
            document.getElementById("server-port").textContent = "46471"; // Hardcoded as requested

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

                    // Display online players (from mcsrvstat.us, not our plugin data)
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

// --- Plugin Data & Render Logic ---
const pluginsData = [
    { name: "SkinsRestorer", description: "Ability to restore/change skins on servers! (Offline and Online Mode)", videoLink: "", detailsLink: "https://modrinth.com/plugin/skinsrestorer", status: "working" },
    { name: "ViaVersion", description: "Allow newer clients to connect to older servers.", videoLink: "", detailsLink: "https://modrinth.com/plugin/viaversion", status: "working" },
    { name: "LuckPerms", description: "A permissions plugin for Minecraft servers (Bukkit/Spigot, BungeeCord & more)", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/luckperms.28140/", status: "working" },
    { name: "Vault", description: "Vault is a Permissions, Chat, & Economy API to give plugins easy hooks into these systems.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/vault.34315/", status: "working" },
    { name: "ProtocolLib", description: "Provides read/write access to the Minecraft protocol", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/protocollib.1997/", status: "working" },
    { name: "CoreProtect", description: "CoreProtect is a fast, efficient, data logging and anti-griefing tool. Rollback and restore any amount of damage. Designed with large servers in mind, CoreProtect will record and manage data without impacting your server performance.", videoLink: "", detailsLink: "https://modrinth.com/plugin/coreprotect", status: "working" },
    { name: "NBTAPI", description: "Add custom NBT tags to Items/Tiles/Entities without NMS", videoLink: "", detailsLink: "https://modrinth.com/plugin/nbtapi", status: "working" },
    { name: "WorldEdit", description: "A Minecraft Map Editor... that runs in-game! With selections, schematics, copy and paste, brushes, and scripting. Use it in creative, or use it temporarily in survival.", videoLink: "", detailsLink: "https://modrinth.com/plugin/worldedit", status: "working" },
    { name: "QuickShopHikari", description: "A shop plugin that allows players to easily sell/buy any items from a chest without any commands.", videoLink: "", detailsLink: "https://modrinth.com/plugin/quickshophikari", status: "working" },
    { name: "MultiverseCore", description: "The Bukkit World Management Plugin.", videoLink: "", detailsLink: "https://modrinth.com/plugin/multiverse-core", status: "working" },
    { name: "BKCommonLib", description: "Spigot/Paper Utility Library and Minecraft Server API", videoLink: "", detailsLink: "https://modrinth.com/plugin/bkcommonlib", status: "working" },
    { name: "PicoJobs", description: "An amazing plugin that allows you to create your own jobs for your players. The plugin is 100% configurable so you can change everything you see, it is also open-source if you want to take a look on how it's made.", videoLink: "", detailsLink: "https://modrinth.com/plugin/picojobs", status: "working" },
    { name: "BedrockArmorstands", description: "Simply makes armorstands have arms by default like in bedrock edition!", videoLink: "", detailsLink: "https://modrinth.com/plugin/bedrockarmorstands", status: "working" },
    { name: "ZNPCsPlus", description: "An updated version of ZNPCs", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/znpcsplus.106394/", status: "working" },
    { name: "PlaceholderAPI", description: "A resource that allows information from your favorite plugins be shown practically anywhere!", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/placeholderapi.6245/", status: "working" },
    { name: "EconomyShopGUI", description: "A simple and free to use GUI shop plugin", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/economyshopgui.6009/", status: "working" },
    { name: "BeastLib", description: "BeastLib is dependency for Beast plugins like BeastWithdraw, BeastTokens & BeastSpawners", videoLink: "", detailsLink: "https://modrinth.com/plugin/beastlib", status: "working" },
    { name: "GeyserSpigot", description: "GeyserMC is a bridge/proxy allowing you to connect to Minecraft: Java Edition servers with Minecraft: Bedrock Edition.", videoLink: "", detailsLink: "https://modrinth.com/plugin/geyser", status: "working" },
    { name: "floodgate", description: "Hybrid mode plugin to allow for connections from Geyser to join online mode servers. Made to be installed with GeyserMC.", videoLink: "", detailsLink: "https://geysermc.org/download#floodgate", status: "working" },
    { name: "Maintenance", description: "The most customizable free maintenance plugin for your Minecraft server you can find. It runs on Paper, Velocity, Bungee, as well as Sponge.", videoLink: "", detailsLink: "https://modrinth.com/plugin/maintenance", status: "working" },
    { name: "Craftmoto Lite", description: "Cars, Trains, Boats, Planes | Highly Customizable Vehicles | LITE", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/craftmoto-lite.49009/", status: "working" },
    { name: "Train_Carts", description: "Minecarts redefined", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/traincarts.3959/", status: "working" },
    { name: "EssentialsX", description: "Core plugin for server management, homes, warps, kits, and more.", videoLink: "", detailsLink: "https://essentialsx.net/wiki.html", status: "working" },
    { name: "NSR-AI", description: "Custom AI plugin for server management.", videoLink: "", detailsLink: "", status: "working" },
    { name: "NSR-Money", description: "Custom money management plugin.", videoLink: "", detailsLink: "", status: "working" },
    { name: "worldpluginmanager", description: "Custom plugin manager for server worlds.", videoLink: "", detailsLink: "", status: "working" },
    { name: "salary-plugin", description: "Custom salary management plugin.", videoLink: "", detailsLink: "", status: "working" },
    { name: "GSit", description: "Allows players to sit on stairs and other blocks.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/gsit.62396/", status: "working" },
    { name: "ImageMapRenderer", description: "Renders images on maps in Minecraft.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/imagemaprenderer.10000/", status: "working" },
    { name: "sleepmost", description: "A plugin to manage player sleep on the server.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/sleepmost.60623/", status: "working" },
    { name: "ChestLocker", description: "Allows players to lock chests and other containers.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/chestlocker.10000/", status: "working" },
    { name: "NoChatReports", description: "Disables chat reporting on the server.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/nochatreports.10000/", status: "working" }
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