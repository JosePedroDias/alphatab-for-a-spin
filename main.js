// load elements
const wrapperEl = document.querySelector(".at-wrap");
const mainEl = wrapperEl.querySelector(".at-main");

// load file from hash
let hash = (location.hash && location.hash.slice(1)) || "";
if (!hash) {
    location.hash = "bass";
    location.reload();
}
if (hash.indexOf('.') === -1) hash += '.tex';
const file = `songs/${hash}`;

// initialize alphatab
const api = new alphaTab.AlphaTabApi(mainEl, {
    file,
    player: {
        enablePlayer: true,
        soundFont: "https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2",
        scrollElement: wrapperEl.querySelector('.at-viewport')
    },
    display: {
        layoutMode: alphaTab.LayoutMode.Horizontal,
    }
});

// exposing api for debugging...
window.api = api; // .score, .player, .renderer

// overlay logic
const overlayEl = wrapperEl.querySelector(".at-overlay");
api.renderStarted.on(() => overlayEl.style.display = "flex");
api.renderFinished.on(() => overlayEl.style.display = "none");

// track selector
function createTrackItem(track) {
    const trackItemEl = document
        .querySelector("#at-track-template")
        .content.cloneNode(true).firstElementChild;
    trackItemEl.querySelector(".at-track-name").innerText = track.name;
    trackItemEl.track = track;
    trackItemEl.onclick = (e) => {
        e.stopPropagation();
        api.renderTracks([track]);
    };
    return trackItemEl;
}
const trackListEl = wrapperEl.querySelector(".at-track-list");
api.scoreLoaded.on((score) => {
    // clear items
    trackListEl.innerHTML = "";
    // generate a track item for all tracks of the score
    score.tracks.forEach((track) => trackListEl.appendChild(createTrackItem(track)));
});
api.renderStarted.on(() => {
    // collect tracks being rendered
    const tracks = new Map();
    api.tracks.forEach((t) => tracks.set(t.index, t));
    // mark the item as active or not
    const trackItemEls = trackListEl.querySelectorAll(".at-track");
    trackItemEls.forEach((trackItem) => {
        if (tracks.has(trackItem.track.index)) {
            trackItem.classList.add("active");
        } else {
            trackItem.classList.remove("active");
        }
    });
});

/** Controls **/
api.scoreLoaded.on((score) => {
    wrapperEl.querySelector(".at-song-title").innerText = score.title;
    wrapperEl.querySelector(".at-song-artist").innerText = score.artist;
});

const countInEl = wrapperEl.querySelector('.at-controls .at-count-in');
countInEl.onclick = () => {
    countInEl.classList.toggle('active');
    if (countInEl.classList.contains('active')) {
        api.countInVolume = 1;
    } else {
        api.countInVolume = 0;
    }
};

const metronomeEl = wrapperEl.querySelector(".at-controls .at-metronome");
metronomeEl.onclick = () => {
    metronomeEl.classList.toggle("active");
    if (metronomeEl.classList.contains("active")) {
        api.metronomeVolume = 1;
    } else {
        api.metronomeVolume = 0;
    }
};

const loopEl = wrapperEl.querySelector(".at-controls .at-loop");
loopEl.onclick = () => {
    loopEl.classList.toggle("active");
    api.isLooping = loopEl.classList.contains("active");
};

wrapperEl.querySelector(".at-controls .at-print").onclick = () => api.print();

const zoomEl = wrapperEl.querySelector(".at-controls .at-zoom select");
zoomEl.onchange = () => {
    const zoomLevel = parseInt(zoomEl.value) / 100;
    api.settings.display.scale = zoomLevel;
    api.updateSettings();
    api.render();
};

const layoutEl = wrapperEl.querySelector(".at-controls .at-layout select");
layoutEl.onchange = () => {
    switch (layoutEl.value) {
        case "horizontal":
            api.settings.display.layoutMode = alphaTab.LayoutMode.Horizontal;
            break;
        case "page":
            api.settings.display.layoutMode = alphaTab.LayoutMode.Page;
            break;
    }
    api.updateSettings();
    api.render();
};

// player loading indicator
const playerIndicatorEl = wrapperEl.querySelector(".at-controls .at-player-progress");
api.soundFontLoad.on((e) => {
    const percentage = Math.floor((e.loaded / e.total) * 100);
    playerIndicatorEl.innerText = percentage + "%";
});
api.playerReady.on(() => {
    playerIndicatorEl.style.display = "none";
});

// main player controls
const playPauseEl = wrapperEl.querySelector(".at-controls .at-player-play-pause");
const playStopEl = wrapperEl.querySelector(".at-controls .at-player-stop");
playPauseEl.onclick = (e) => {
    if (e.target.classList.contains("disabled")) return;
    api.playPause();
};
playStopEl.onclick = (e) => {
    if (e.target.classList.contains("disabled")) return;
    api.stop();
};
api.playerReady.on(() => {
    playPauseEl.classList.remove("disabled");
    playStopEl.classList.remove("disabled");
});
api.playerStateChanged.on((e) => {
    const iconEl = playPauseEl.querySelector("i.fas");
    if (e.state === alphaTab.synth.PlayerState.Playing) {
        iconEl.classList.remove("fa-play");
        iconEl.classList.add("fa-pause");
    } else {
        iconEl.classList.remove("fa-pause");
        iconEl.classList.add("fa-play");
    }
});

// song position
function formatDuration(milliseconds) {
    let seconds = milliseconds / 1000;
    const minutes = (seconds / 60) | 0;
    seconds = (seconds - minutes * 60) | 0;
    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}

const songPositionEl = wrapperEl.querySelector(".at-song-position");
let previousTime = -1;
api.playerPositionChanged.on((e) => {
    // reduce number of UI updates to second changes.
    const currentSeconds = (e.currentTime / 1000) | 0;
    if (currentSeconds == previousTime) return;
    songPositionEl.innerText = formatDuration(e.currentTime) + " / " + formatDuration(e.endTime);
});
