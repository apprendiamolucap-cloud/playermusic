// 1. DATA SEMPRE AGGIORNATA
function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('current-date').innerText = today;
}
updateDate();

// 2. NAVIGAZIONE
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active-screen'));
    document.getElementById(screenId).classList.add('active-screen');

    const nav = document.getElementById('main-nav');
    nav.style.display = (screenId === 'screen-login') ? 'none' : 'flex';

    const navLinks = document.querySelectorAll('.bottom-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('data-target') === screenId) link.classList.add('active');
    });
}
function goToHome() { showScreen('screen-home'); }

document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.bottom-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showScreen(this.getAttribute('data-target'));
        });
    });
});

// 3. INIZIALIZZAZIONE AUDIUS SDK
const audiusScript = document.createElement('script');
audiusScript.src = "https://cdn.jsdelivr.net/npm/@audius/sdk@latest/dist/sdk.min.js";
audiusScript.onload = () => {
    window.audiusSdk = window.audiusSdk({
        appName: 'Cherry Soundscape'
    });
    console.log("Audius SDK pronto!");
};
document.head.appendChild(audiusScript);

// 4. GESTIONE RICERCA
const searchInput = document.querySelector('.search-bar input');
// Aggiungiamo un contenitore per i risultati della ricerca se non esiste
let searchResultsContainer = document.getElementById('search-results');
if (!searchResultsContainer) {
    searchResultsContainer = document.createElement('div');
    searchResultsContainer.id = 'search-results';
    searchResultsContainer.className = 'section';
    // Lo inseriamo nella schermata di ricerca, dopo la barra
    const searchScreen = document.getElementById('screen-search');
    searchScreen.appendChild(searchResultsContainer);
}

// Funzione per cercare
async function searchTracks(query) {
    if (!query) return;
    searchResultsContainer.innerHTML = '<p style="padding: 20px; color: #b3a1a8;">Ricerca in corso...</p>';
    
    try {
        const response = await window.audiusSdk.tracks.searchTracks({ query: query });
        const tracks = response.data;
        
        searchResultsContainer.innerHTML = ''; // Svuota
        
        if (tracks.length === 0) {
            searchResultsContainer.innerHTML = '<p style="padding: 20px; color: #b3a1a8;">Nessun risultato trovato.</p>';
            return;
        }

        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        sectionHeader.innerHTML = '<h2>Risultati della ricerca</h2>';
        searchResultsContainer.appendChild(sectionHeader);

        tracks.slice(0, 15).forEach(track => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.style.cursor = 'default'; // Non cliccabile per intero
            
            trackItem.innerHTML = `
                <div class="track-info" style="flex: 1;">
                    <h4>${track.title}</h4>
                    <p>${track.user.name}</p>
                </div>
                <button class="add-to-library-btn" data-track-id="${track.id}" data-track-title="${track.title}" data-artist-name="${track.user.name}" style="background: #DE3163; border: none; color: white; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px; display: flex; justify-content: center; align-items: center;">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            searchResultsContainer.appendChild(trackItem);
        });

        // Aggiungi eventi ai pulsanti "+"
        document.querySelectorAll('.add-to-library-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackId = e.currentTarget.getAttribute('data-track-id');
                const trackTitle = e.currentTarget.getAttribute('data-track-title');
                const artistName = e.currentTarget.getAttribute('data-artist-name');
                addToLibrary(trackId, trackTitle, artistName);
            });
        });

    } catch (error) {
        console.error("Errore nella ricerca:", error);
        searchResultsContainer.innerHTML = '<p style="padding: 20px; color: #b3a1a8;">Errore durante la ricerca.</p>';
    }
}

// Ascolta l'input nella barra di ricerca (con un piccolo ritardo per non sovraccaricare)
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchTracks(e.target.value);
    }, 500); // Aspetta mezzo secondo dopo che l'utente smette di scrivere
});

// 5. GESTIONE LIBRERIA (Aggiunta e visualizzazione)
let myLibrary = []; // Array per memorizzare le canzoni aggiunte

function addToLibrary(trackId, trackTitle, artistName) {
    // Controlla se esiste già
    if (myLibrary.some(song => song.id === trackId)) {
        alert("Questa canzone è già nella tua libreria!");
        return;
    }
    
    myLibrary.push({ id: trackId, title: trackTitle, artist: artistName });
    updateLibraryView();
    
    // Piccolo feedback visivo
    alert(`"${trackTitle}" aggiunta alla libreria!`);
}

function updateLibraryView() {
    const trackList = document.querySelector('#screen-library .track-list');
    if (!trackList) return;

    trackList.innerHTML = ''; // Svuota

    if (myLibrary.length === 0) {
        trackList.innerHTML = '<p style="padding: 20px; color: #b3a1a8;">La tua libreria è vuota. Cerca delle canzoni e aggiungile con il tasto +.</p>';
    } else {
        myLibrary.forEach((song, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.setAttribute('onclick', `playAudiusTrack('${song.id}', '${song.title}')`);
            
            trackItem.innerHTML = `
                <span class="track-number">${index + 1}</span>
                <div class="track-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
                <i class="fas fa-play-circle" style="color:#FFB7C5;"></i>
            `;
            trackList.appendChild(trackItem);
        });
    }

    // Aggiorna il contatore
    const playlistInfo = document.querySelector('.playlist-info p');
    if (playlistInfo) {
        playlistInfo.innerText = `${myLibrary.length} brani • Santos_Lukas`;
    }
}

// Inizializza la vista della libreria al caricamento
document.addEventListener("DOMContentLoaded", () => {
    // Aspetta che l'SDK sia pronto prima di inizializzare la vista
    const checkSdk = setInterval(() => {
        if (window.audiusSdk) {
            clearInterval(checkSdk);
            updateLibraryView();
        }
    }, 500);
});

// 6. RIPRODUZIONE AUDIO (Metodo corretto)
let audioPlayer = new Audio(); // Usa un player audio nativo

async function playAudiusTrack(trackId, trackTitle) {
    try {
        // USA getTrackStreamUrl per ottenere l'URL corretto
        const streamUrl = await window.audiusSdk.tracks.getTrackStreamUrl({ trackId: trackId });
        
        audioPlayer.src = streamUrl;
        audioPlayer.play();
        
        // Mostra il mini player
        const miniPlayer = document.getElementById('mini-player');
        if(miniPlayer) {
            miniPlayer.classList.remove('mini-player-hidden');
            miniPlayer.classList.add('mini-player-visible');
            document.getElementById('now-playing-title').innerText = "▶ " + trackTitle;
        }
        
    } catch (error) {
        console.error("Errore nella riproduzione:", error);
        alert("Impossibile riprodurre questa traccia.");
    }
}

// Funzione per fermare la musica
function stopMusic() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
    const miniPlayer = document.getElementById('mini-player');
    if(miniPlayer) {
        miniPlayer.classList.remove('mini-player-visible');
        miniPlayer.classList.add('mini-player-hidden');
    }
}
