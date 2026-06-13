(function () {
  function setStatus(shell, message) {
    var status = shell.querySelector('.player-status');
    if (status) {
      status.textContent = message || '';
    }
  }

  function prepareVideo(shell, video) {
    var stream = video.getAttribute('data-stream');
    if (!stream) {
      setStatus(shell, '播放失败，请刷新后重试');
      return false;
    }

    if (video.getAttribute('data-ready') === '1') {
      return true;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      shell._videoEngine = hls;
      video.setAttribute('data-ready', '1');
      return true;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.setAttribute('data-ready', '1');
      return true;
    }

    setStatus(shell, '播放失败，请刷新后重试');
    return false;
  }

  function start(shell) {
    var video = shell.querySelector('video');
    if (!video) {
      return;
    }

    setStatus(shell, '正在加载影片...');
    var ready = prepareVideo(shell, video);
    if (!ready) {
      return;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        shell.classList.add('is-playing');
        setStatus(shell, '');
      }).catch(function () {
        shell.classList.remove('is-playing');
        setStatus(shell, '点击播放按钮开始观看');
      });
    } else {
      shell.classList.add('is-playing');
      setStatus(shell, '');
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');

    if (overlay) {
      overlay.addEventListener('click', function () {
        start(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start(shell);
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        setStatus(shell, '');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('error', function () {
        shell.classList.remove('is-playing');
        setStatus(shell, '播放失败，请刷新后重试');
      });
    }
  });
})();
