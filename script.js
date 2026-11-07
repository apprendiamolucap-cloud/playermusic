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

// 3. YOUTUBE PLAYER
var player;
var isPlayerReady = false;

// Carica l'API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player-container', {
        height: '60', 
        width: '80',
        videoId: '', 
        playerVars: { 
            'autoplay': 0, 
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'origin': window.location.origin,
            'referrerPolicy': 'strict-origin-when-cross-origin'
        },
        events: {
            'onReady': function(event) {
                isPlayerReady = true;
                console.log("Player pronto!");
            },
            'onStateChange': function(event) {
                if (event.data == YT.PlayerState.ENDED) {
                    stopMusic();
                }
            }
        }
    });
}

// Funzione per far partire la musica
function playYouTube(videoId, songTitle) {
    if (!isPlayerReady) {
        setTimeout(() => {
            if (isPlayerReady) playYouTube(videoId, songTitle);
        }, 1500);
        return;
    }

    const miniPlayer = document.getElementById('mini-player');
    miniPlayer.classList.remove('mini-player-hidden');
    miniPlayer.classList.add('mini-player-visible');

    document.getElementById('now-playing-title').innerText = "▶ " + songTitle;

    player.loadVideoById(videoId);
}

// Funzione per fermare la musica
function stopMusic() {
    if (player && player.stopVideo) {
        player.stopVideo();
    }
    const miniPlayer = document.getElementById('mini-player');
    miniPlayer.classList.remove('mini-player-visible');
    miniPlayer.classList.add('mini-player-hidden');
}

// 4. LISTA CANZONI DI NABI (Aggiunte dinamicamente alla libreria)
// Nota: Gli ID video sono presi dai link ufficiali trovati. Se un video non parte, potrebbe essere bloccato.
const nabiSongs = [
    { id: 'cPykUOIGisA', title: 'NEW YORK' },
    { id: 'lKSPKbBVGgU', title: 'WROOM WROOM' },
    { id: 'J_p80876Wgw', title: 'CALIBRO' },
    { id: 'TVqeYBxhPgg', title: 'GRANATA (feat. 22 Simba)' },
    { id: 'fCE9mDVdr5A', title: 'GUERRILIA' },
    { id: 'q8PV8gd-Bl0', title: 'ZEPECK' },
    { id: 'Po25COLLYus', title: 'Notte in Caserma' },
    { id: 'Va4NxXNziNk', title: 'Opening (feat. EK)' },
    // Aggiungi qui altri ID se li trovi. La struttura è: { id: 'ID_VIDEO', title: 'TITOLO' },
];

// Funzione per popolare la lista nella schermata Libreria
document.addEventListener("DOMContentLoaded", () => {
    const trackList = document.querySelector('.track-list');
    if (trackList) {
        // Svuota la lista esistente per evitare duplicati
        trackList.innerHTML = '';
        
        nabiSongs.forEach((song, index) => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';
            trackItem.setAttribute('onclick', `playYouTube('${song.id}', '${song.title}')`);
            
            trackItem.innerHTML = `
                <span class="track-number">${index + 1}</span>
                <div class="track-info">
                    <h4>${song.title}</h4>
                    <p>NABI</p>
                </div>
                <i class="fas fa-play-circle" style="color:#FFB7C5;"></i>
            `;
            
            trackList.appendChild(trackItem);
        });
        
        // Aggiorna il contatore dei brani
        const playlistInfo = document.querySelector('.playlist-info p');
        if (playlistInfo) {
            playlistInfo.innerText = `${nabiSongs.length} brani • Santos_Lukas`;
        }
    }
});
