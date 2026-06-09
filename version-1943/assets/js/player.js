import { H as Hls } from './hls-vendor.js';

const preparePlayer = (shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.player-overlay');
    const source = shell.dataset.source;
    let ready = false;
    let hls = null;

    const attach = () => {
        if (ready || !video || !source) {
            return;
        }

        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        }

        ready = true;
    };

    const play = () => {
        attach();
        const action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(() => {});
        }
    };

    if (button) {
        button.addEventListener('click', play);
    }

    video.addEventListener('play', () => shell.classList.add('is-playing'));
    video.addEventListener('pause', () => shell.classList.remove('is-playing'));
    video.addEventListener('ended', () => shell.classList.remove('is-playing'));
    video.addEventListener('loadedmetadata', () => shell.classList.add('is-ready'));
    video.addEventListener('error', () => shell.classList.remove('is-playing'));

    shell.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            play();
        }
    });

    window.addEventListener('beforeunload', () => {
        if (hls) {
            hls.destroy();
        }
    });
};

document.querySelectorAll('.movie-player').forEach(preparePlayer);
