function initPlayer(src) {
  const video = document.querySelector('.movie-video');
  const cover = document.querySelector('.player-cover');
  let hlsInstance = null;
  let prepared = false;

  if (!video || !src) {
    return;
  }

  const prepare = () => {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }
  };

  const play = () => {
    prepare();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    const task = video.play();

    if (task && typeof task.catch === 'function') {
      task.catch(() => {
        video.controls = true;
      });
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
