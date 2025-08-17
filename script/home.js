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
    { name: "BeastLib", description: "BeastLib serves as a core dependency for Beast-series plugins like BeastWithdraw, BeastTokens, and BeastSpawners. It bundles essential libraries and utilities—such as JSON parsing, NBT handling, and database connection pools—to shrink plugin sizes and streamline updates. Though it doesn’t add gameplay features, it ensures reliable performance and compatibility.", videoLink: "", detailsLink: "", status: "working" },
    { name: "BedrockArmorstands", description: "Automatically gives armor stands arms by default to mimic Bedrock Edition behavior. No manual NBT editing or commands required—just install and enjoy built-in flexibility. Ideal for building, roleplay, or aesthetic enhancements.", videoLink: "", detailsLink: "", status: "working" },
    { name: "BKCommonLib", description: "A utility library required by plugins such as Train_Carts. Provides internal fixes, advanced mechanics, and streamlined compatibility across server versions. Not a user-facing plugin, but essential for supporting smoother plugin functionality.", videoLink: "", detailsLink: "", status: "working" },
    { name: "ChestLocker", description: "Allows players to lock containers—like chests, barrels, and furnaces—for privacy and protection. Supports admin overrides, permissions-based access, and configurable lock types. Perfect for survival or economy servers focused on secure item storage.", videoLink: "", detailsLink: "", status: "working" },
        { name: "CoreProtect", description: "A high-performance anti-griefing and logging plugin for Minecraft. Logs block placements, removals, chest access, and more—it supports fast rollback and restore operations. Multi-threaded and optimized to handle large servers without lag. No configuration needed—just drop it in and go.", videoLink: "https://www.youtube.com/embed/8i52CZ9U1nI", detailsLink: "https://modrinth.com/plugin/coreprotect", status: "working" },
    { name: "EconomyShopGUI", description: "Provides an intuitive in-game GUI shop for buying and selling items via a Vault-supported economy. Fully customizable categories, items, and layouts; supports multiple currencies and seasonal pricing. Reloadable in-game and compatible with Minecraft 1.8–1.21.", videoLink: "https://www.youtube.com/embed/zhDAtuROTfk", detailsLink: "https://www.spigotmc.org/resources/economyshopgui.6009/", status: "working" },
    { name: "EssentialsX", description: "An all-in-one powerhouse plugin that brings homes, warps, kits, chat tools, and admin commands to your server. Includes moderation utilities like /ban, /mute, nicknames, economy commands, and more—modular and deeply configurable. Widely used across Minecraft server landscapes for managing core server functions.", videoLink: "https://www.youtube.com/embed/EqJlSOcZzKA", detailsLink: "https://essentialsx.net/wiki.html", status: "working" },
    { name: "Train_Carts", description: "Completely redefines minecart behavior with advanced rails, turntables, and switches. Adds smooth movement, scripting, and configurable cart physics. Perfect for rail-based networks, theme parks, or automated transports.", videoLink: "https://www.youtube.com/embed/ECZdL9rUAkc", detailsLink: "https://www.spigotmc.org/resources/traincarts.3959/", status: "working" },
    { name: "Craftmoto Lite", description: "Adds customizable vehicles—including cars, boats, trains, and planes—to your server. Players can craft, mount, and drive them for immersive travel and roleplay. A lightweight version of Craftmoto—easier to set up, with streamlined features.", videoLink: "", detailsLink: "", status: "working" },
    { name: "EconomyShopGUI", description: "Provides an intuitive in-game GUI shop for buying and selling items via a Vault-supported economy. Fully customizable categories, items, and layouts; supports multiple currencies and seasonal pricing. Reloadable in-game and compatible with Minecraft 1.8–1.21.", videoLink: "https://www.youtube.com/watch?v=zhDAtuROTfk", detailsLink: "https://www.spigotmc.org/resources/economyshopgui.6009/", status: "working" },
    { name: "EssentialsX", description: "An all-in-one powerhouse plugin that brings homes, warps, kits, chat tools, and admin commands to your server. Includes moderation utilities like /ban, /mute, nicknames, economy commands, and more—modular and deeply configurable. Widely used across Minecraft server landscapes for managing core server functions.", videoLink: "https://www.youtube.com/watch?v=EqJlSOcZzKA", detailsLink: "https://essentialsx.net/", status: "working" },
    { name: "floodgate", description: "Enables Bedrock edition players to join Java servers running in online mode. Acts in conjunction with GeyserMC to facilitate cross-play access. Provides seamless, account-free connectivity for Bedrock users.", videoLink: "", detailsLink: "https://geysermc.org/download#floodgate", status: "working" },
    { name: "GeyserSpigot", description: "A proxy plugin that lets Bedrock clients connect to Java edition Minecraft servers. Bridges the communication gap by translating between Bedrock protocol and Java server environments. Essential for cross-platform server accessibility.", videoLink: "", detailsLink: "https://modrinth.com/plugin/geyser", status: "working" },
    { name: "GSit", description: "Adds the ability for players to sit on stairs, slabs, and other blocks. Simple, immersive mechanic ideal for roleplay, storytelling, or decorative scenes. No commands needed—just right-click to sit.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/gsit.62396/", status: "working" },
    { name: "ImageMapRenderer", description: "Allows rendering of custom images on in-game maps. Perfect for displays, custom art, or server branding. Supports a variety of image formats and auto-adjusts to map resolution.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/imagemaprenderer.10000/", status: "working" },
    { name: "LuckPerms", description: "A powerful and flexible permissions plugin for Bukkit/Spigot, BungeeCord, and other server platforms. Handles complex permission setups, groups, inheritance, and migration with ease. Supports integrations with various chat and economy plugins.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/luckperms.28140/", status: "working" },
    { name: "Maintenance", description: "Lets you easily enable maintenance mode with customizable messages. Compatible with Paper, Velocity, Bungee, and Sponge environments. Ideal for server updates, backups, or break periods.", videoLink: "", detailsLink: "https://modrinth.com/plugin/maintenance", status: "working" },
    { name: "MultiverseCore", description: "Manage multiple worlds on your server with tools for teleportation, world creation, and permissions. Supports overriding world properties and portals across worlds. Crucial for servers offering separate zones like minigames, hubs, or themed areas.", videoLink: "", detailsLink: "https://modrinth.com/plugin/multiverse-core", status: "working" },
    { name: "NBTAPI", description: "Adds the ability to add, read, and modify custom NBT tags for items, entities, and blocks. No need for NMS—user-friendly API access. Great for developers adding persistent, tag-based features to items and gameplay.", videoLink: "", detailsLink: "https://modrinth.com/plugin/nbtapi", status: "working" },
    { name: "NoChatReports", description: "Disables Minecraft's chat-reporting system server-side. Privatizes chat, making it safe from automated reporting mechanisms. Ideal for custom servers within controlled communities.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/nochatreports.10000/", status: "working" },
    { name: "NSR-AI", description: "A custom AI plugin to automate server tasks and management functions. Enables behavior scripting, NPC automation, or event triggers. Good for dynamic interactions or automated moderation features.", videoLink: "", detailsLink: "", status: "working" },
    { name: "NSR-Money", description: "Customizable economy plugin for managing money systems. Enables flexible reward and payment mechanics tailored to your server's setup. Works alone or alongside other economy tools.", videoLink: "", detailsLink: "", status: "working" },
    { name: "PicoJobs", description: "Create custom job systems for players with flexible configuration. Jobs can reward with items, money, or tokens—and are open-source for customization. Great for RPG servers or player progression systems.", videoLink: "", detailsLink: "https://modrinth.com/plugin/picojobs", status: "working" },
    { name: "PlaceholderAPI", description: "Central resource plugin to display dynamic plugin data (like economy, permissions, or stats) across chat, GUIs, and signs. Supports numerous plugins and is essential for integrated information displays. Highly modular with many expansions.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/placeholderapi.6245/", status: "working" },
    { name: "ProtocolLib", description: "Gives developers low-level access to the Minecraft network protocol. Easily intercept, modify, or create packets without diving into NMS. Widely used as a dependency for advanced features like GUIs or animation.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/protocollib.1997/", status: "working" },
    { name: "QuickShopHikari", description: "Chest-based shop plugin allowing players to buy/sell items via interactive chests—no commands needed. Supports streamlined GUIs, quick configuration, and Vault integration. Perfect for economy-focused or survival servers.", videoLink: "", detailsLink: "https://modrinth.com/plugin/quickshophikari", status: "working" },
    { name: "salary-plugin", description: "Custom plugin to manage and assign salaries to players. Supports scheduled payouts and configurable payment types. Best suited for servers with job, rank, or tiered progression systems.", videoLink: "", detailsLink: "", status: "working" },
    { name: "SkinsRestorer", description: "Enables players to change or restore their skins on both offline and online-mode servers. Provides skin customization independent of Mojang servers. Great for private servers or modded setups.", videoLink: "", detailsLink: "https://modrinth.com/plugin/skinsrestorer", status: "working" },
    { name: "sleepmost", description: "Enhances the sleeping mechanic by allowing a configurable number of players—rather than all—to sleep and skip the night. Adds realism and flexibility for multiplayer worlds. No hassle; just install and configure how many sleepers are needed.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/sleepmost.60623/", status: "working" },
    { name: "Train_Carts", description: "Completely redefines minecart behavior with advanced rails, turntables, and switches. Adds smooth movement, scripting, and configurable cart physics. Perfect for rail-based networks, theme parks, or automated transports.", videoLink: "https://www.youtube.com/watch?v=ECZdL9rUAkc", detailsLink: "https://www.spigotmc.org/resources/traincarts.3959/", status: "working" },
    { name: "Vault", description: "A central API to connect permissions, economy, and chat plugins. Provides a common interface for plugin interoperability. Essential backbone plugin for most economy or permissions setups.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/vault.34315/", status: "working" },
    { name: "ViaVersion", description: "Allows newer Minecraft clients to connect to older server versions. Enables compatibility across versions—no need to update the server immediately. Useful for managing updates or keeping lag-free older builds.", videoLink: "", detailsLink: "https://modrinth.com/plugin/viaversion", status: "working" },
    { name: "WorldEdit", description: "In-game map editing with tools like selections, schematics, brushes, scripting, and paste/copy functionality. Ideal for both creative building and large-scale terrain edits. Powerful yet accessible—runs in creative or survival.", videoLink: "", detailsLink: "https://modrinth.com/plugin/worldedit", status: "working" },
    { name: "worldpluginmanager", description: "Custom plugin manager for handling server worlds. Simplifies enabling, disabling, and loading worlds dynamically. Great for multi-world servers or managing world-specific mods.", videoLink: "", detailsLink: "", status: "working" },
    { name: "ZNPCsPlus", description: "Updated version of ZNPCs for creating interactive NPCs. Supports dialogues, commands, gear, and custom behaviors. Excellent when combined with Quest or shop plugins.", videoLink: "", detailsLink: "https://www.spigotmc.org/resources/znpcsplus.106394/", status: "working" }
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