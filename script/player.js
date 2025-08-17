// --- Players Section Logic (ONLY PLAYERS FROM IMAGE) ---
const playerSubNavButtons = document.querySelectorAll('#players-content .player-sub-nav button');
const playerSubContents = document.querySelectorAll('#players-content .player-sub-content');
const allPlayersList = document.getElementById('all-players-list');
const allPlayersSearch = document.getElementById('all-players-search');
const richestPlayersList = document.getElementById('richest-players-list');
const taxedPlayersList = document.getElementById('taxed-players-list');

let allPlayersData = [];

function formatTimeAgo(timestamp) {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} days ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} months ago`;

    const years = Math.floor(months / 12);
    return `${years} years ago`;
}

function formatPlaytime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

async function fetchPlayers() {
    const response = await fetch('https://mainweb.mk2899833.workers.dev/players');
    allPlayersData = await response.json();

    // Re-calculate topRichestData and topTaxedData after fetching allPlayersData
    topRichestData = [...allPlayersData].sort((a, b) => b.balance - a.balance).slice(0, 3);
    topTaxedData = [...allPlayersData].sort((a, b) => b.taxPaid - a.taxPaid).slice(0, 3);

    renderAllPlayers(allPlayersData);
}

// This data now STRICTLY reflects players from the image with CORRECTED balances


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
        const twoDaysAgo = new Date().getTime() - (2 * 24 * 60 * 60 * 1000);
        let statusText = '';
        let lastSeenHtml = '';
        let playtimeHtml = '';

        if (player.online) {
            statusText = '<span class="status-online">Online</span>';
            playtimeHtml = `<br><small>Online for: ${formatPlaytime(player.onlineTime)}</small>`;
        } else {
            if (player.lastSeen && player.lastSeen < twoDaysAgo) {
                statusText = '<span class="status-inactive">Inactive</span>';
            } else {
                statusText = '<span class="status-offline">Offline</span>';
            }
            if (player.lastSeen) {
                lastSeenHtml = `<br><small>Last seen: ${formatTimeAgo(player.lastSeen)}</small>`;
            }
        }

        const displayName = player.name.startsWith('.') ? player.name.substring(1) : player.name;
        const edition = player.isBedrock ? 'Bedrock' : 'Java';

        li.innerHTML = `<strong>${displayName}:</strong> <span>${statusText}, Edition: ${edition}</span>${lastSeenHtml}${playtimeHtml}`;
        allPlayersList.appendChild(li);
    });
}

function renderRichestPlayers() {
    richestPlayersList.innerHTML = '';
    topRichestData.forEach((player, index) => {
        const li = document.createElement('li');
        const displayName = player.name.startsWith('.') ? player.name.substring(1) : player.name;
        const edition = player.isBedrock ? 'Bedrock' : 'Java';
        let statusText = '';
        if (player.online) {
            statusText = '<span class="status-online">Online</span>';
        } else if (player.lastSeen && player.lastSeen < (new Date().getTime() - (2 * 24 * 60 * 60 * 1000))) {
            statusText = '<span class="status-inactive">Inactive</span>';
        } else {
            statusText = '<span class="status-offline">Offline</span>';
        }

        li.innerHTML = `<strong>${index + 1}. ${displayName}:</strong> <span>${player.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><br><small>Edition: ${edition} (${statusText})</small>`;
        richestPlayersList.appendChild(li);
    });
}

function renderTaxedPlayers() {
    taxedPlayersList.innerHTML = '';
    topTaxedData.forEach((player, index) => {
        const li = document.createElement('li');
        const displayName = player.name.startsWith('.') ? player.name.substring(1) : player.name;
        const edition = player.isBedrock ? 'Bedrock' : 'Java';
        let statusText = '';
        if (player.online) {
            statusText = '<span class="status-online">Online</span>';
        } else if (player.lastSeen && player.lastSeen < (new Date().getTime() - (2 * 24 * 60 * 60 * 1000))) {
            statusText = '<span class="status-inactive">Inactive</span>';
        } else {
            statusText = '<span class="status-offline">Offline</span>';
        }

        li.innerHTML = `<strong>${index + 1}. ${displayName}:</strong> <span>${player.taxPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><br><small>Edition: ${edition} (${statusText})</small>`;
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