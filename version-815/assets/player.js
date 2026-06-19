
(function () {
  document.querySelectorAll('[data-player]').forEach(function (frame) {
    var video = frame.querySelector('video[data-stream]');
    var button = frame.querySelector('[data-play-control]');
    var state = frame.querySelector('[data-player-state]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-stream');
    var ready = false;
    var hls = null;
    function setState(text) {
      if (state) {
        state.textContent = text || '';
      }
    }
    function attach(onReady) {
      if (ready) {
        onReady();
        return;
      }
      ready = true;
      setState('');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        onReady();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          onReady();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setState('播放暂时不可用，请稍后重试');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setState('正在重新加载影片');
            hls.recoverMediaError();
          } else {
            setState('播放暂时不可用，请稍后重试');
          }
        });
      } else {
        video.src = source;
        onReady();
      }
    }
    function start() {
      attach(function () {
        frame.classList.add('is-playing');
        var playTask = video.play();
        if (playTask && typeof playTask.catch === 'function') {
          playTask.catch(function () {
            setState('点击视频区域继续播放');
          });
        }
      });
    }
    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
      setState('');
    });
    video.addEventListener('pause', function () {
      frame.classList.remove('is-playing');
    });
  });
})();
