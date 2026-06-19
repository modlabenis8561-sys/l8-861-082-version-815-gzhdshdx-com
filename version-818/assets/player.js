function initPlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  var src = options.src;
  var hls = null;
  var ready = false;

  if (!video || !src) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function play() {
    attach();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
