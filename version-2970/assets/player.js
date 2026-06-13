
(function () {
  function setupPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('.play-overlay');
    var status = wrapper.querySelector('.player-status');
    var stream = wrapper.getAttribute('data-stream');
    var initialized = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function initialize() {
      if (initialized || !video || !stream) {
        return;
      }

      initialized = true;
      setStatus('正在加载播放内容');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus('播放加载失败，请稍后重试');
          }
        });
      } else {
        setStatus('此设备暂不支持该播放格式');
      }
    }

    function play() {
      initialize();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (button) {
            button.classList.add('is-hidden');
          }
          setStatus('');
        }).catch(function () {
          setStatus('点击视频区域继续播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
