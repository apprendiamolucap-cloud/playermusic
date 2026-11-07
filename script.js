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

// 3. YOUTUBE PLAYER (Configurato per GitHub Pages)
var player;
var isPlayerReady = false;

// Carica l'API di YouTube
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Funzione chiamata automaticamente da YouTube quando l'API è pronta
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
            'referrerPolicy': 'strict-origin-when-cross-origin' // Risolve l'errore 153
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
        // Se clicchi troppo velocemente, avvisa ma non bloccare l'app
        console.log("Player in caricamento...");
        setTimeout(() => {
            if (isPlayerReady) playYouTube(videoId, songTitle);
        }, 1500);
        return;
    }

    // Mostra il mini player
    const miniPlayer = document.getElementById('mini-player');
    miniPlayer.classList.remove('mini-player-hidden');
    miniPlayer.classList.add('mini-player-visible');

    // Mostra il titolo della canzone
    document.getElementById('now-playing-title').innerText = "▶ " + songTitle;

    // Fai partire il video
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