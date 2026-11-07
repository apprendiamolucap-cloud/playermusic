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

// 3. AUDIUS PLAYER (Sostituisce YouTube)
// Carichiamo l'SDK di Audius
const audiusScript = document.createElement('script');
audiusScript.src = "https://cdn.jsdelivr.net/npm/@audius/sdk@latest/dist/sdk.min.js";
audiusScript.onload = () => {
    console.log("Audius SDK caricato!");
    // Inizializziamo l'SDK SENZA API Key (solo lettura)
    window.audiusSdk = window.audiusSdk({
        appName: 'Cherry Soundscape'
    });
    
    // Popoliamo la lista appena l'SDK è pronto
    loadNabiTracks();
};
document.head.appendChild(audiusScript);

// Funzione per cercare e caricare le canzoni di NABI
async function loadNabiTracks() {
    try {
        // Cerchiamo le tracce dell'artista "NABI"
        const response = await window.audiusSdk.tracks.searchTracks({ query: 'NABI' });
        const tracks = response.data;
        
        const trackList = document.querySelector('.track-list');
        if (!trackList) return;
        
        trackList.innerHTML = ''; // Svuota la lista
        
        if (tracks.length === 0) {
            trackList.innerHTML = '<p style="color: #b3a1a8; padding: 20px;">Nessuna traccia di NABI trovata su Audius.</p>';
            return;
        }

        tracks.slice(0, 10).forEach((track, index) => { // Mostriamo le prime 10
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            // Usiamo i dati di Audius per creare la riga
            trackItem.innerHTML = `
                <span class="track-number">${index + 1}</span>
                <div class="track-info">
                    <h4>${track.title}</h4>
                    <p>${track.user.name}</p>
                </div>
                <button class="play-audius-btn" data-track-id="${track.id}">
                    <i class="fas fa-play-circle" style="color:#FFB7C5; font-size: 20px;"></i>
                </button>
            `;
            trackList.appendChild(trackItem);
        });

        // Aggiungiamo l'evento click ai pulsanti play
        document.querySelectorAll('.play-audius-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackId = e.currentTarget.getAttribute('data-track-id');
                playAudiusTrack(trackId);
            });
        });

        // Aggiorna il contatore
        const playlistInfo = document.querySelector('.playlist-info p');
        if (playlistInfo) {
            playlistInfo.innerText = `${Math.min(tracks.length, 10)} brani • Santos_Lukas`;
        }

    } catch (error) {
        console.error("Errore nel caricamento delle tracce:", error);
    }
}

// Funzione per riprodurre una traccia di Audius
async function playAudiusTrack(trackId) {
    try {
        // Otteniamo il link per lo streaming
        const streamUrl = await window.audiusSdk.tracks.streamTrack({ trackId: trackId });
        
        // Creiamo un player audio HTML5 nascosto se non esiste
        let audioPlayer = document.getElementById('audius-audio-player');
        if (!audioPlayer) {
            audioPlayer = document.createElement('audio');
            audioPlayer.id = 'audius-audio-player';
            document.body.appendChild(audioPlayer);
        }
        
        audioPlayer.src = streamUrl;
        audioPlayer.play();
        
        // Mostriamo il mini player (opzionale, per feedback visivo)
        const miniPlayer = document.getElementById('mini-player');
        if(miniPlayer) {
            miniPlayer.classList.remove('mini-player-hidden');
            miniPlayer.classList.add('mini-player-visible');
            document.getElementById('now-playing-title').innerText = "▶ In riproduzione...";
        }
        
    } catch (error) {
        console.error("Errore nella riproduzione:", error);
        alert("Impossibile riprodurre questa traccia. Potrebbe non essere disponibile per lo streaming.");
    }
}

// Funzione per fermare la musica (collega il tuo pulsante X)
function stopMusic() {
    const audioPlayer = document.getElementById('audius-audio-player');
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
