(function () {
  var mobileLayoutAtLoad = window.innerWidth <= 650;
  var layoutSwitchTimer;

  function fitLegacyCanvas() {
    document.documentElement.style.setProperty(
      '--madur-page-zoom',
      String(Math.min(1, window.innerWidth / 1202))
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
