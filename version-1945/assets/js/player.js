(function () {
  function startPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var prepared = false;

    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        player.hlsInstance = hls;
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");
      var request = video.play();
      if (request && request.catch) {
        request.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!prepared) {
        play();
      }
    });
  }

  var players = document.querySelectorAll("[data-player]");
  players.forEach(startPlayer);
})();
