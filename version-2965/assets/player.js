(function () {
  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function initPlayer(shell) {
    if (!shell || shell.getAttribute('data-ready') === 'true') {
      var readyVideo = shell && shell.querySelector('video');
      if (readyVideo) {
        playVideo(readyVideo);
      }
      return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var status = shell.querySelector('.player-status');
    var url = shell.getAttribute('data-m3u8');

    if (!video || !url) {
      return;
    }

    shell.setAttribute('data-ready', 'true');
    video.controls = true;

    if (cover) {
      cover.classList.add('is-hidden');
    }

    if (status) {
      status.textContent = '正在播放';
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      playVideo(video);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo(video);
      });
      return;
    }

    video.src = url;
    playVideo(video);
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var cover = shell.querySelector('.player-cover');
    var button = shell.querySelector('.play-button');

    if (cover) {
      cover.addEventListener('click', function () {
        initPlayer(shell);
      });
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        initPlayer(shell);
      });
    }
  });
}());
