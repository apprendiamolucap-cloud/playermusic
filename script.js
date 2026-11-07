// 1. DATA SEMPRE AGGIORNATA
function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.innerText = new Date().toLocaleDateString('en-US', options);
    }
}
updateDate();

// 2. NAVIGAZIONE TRA SCHERMATE
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.add('active-screen');
    
    const nav = document.getElementById('main-nav');
    if (nav) {
        nav.style.display = (screenId === 'screen-login') ? 'none' : 'flex';
    }
    
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-target') === screenId);
    });
}

function goToHome() { showScreen('screen-home'); }

document.addEventListener("DOMContentLoaded", () => {
    // Gestione click sulla barra di navigazione
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showScreen(this.getAttribute('data-target'));
        });
    });

    // Inizializza la vista della libreria
    updateLibraryView();
});

// 3. YOUTUBE PLAYER (Configurato per funzionare su Chrome)
let player;
let isPlayerReady = false;
let progressInterval;
let currentVideoTitle = "Nessuna canzone";

// Carica l'API di YouTube
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player-container', {
        height: '100', 
        width: '100', 
        videoId: '',
        playerVars: { 
            'autoplay': 0, 
            'controls': 0, 
            'origin': window.location.origin, 
            'playsinline': 1 
        },
        events: {
            'onReady': () => { isPlayerReady = true; },
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError // Gestisce gli errori (es. video bloccati su iPhone)
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        document.getElementById('play-pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
        startProgressBar();
    } else {
        document.getElementById('play-pause-btn').innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(progressInterval);
    }
}

// Funzione chiamata se il video dà errore (es. bloccato su iOS)
function onPlayerError(event) {
    let errorMsg = "Video non disponibile.";
    if (event.data == 150 || event.data == 101) {
        errorMsg = "Questo video è bloccato su iPhone. Prova da PC o con un'altra canzone.";
    }
    document.getElementById('now-playing-title').innerText = "⚠️ " + errorMsg;
    document.getElementById('play-pause-btn').innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    clearInterval(progressInterval);
}

// 4. CONTROLLI DI RIPRODUZIONE
function playYouTube(videoId, title) {
    if (!isPlayerReady) { alert("Player in caricamento, attendere..."); return; }
    
    currentVideoTitle = title;
    document.getElementById('now-playing-title').innerText = title;
    
    // Mostra la barra con animazione
    const bar = document.getElementById('now-playing-bar');
    bar.classList.remove('hidden');
    setTimeout(() => bar.classList.add('visible'), 10);
    
    // Carica il video (senza forzare il play automatico per evitare blocchi)
    player.loadVideoById(videoId);
}

function togglePlay() {
    if (!player || !isPlayerReady) return;
    
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function seekForward() { 
    if (player && player.getCurrentTime) {
        player.seekTo(player.getCurrentTime() + 10, true); 
    }
}

function seekBackward() { 
    if (player && player.getCurrentTime) {
        player.seekTo(Math.max(0, player.getCurrentTime() - 10), true); 
    }
}

function closePlayer() {
    if (player && player.stopVideo) player.stopVideo();
    
    const bar = document.getElementById('now-playing-bar');
    bar.classList.remove('visible');
    setTimeout(() => bar.classList.add('hidden'), 400);
    
    document.getElementById('progress-bar-fill').style.width = '0%';
    clearInterval(progressInterval);
}

function startProgressBar() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (player && player.getDuration) {
            const duration = player.getDuration();
            const current = player.getCurrentTime();
            if (duration > 0) {
                document.getElementById('progress-bar-fill').style.width = `${(current / duration) * 100}%`;
            }
        }
    }, 500);
}

// 5. DATABASE CANZONI NABI
const databaseCanzoni = [
    { id: 'fCE9mDVdr5A', title: 'GUERRILIA', artist: 'NABI' },
    { id: 'lKSPKbBVGgU', title: 'WROOM WROOM', artist: 'NABI' },
    { id: 'J_p80876Wgw', title: 'CALIBRO', artist: 'NABI' },
    { id: 'TVqeYBxhPgg', title: 'GRANATA (feat. 22 Simba)', artist: 'NABI' },
    { id: 'q8PV8gd-Bl0', title: 'ZEPECK', artist: 'NABI' },
    { id: 'Po25COLLYus', title: 'Notte in Caserma', artist: 'NABI' },
    { id: 'cPykUOIGisA', title: 'NEW YORK', artist: 'NABI' }
];

// 6. FUNZIONE DI RICERCA
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';

        if (query.length < 2) return; 

        const filtered = databaseCanzoni.filter(song => 
            song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<p style="color: #b3a1a8; font-size: 14px; padding: 10px;">Nessun risultato trovato.</p>';
            return;
        }

        filtered.forEach(song => {
            const div = document.createElement('div');
            div.className = 'track-item';
            div.innerHTML = `
                <div class="track-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
                <button class="add-btn" onclick="addToLibrary('${song.id}', '${song.title.replace(/'/g, "\\'")}', '${song.artist}')">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            resultsContainer.appendChild(div);
        });
    });
}

// 7. LOGICA LIBRERIA
let myLibrary = [];

function addToLibrary(id, title, artist) {
    if (myLibrary.some(song => song.id === id)) {
        alert("Questa canzone è già nella tua libreria!");
        return;
    }
    
    myLibrary.push({ id, title, artist });
    updateLibraryView();
    alert(`"${title}" aggiunta alla libreria!`);
}

function updateLibraryView() {
    const trackList = document.getElementById('main-track-list');
    const countSpan = document.getElementById('library-count');
    
    if (!trackList || !countSpan) return;
    
    trackList.innerHTML = '';

    if (myLibrary.length === 0) {
        trackList.innerHTML = '<p style="color: #b3a1a8; font-size: 14px; padding: 10px;">La tua libreria è vuota. Vai su "Cerca" e aggiungi le tue canzoni preferite!</p>';
        countSpan.innerText = `0 brani • Santos_Lukas`;
    } else {
        myLibrary.forEach((song, index) => {
            const div = document.createElement('div');
            div.className = 'track-item';
            div.innerHTML = `
                <span class="track-number">${index + 1}</span>
                <div class="track-info"><h4>${song.title}</h4><p>${song.artist}</p></div>
                <i class="fas fa-play-circle" style="color:#FFB7C5;"></i>
            `;
            div.onclick = () => playYouTube(song.id, song.title);
            trackList.appendChild(div);
        });
        countSpan.innerText = `${myLibrary.length} brani • Santos_Lukas`;
    }
}
