(function () {
    window.initMoviePlayer = function (source, videoId, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hls = null;

        function attach() {
            if (!video || video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.setAttribute("data-ready", "1");
        }

        function start() {
            attach();
            if (button) {
                button.classList.add("is-hidden");
            }
            if (video) {
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
