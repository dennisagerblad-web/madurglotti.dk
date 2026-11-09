(() => {
  const feature = document.getElementById('jolastjornan-feature');
  if (!feature) return;

  const canvas = feature.querySelector('.jolastjornan-feature__background');
  const imageA = new Image();
  const imageB = new Image();
  imageA.src = feature.dataset.backgroundA;
  imageB.src = feature.dataset.backgroundB;

  const TAU = Math.PI * 2;
  const started = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastFrame = 0;
  let visible = true;

  function fitCover(context, image, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    context.drawImage(image, (width - drawnWidth) / 2, (height - drawnHeight) / 2, drawnWidth, drawnHeight);
  }

  // The wave and cloud edges are periodic, so the first and last frame meet.
  function field(x, y, phase) {
    const wave = .5 - x
      + .19 * Math.sin(TAU * y * .82 + phase + .27 * Math.sin(TAU * y * 1.42 - phase))
      + .075 * Math.sin(TAU * y * 2.31 - phase);
    const warpedX = x
      + .065 * Math.sin(TAU * (y * 1.13 + x * .2) + phase)
      + .022 * Math.sin(TAU * (y * 3.7 - x * .8) - phase);
    const clouds = .44 * Math.sin(TAU * (warpedX * 1.21 + y * .18) + phase)
        * Math.cos(TAU * (y * .82 - warpedX * .17) - phase)
      + .24 * Math.sin(TAU * (warpedX * .62 - y * 1.41) - phase)
      + .15 * Math.cos(TAU * (warpedX * 2.03 + y * .78) + phase)
      + .09 * Math.sin(TAU * (warpedX * 3.82 - y * 2.46) - phase)
      + .055 * Math.cos(TAU * (warpedX * 6.5 + y * 4.2) + phase);
    return .29 * wave + clouds;
  }

  function draw(now) {
    if (!imageA.naturalWidth || !imageB.naturalWidth) return;
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(box.width * ratio);
    const height = Math.round(box.height * ratio);
    if (!width || !height) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const maskWidth = Math.min(1000, Math.max(1, Math.round(box.width * .9)));
    const maskHeight = Math.max(1, Math.round(maskWidth * height / width));
    const mask = canvas._mask || (canvas._mask = document.createElement('canvas'));
    const overlay = canvas._overlay || (canvas._overlay = document.createElement('canvas'));
    if (mask.width !== maskWidth || mask.height !== maskHeight) {
      mask.width = maskWidth;
      mask.height = maskHeight;
    }
    if (overlay.width !== width || overlay.height !== height) {
      overlay.width = width;
      overlay.height = height;
    }

    const phase = ((now - started) / 19000 * TAU) % TAU;
    const samples = [];
    for (let y = 0; y < 26; y++) {
      for (let x = 0; x < 94; x++) samples.push(field((x + .5) / 94, (y + .5) / 26, phase));
    }
    samples.sort((a, b) => a - b);
    const midpoint = samples[Math.floor(samples.length / 2)];

    const maskContext = mask.getContext('2d');
    const pixels = maskContext.createImageData(maskWidth, maskHeight);
    for (let y = 0; y < maskHeight; y++) {
      for (let x = 0; x < maskWidth; x++) {
        const value = field((x + .5) / maskWidth, (y + .5) / maskHeight, phase);
        const alpha = Math.max(0, Math.min(1, (value - midpoint) / .085 + .5)) * 255;
        const offset = (y * maskWidth + x) * 4;
        pixels.data[offset] = 255;
        pixels.data[offset + 1] = 255;
        pixels.data[offset + 2] = 255;
        pixels.data[offset + 3] = alpha;
      }
    }
    maskContext.putImageData(pixels, 0, 0);

    const context = canvas.getContext('2d');
    const overlayContext = overlay.getContext('2d');
    fitCover(context, imageA, width, height);
    overlayContext.clearRect(0, 0, width, height);
    overlayContext.globalCompositeOperation = 'source-over';
    fitCover(overlayContext, imageB, width, height);
    overlayContext.globalCompositeOperation = 'destination-in';
    overlayContext.imageSmoothingEnabled = true;
    overlayContext.imageSmoothingQuality = 'high';
    overlayContext.filter = `blur(${1.4 * ratio}px)`;
    overlayContext.drawImage(mask, 0, 0, width, height);
    overlayContext.filter = 'none';
    overlayContext.globalCompositeOperation = 'source-over';
    context.drawImage(overlay, 0, 0);
  }

  function animate(now) {
    if (visible && now - lastFrame >= 75) {
      lastFrame = now;
      draw(now);
    }
    if (!reducedMotion.matches) requestAnimationFrame(animate);
  }

  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
  });
  observer.observe(feature);

  if (reducedMotion.matches) {
    imageA.addEventListener('load', () => draw(started));
    imageB.addEventListener('load', () => draw(started));
    window.addEventListener('resize', () => draw(started));
    draw(started);
  } else {
    requestAnimationFrame(animate);
  }
})();
