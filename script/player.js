// --- Players Section Logic (ONLY PLAYERS FROM IMAGE) ---
const playerSubNavButtons = document.querySelectorAll('#players-content .player-sub-nav button');
const playerSubContents = document.querySelectorAll('#players-content .player-sub-content');
const allPlayersList = document.getElementById('all-players-list');
const allPlayersSearch = document.getElementById('all-players-search');
const richestPlayersList = document.getElementById('richest-players-list');
const taxedPlayersList = document.getElementById('taxed-players-list');

let allPlayersData = [];

async function fetchPlayers() {
    const response = await fetch('https://mainweb.mk2899833.workers.dev/players');
    allPlayersData = await response.json();
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
        let status = '<span class="status-online">Online</span>';
        let lastSeen = '';
        if (!player.online) {
            if (player.lastSeen < twoDaysAgo) {
                status = '<span class="status-inactive">Inactive</span>';
            } else {
                status = '<span class="status-offline">Offline</span>';
            }
            lastSeen = ` (Last seen: ${new Date(player.lastSeen).toLocaleString()}`;
        }

        const edition = player.isBedrock ? 'Bedrock' : 'Java';

        li.innerHTML = `<strong>${player.name}:</strong> <span>${status}, Edition: ${edition}${lastSeen})</span>`;
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