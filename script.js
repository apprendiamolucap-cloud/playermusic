// DATA
function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', options);
}
updateDate();

// NAVIGAZIONE
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    document.getElementById(screenId).classList.add('active-screen');
    document.getElementById('main-nav').style.display = (screenId === 'screen-login') ? 'none' : 'flex';
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-target') === screenId);
    });
}
function goToHome() { showScreen('screen-home'); }
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showScreen(this.getAttribute('data-target'));
        });
    });
});

// YOUTUBE PLAYER
let player;
let isPlayerReady = false;
let progressInterval;
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player-container', {
        height: '100', width: '100', videoId: '',
        playerVars: { 'autoplay': 0, 'controls': 0, 'origin': window.location.origin },
        events: {
            'onReady': () => { isPlayerReady = true; },
            'onStateChange': onPlayerStateChange
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

// CONTROLLI
function playYouTube(videoId, title) {
    if (!isPlayerReady) { alert("Player in caricamento..."); return; }
    document.getElementById('now-playing-title').innerText = title;
    document.getElementById('now-playing-bar').classList.add('visible');
    player.loadVideoById(videoId);
    player.playVideo();
}
function togglePlay() {
    if (!player || !isPlayerReady) return;
    if (player.getPlayerState() === YT.PlayerState.PLAYING) player.pauseVideo();
    else player.playVideo();
}
function seekForward() { if (player && player.getCurrentTime) player.seekTo(player.getCurrentTime() + 10, true); }
function seekBackward() { if (player && player.getCurrentTime) player.seekTo(Math.max(0, player.getCurrentTime() - 10), true); }
function closePlayer() {
    if (player && player.stopVideo) player.stopVideo();
    document.getElementById('now-playing-bar').classList.remove('visible');
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

// LISTA CANZONI NABI
const songs = [
    { id: 'fCE9mDVdr5A', title: 'GUERRILIA', artist: 'NABI' },
    { id: 'lKSPKbBVGgU', title: 'WROOM WROOM', artist: 'NABI' },
    { id: 'J_p80876Wgw', title: 'CALIBRO', artist: 'NABI' },
    { id: 'TVqeYBxhPgg', title: 'GRANATA', artist: 'NABI' },
    { id: 'q8PV8gd-Bl0', title: 'ZEPECK', artist: 'NABI' },
    { id: 'Po25COLLYus', title: 'Notte in Caserma', artist: 'NABI' }
];

// POPOLA LA LISTA
document.addEventListener("DOMContentLoaded", () => {
    const trackList = document.getElementById('main-track-list');
    if (trackList) {
        trackList.innerHTML = '';
        songs.forEach((song, index) => {
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
    }
});
