// main.js

// 1. Element references
const videoCam = document.getElementById("video-cam");
const canvas = document.getElementById("output");
const ctx = canvas.getContext("2d");
const buttons = document.querySelectorAll("#controls button");

// 2. Overlay video elements (local files)
const streams = {
  red: document.getElementById("video-red"),
  green: document.getElementById("video-green"),
  blue: document.getElementById("video-blue"),
  yellow: document.getElementById("video-yellow"),
};

// 3. Track which overlays are enabled
const enabled = { red: false, green: false, blue: false, yellow: false };

// 4. HSV threshold ranges for chroma keying
const thresholds = {
  red:    { hMin: 340, hMax: 20,  sMin: 0.4, sMax: 1,   vMin: 0.3, vMax: 1 },
  green:  { hMin: 70,  hMax: 170, sMin: 0.4, sMax: 1,   vMin: 0.3, vMax: 1 },
  blue:   { hMin: 190, hMax: 270, sMin: 0.4, sMax: 1,   vMin: 0.3, vMax: 1 },
  yellow: { hMin: 30,  hMax: 80,  sMin: 0.4, sMax: 1,   vMin: 0.3, vMax: 1 },
};

// 5. Wire up the toggle buttons
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const color = btn.dataset.color;
    enabled[color] = !enabled[color];
    btn.classList.toggle("active", enabled[color]);

    const vid = streams[color];
    if (enabled[color]) {
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.load();               // ensure it's ready
      vid.play().catch(console.warn);
    } else {
      vid.pause();
    }
  });
});

// 6. Preload overlay videos (muted & looped)
Object.values(streams).forEach(vid => {
  vid.muted = true;
  vid.loop = true;
  vid.playsInline = true;
  vid.addEventListener("loadeddata", () => vid.play().catch(console.warn));
});

// 7. Start the camera feed
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } }
})
.then(stream => {
  videoCam.srcObject = stream;
  videoCam.onloadedmetadata = () => {
    canvas.width  = videoCam.videoWidth;
    canvas.height = videoCam.videoHeight;
    requestAnimationFrame(draw);
  };
})
.catch(err => {
  console.error("Camera error:", err);
  alert(`Camera access failed: ${err.name}`);
});

// 8. Main render loop: draw camera + active overlays
function draw() {
  ctx.drawImage(videoCam, 0, 0, canvas.width, canvas.height);

  for (const color in enabled) {
    if (enabled[color]) {
      applyChroma(canvas, ctx, streams[color], thresholds[color]);
    }
  }

  requestAnimationFrame(draw);
}

// 9. Chroma-key routine: replace pixels matching target hue range
function applyChroma(canvas, ctx, srcVideo, t) {
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height;
  const offCtx = off.getContext("2d");
  offCtx.drawImage(srcVideo, 0, 0, off.width, off.height);

  const bg  = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const ov  = offCtx.getImageData(0, 0, off.width, off.height);

  for (let i = 0; i < bg.data.length; i += 4) {
    const r = bg.data[i], g = bg.data[i+1], b = bg.data[i+2];
    if (matchColor({r,g,b}, t)) {
      bg.data[i]   = ov.data[i];
      bg.data[i+1] = ov.data[i+1];
      bg.data[i+2] = ov.data[i+2];
      bg.data[i+3] = ov.data[i+3];
    }
  }

  ctx.putImageData(bg, 0, 0);
}

// 10. Check if an RGB pixel falls within the HSV range
function matchColor({r,g,b}, {hMin,hMax,sMin,sMax,vMin,vMax}) {
  const {h,s,v} = rgbToHsv(r/255, g/255, b/255);
  const inHue = hMin <= hMax ? (h>=hMin && h<=hMax) : (h>=hMin || h<=hMax);
  return inHue && s>=sMin && s<=sMax && v>=vMin && v<=vMax;
}

// 11. Convert normalized RGB to HSV
function rgbToHsv(r, g, b) {
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min;
  let h = 0, s = max ? d/max : 0, v = max;
  if (d) {
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0)); break;
      case g: h = ((b-r)/d + 2); break;
      case b: h = ((r-g)/d + 4); break;
    }
    h *= 60;
  }
  return {h, s, v};
}