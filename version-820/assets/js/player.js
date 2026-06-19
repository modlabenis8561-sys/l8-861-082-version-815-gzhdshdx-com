(function () {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-play-button]');
    const src = player.getAttribute('data-src');
    let hls = null;

    if (!video || !src) {
      return;
    }

    const load = function () {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      video.setAttribute('data-ready', '1');
    };

    const play = function () {
      load();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
