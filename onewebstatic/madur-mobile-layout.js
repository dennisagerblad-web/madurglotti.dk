(function () {
  var mobileLayoutAtLoad = window.innerWidth <= 650;
  var layoutSwitchTimer;

  function fitLegacyCanvas() {
    var pageZoom = Math.min(1, window.innerWidth / 1202);
    document.documentElement.style.setProperty(
      '--madur-page-zoom',
      String(pageZoom)
    );
    document.documentElement.style.setProperty(
      '--madur-landscape-content-zoom',
      String((window.innerWidth - 41) / window.innerWidth)
    );
    document.documentElement.style.setProperty(
      '--madur-landscape-content-margin',
      String(21 / pageZoom) + 'px'
    );
  }

  function handleResize() {
    fitLegacyCanvas();
    window.clearTimeout(layoutSwitchTimer);
    if ((window.innerWidth <= 650) !== mobileLayoutAtLoad) {
      layoutSwitchTimer = window.setTimeout(function () {
        if ((window.innerWidth <= 650) !== mobileLayoutAtLoad) {
          window.location.reload();
        }
      }, 180);
    }
  }

  fitLegacyCanvas();
  window.addEventListener('resize', handleResize, { passive: true });
})();
