import { H as Hls } from "./hls-dru42stk.js";

function setupPlayer() {
  var video = document.querySelector("[data-hls-source]");
  var overlay = document.querySelector("[data-play-overlay]");
  if (!video) {
    return;
  }

  var source = video.getAttribute("data-hls-source") || "";
  if (source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
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
    }
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      overlay.classList.add("hide");
      video.play().catch(function () {
        overlay.classList.remove("hide");
      });
    });
    video.addEventListener("play", function () {
      overlay.classList.add("hide");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove("hide");
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupPlayer);
} else {
  setupPlayer();
}
