import { H as Hls } from "./hls.js";

export function setupMoviePlayer(source) {
    const root = document.querySelector("[data-player-root]");

    if (!root || !source) {
        return;
    }

    const video = root.querySelector("[data-player-video]");
    const overlay = root.querySelector("[data-player-overlay]");
    const toggleButton = root.querySelector("[data-player-toggle]");
    const muteButton = root.querySelector("[data-player-mute]");
    const fullscreenButton = root.querySelector("[data-player-fullscreen]");

    if (!video) {
        return;
    }

    let hls = null;

    if (Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
    }

    const refreshToggle = () => {
        if (toggleButton) {
            toggleButton.textContent = video.paused ? "▶" : "暂停";
        }
    };

    const begin = () => {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        video.play().catch(() => {});
        refreshToggle();
    };

    const toggle = () => {
        if (video.paused) {
            begin();
        } else {
            video.pause();
            refreshToggle();
        }
    };

    if (overlay) {
        overlay.addEventListener("click", begin);
    }

    video.addEventListener("click", toggle);
    video.addEventListener("play", refreshToggle);
    video.addEventListener("pause", refreshToggle);
    video.addEventListener("ended", () => {
        if (overlay) {
            overlay.classList.remove("is-hidden");
        }

        refreshToggle();
    });

    if (toggleButton) {
        toggleButton.addEventListener("click", toggle);
    }

    if (muteButton) {
        muteButton.addEventListener("click", () => {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? "静音" : "音量";
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener("click", () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                root.querySelector(".player-shell").requestFullscreen();
            }
        });
    }

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
        }
    });

    refreshToggle();
}
