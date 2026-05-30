const viewer = document.getElementById("ringModel");
const originalModelViewer = document.getElementById("originalRingModel");
const studio = document.querySelector(".ring-studio");
const loaderBadge = document.getElementById("viewerLoader");
const swatches = document.querySelectorAll(".metal-swatch");
const ringTypeCards = document.querySelectorAll(".ring-type-card");
const selectedRingType = document.getElementById("selectedRingType");
const selectedRingDescription = document.getElementById("selectedRingDescription");
const ringTypeSummary = document.getElementById("ringTypeSummary");
const selectedMetal = document.getElementById("selectedMetal");
const selectedDescription = document.getElementById("selectedDescription");
const metalSummary = document.getElementById("metalSummary");

const ringPresets = {
  "Solitaire Royale": { build: buildSolitaireRing, cameraZ: 5.2 },
  "Original Diamond": { original: true },
  "Halo Lumiere": { build: buildHaloRing, cameraZ: 5.4 },
  "Pavé Éclat": { build: buildPaveRing, cameraZ: 5.5 },
  "Emerald Muse": { build: buildEmeraldRing, cameraZ: 5.3 },
  "Trinity Stones": { build: buildThreeStoneRing, cameraZ: 5.8 }
};

let scene;
let camera;
let renderer;
let ringGroup;
let metalMaterial;
let gemMaterial;
let accentMaterial;
let selectedColor = "#ffffff";
let activeRingType = "Solitaire Royale";
let originalMetalMaterials = [];
let isOriginalMode = false;
let targetRotationY = -0.42;
let targetRotationX = 0.48;
let zoom = 5.3;
let isDragging = false;
let lastPointer = { x: 0, y: 0 };

const metalPresets = {
  "#ffffff": { color: "#dfe5ec", metalness: 0.72, roughness: 0.16, clearcoatRoughness: 0.035, envMapIntensity: 2.2 },
  "#e7f2ff": { color: "#dbe7f3", metalness: 0.72, roughness: 0.17, clearcoatRoughness: 0.045, envMapIntensity: 2.05 },
  "#d7b56d": { color: "#d7b56d", metalness: 0.78, roughness: 0.2, clearcoatRoughness: 0.08, envMapIntensity: 1.75 },
  "#d79aa3": { color: "#d79aa3", metalness: 0.76, roughness: 0.22, clearcoatRoughness: 0.08, envMapIntensity: 1.65 },
  "#d8dee7": { color: "#d8dee7", metalness: 0.72, roughness: 0.16, clearcoatRoughness: 0.05, envMapIntensity: 1.95 },
  "#343a45": { color: "#343a45", metalness: 0.82, roughness: 0.28, clearcoatRoughness: 0.1, envMapIntensity: 1.35 }
};

initRingStudio();

if (originalModelViewer) {
  originalModelViewer.src =
    window.location.protocol === "file:" && window.RING_MODEL_DATA_URI
      ? window.RING_MODEL_DATA_URI
      : "./assets/diamond_engagement_ring.glb";

  originalModelViewer.addEventListener("load", async () => {
    await originalModelViewer.updateComplete;
    collectOriginalMaterials();
    applyOriginalMetalColor(selectedColor);
  });
}

function initRingStudio() {
  if (!window.THREE) {
    loaderBadge.textContent = "ספריית התלת מימד לא נטענה.";
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  viewer.appendChild(renderer.domElement);

  metalMaterial = new THREE.MeshPhysicalMaterial({
    color: metalPresets[selectedColor].color,
    metalness: metalPresets[selectedColor].metalness,
    roughness: metalPresets[selectedColor].roughness,
    clearcoat: 1,
    clearcoatRoughness: metalPresets[selectedColor].clearcoatRoughness,
    reflectivity: 0.95,
    envMapIntensity: metalPresets[selectedColor].envMapIntensity
  });

  gemMaterial = new THREE.MeshPhysicalMaterial({
    color: "#f8fcff",
    roughness: 0.01,
    metalness: 0,
    transmission: 0.34,
    thickness: 1,
    ior: 2.25,
    clearcoat: 1,
    clearcoatRoughness: 0.01,
    transparent: true,
    opacity: 0.92
  });

  accentMaterial = new THREE.MeshPhysicalMaterial({
    color: "#dff8ff",
    roughness: 0.04,
    metalness: 0,
    clearcoat: 1,
    envMapIntensity: 2
  });

  setupLights();
  buildSelectedRing();
  setupViewerControls();
  setupOptions();
  setupIcons();
  setupCustomCursor();
  setupMagneticButtons();
  resizeRenderer();
  studio.classList.add("is-loaded");
  loaderBadge.classList.add("is-hidden");
  animate();
}

function setupLights() {
  scene.add(new THREE.AmbientLight("#f4fbff", 1.35));

  const key = new THREE.DirectionalLight("#ffffff", 6.2);
  key.position.set(4, 5, 4);
  key.castShadow = true;
  scene.add(key);

  const ice = new THREE.PointLight("#dff8ff", 72, 9);
  ice.position.set(-3, 2.2, 3);
  scene.add(ice);

  const champagne = new THREE.PointLight("#f4dfb2", 32, 7);
  champagne.position.set(2.8, -0.4, 2.5);
  scene.add(champagne);

  const rim = new THREE.DirectionalLight("#bfefff", 3.4);
  rim.position.set(-4, 1.4, -3);
  scene.add(rim);

  const topSpark = new THREE.PointLight("#ffffff", 34, 5);
  topSpark.position.set(0, 3.2, 1.2);
  scene.add(topSpark);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 96),
    new THREE.MeshStandardMaterial({
      color: "#071019",
      roughness: 0.36,
      metalness: 0.24,
      transparent: true,
      opacity: 0.34
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.15;
  floor.receiveShadow = true;
  scene.add(floor);
}

function buildSelectedRing() {
  if (ringPresets[activeRingType]?.original) {
    showOriginalRing();
    return;
  }

  showProceduralRing();

  if (ringGroup) {
    scene.remove(ringGroup);
  }

  ringGroup = new THREE.Group();
  ringPresets[activeRingType].build(ringGroup);
  applyMetalColor(selectedColor);
  ringGroup.rotation.x = targetRotationX;
  scene.add(ringGroup);
  zoom = ringPresets[activeRingType].cameraZ;
}

function showOriginalRing() {
  isOriginalMode = true;
  viewer.style.display = "none";
  originalModelViewer?.classList.add("is-visible");
  studio.classList.add("is-loaded");
  loaderBadge.classList.add("is-hidden");
  collectOriginalMaterials();
  applyOriginalMetalColor(selectedColor);
}

function showProceduralRing() {
  isOriginalMode = false;
  viewer.style.display = "block";
  originalModelViewer?.classList.remove("is-visible");
}

function buildBand(group, options = {}) {
  const {
    radius = 1.05,
    tube = 0.095,
    depth = 0.2,
    y = -0.38,
    scaleX = 1,
    scaleY = 1.02
  } = options;

  const outerX = (radius + tube) * scaleX;
  const outerY = (radius + tube) * scaleY;
  const innerX = Math.max(0.12, (radius - tube) * scaleX);
  const innerY = Math.max(0.12, (radius - tube) * scaleY);
  const shape = new THREE.Shape();
  const hole = new THREE.Path();

  shape.absellipse(0, y, outerX, outerY, 0, Math.PI * 2, false, 0);
  hole.absellipse(0, y, innerX, innerY, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.018,
    bevelSegments: 10,
    curveSegments: 160
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();

  const band = new THREE.Mesh(geometry, metalMaterial);
  band.castShadow = true;
  band.receiveShadow = true;
  group.add(band);

  return band;
}

function buildSolitaireRing(group) {
  buildBand(group);
  addShoulders(group, { topY: 0.68 });
  addSetting(group, 0, 0.72, 0.23);
  addProngs(group, 0, 0.92, 0.18);
  addRoundDiamond(group, 0, 1.14, 0, 0.43);
}

function buildHaloRing(group) {
  buildBand(group, { tube: 0.1, depth: 0.21 });
  addShoulders(group, { width: 0.5, topY: 0.68 });
  addSetting(group, 0, 0.72, 0.25);
  addProngs(group, 0, 0.9, 0.17);
  addRoundDiamond(group, 0, 1.08, 0, 0.36);

  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2;
    const x = Math.cos(angle) * 0.39;
    const y = 1.08 + Math.sin(angle) * 0.25;
    addSmallDiamond(group, x, y, 0.2, 0.052, { faceCamera: true, seatLift: 0.72 });
  }
}

function buildPaveRing(group) {
  buildBand(group, { tube: 0.09, depth: 0.21 });
  addShoulders(group, { width: 0.62, topY: 0.67 });
  addSetting(group, 0, 0.71, 0.22);
  addProngs(group, 0, 0.9, 0.16);
  addRoundDiamond(group, 0, 1.08, 0, 0.37);

  for (let side of [-1, 1]) {
    for (let index = 0; index < 7; index += 1) {
      const x = side * (0.28 + index * 0.09);
      const y = shoulderY(x, 1.05, -0.38, 1.02) + 0.085;
      const z = 0.19 - index * 0.004;
      addSmallDiamond(group, x, y, z, 0.038, { faceCamera: true, seatLift: 0.74 });
    }
  }
}

function buildEmeraldRing(group) {
  buildBand(group, { radius: 1.06, tube: 0.105, depth: 0.22, scaleX: 1.02 });
  addShoulders(group, { width: 0.58, topY: 0.67 });
  addSetting(group, 0, 0.71, 0.25);
  addProngs(group, -0.28, 0.88, 0.13);
  addProngs(group, 0.28, 0.88, 0.13);

  const emerald = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.58), gemMaterial);
  emerald.position.set(0, 1.06, 0);
  emerald.rotation.set(0.12, 0.2, 0.78);
  emerald.castShadow = true;
  group.add(emerald);
}

function buildThreeStoneRing(group) {
  buildBand(group, { tube: 0.1, depth: 0.22 });
  addShoulders(group, { width: 0.62, topY: 0.67 });
  addSetting(group, 0, 0.71, 0.23);
  addRoundDiamond(group, 0, 1.1, 0, 0.36);
  addRoundDiamond(group, -0.43, 0.92, 0.04, 0.24);
  addRoundDiamond(group, 0.43, 0.92, 0.04, 0.24);
  addProngs(group, 0, 0.9, 0.16);
  addProngs(group, -0.44, 0.76, 0.1);
  addProngs(group, 0.44, 0.76, 0.1);
}

function addRoundDiamond(group, x, y, z, size) {
  const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(size, 2), gemMaterial);
  diamond.position.set(x, y, z);
  diamond.rotation.set(0.8, 0.35, 0.1);
  diamond.castShadow = true;
  group.add(diamond);

  const crown = new THREE.Mesh(new THREE.ConeGeometry(size * 0.72, size * 0.5, 6), accentMaterial);
  crown.position.set(x, y - size * 0.34, z);
  crown.rotation.x = Math.PI;
  crown.castShadow = true;
  group.add(crown);
}

function addSmallDiamond(group, x, y, z, size, options = {}) {
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(size, 1), gemMaterial);
  gem.position.set(x, y, z);
  gem.rotation.set(options.faceCamera ? 0.4 : 0.7, options.faceCamera ? 0.05 : 0.2, 0.4);
  gem.castShadow = true;
  group.add(gem);

  const bead = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.34, size * 0.42, size * 0.28, 10), metalMaterial);
  bead.position.set(x, y - size * (options.seatLift || 0.58), z - 0.01);
  bead.rotation.x = Math.PI / 2;
  bead.castShadow = true;
  group.add(bead);
}

function addShoulders(group, options = {}) {
  const {
    width = 0.54,
    bandRadius = 1.05,
    bandY = -0.38,
    bandScaleY = 1.02,
    topY = 0.5,
    zOffset = 0.16
  } = options;

  for (let side of [-1, 1]) {
    const shoulderX = side * width;
    const bandPointY = shoulderY(shoulderX, bandRadius, bandY, bandScaleY) - 0.02;
    const innerX = side * 0.2;

    addMetalCylinderBetween(
      group,
      new THREE.Vector3(shoulderX, bandPointY, zOffset),
      new THREE.Vector3(innerX, topY - 0.02, zOffset * 0.66),
      0.07
    );
    addMetalCylinderBetween(
      group,
      new THREE.Vector3(shoulderX, bandPointY, -zOffset),
      new THREE.Vector3(innerX, topY - 0.02, -zOffset * 0.66),
      0.07
    );
  }
}

function addSetting(group, x, y, radius) {
  const seat = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.032, 18, 72), metalMaterial);
  seat.position.set(x, y, 0);
  seat.scale.y = 0.42;
  seat.scale.z = 1.35;
  seat.castShadow = true;
  group.add(seat);

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.05, 0.1, 0.36), metalMaterial);
  bridge.position.set(x, y - 0.18, 0);
  bridge.castShadow = true;
  group.add(bridge);

  const basket = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.68, radius * 0.86, 0.18, 32), metalMaterial);
  basket.position.set(x, y + 0.06, 0);
  basket.scale.y = 0.58;
  basket.castShadow = true;
  group.add(basket);

  for (let side of [-1, 1]) {
    addMetalCylinderBetween(
      group,
      new THREE.Vector3(x + side * radius * 0.86, y - 0.18, 0.17),
      new THREE.Vector3(x + side * radius * 0.5, y + 0.2, 0.08),
      0.036
    );
    addMetalCylinderBetween(
      group,
      new THREE.Vector3(x + side * radius * 0.86, y - 0.18, -0.17),
      new THREE.Vector3(x + side * radius * 0.5, y + 0.2, -0.08),
      0.036
    );
  }
}

function addProngs(group, x, y, spread) {
  for (let sx of [-1, 1]) {
    for (let sz of [-1, 1]) {
      addMetalCylinderBetween(
        group,
        new THREE.Vector3(x + sx * spread * 0.7, y - 0.24, sz * spread * 0.38),
        new THREE.Vector3(x + sx * spread, y + 0.22, sz * spread * 0.48),
        0.028
      );
    }
  }
}

function addMetalCylinderBetween(group, start, end, radius) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.08, length, 14), metalMaterial);

  cylinder.position.copy(start).add(end).multiplyScalar(0.5);
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;
  group.add(cylinder);

  return cylinder;
}

function shoulderY(x, radius, centerY, scaleY) {
  const safeX = Math.min(Math.abs(x), radius * 0.96);
  return centerY + Math.sqrt(radius * radius - safeX * safeX) * scaleY;
}

function applyMetalColor(hexColor) {
  selectedColor = hexColor;
  const preset = metalPresets[hexColor.toLowerCase()] || metalPresets["#ffffff"];
  metalMaterial.color.set(preset.color);
  metalMaterial.metalness = preset.metalness;
  metalMaterial.roughness = preset.roughness;
  metalMaterial.clearcoatRoughness = preset.clearcoatRoughness;
  metalMaterial.envMapIntensity = preset.envMapIntensity;
  metalMaterial.needsUpdate = true;
  applyOriginalMetalColor(hexColor);
}

function collectOriginalMaterials() {
  const materials = originalModelViewer?.model?.materials || [];
  originalMetalMaterials = materials.filter((material) => {
    const name = material.name?.toLowerCase() || "";
    return name.includes("metal") || !["crystal", "diamond", "gem", "stone", "glass"].some((word) => name.includes(word));
  });
}

function applyOriginalMetalColor(hexColor) {
  if (!originalMetalMaterials.length) return;

  const preset = metalPresets[hexColor.toLowerCase()] || metalPresets["#ffffff"];
  const colorFactor = hexToRgbaFactor(preset.color);

  originalMetalMaterials.forEach((material) => {
    const pbr = material.pbrMetallicRoughness;
    pbr.setBaseColorFactor(colorFactor);
    pbr.setMetallicFactor?.(preset.metalness);
    pbr.setRoughnessFactor?.(preset.roughness);
  });
}

function hexToRgbaFactor(hexColor) {
  const hex = hexColor.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
    1
  ];
}

function setupOptions() {
  swatches.forEach((swatch) => {
    swatch.addEventListener("click", () => {
      swatches.forEach((item) => item.classList.remove("is-active"));
      swatch.classList.add("is-active");

      applyMetalColor(swatch.dataset.color);

      selectedMetal.textContent = swatch.dataset.name;
      selectedDescription.textContent = swatch.dataset.description;
      metalSummary.textContent = swatch.dataset.name;
    });
  });

  ringTypeCards.forEach((card) => {
    card.addEventListener("click", () => {
      ringTypeCards.forEach((item) => item.classList.remove("is-active"));
      card.classList.add("is-active");

      activeRingType = card.dataset.type;
      selectedRingType.textContent = card.dataset.type;
      selectedRingDescription.textContent = card.dataset.description;
      ringTypeSummary.textContent = card.dataset.type;
      buildSelectedRing();
    });
  });
}

function setupViewerControls() {
  viewer.addEventListener("pointerdown", (event) => {
    isDragging = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    viewer.setPointerCapture(event.pointerId);
  });

  viewer.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const dx = event.clientX - lastPointer.x;
    const dy = event.clientY - lastPointer.y;
    targetRotationY += dx * 0.01;
    targetRotationX = Math.max(-0.9, Math.min(0.9, targetRotationX + dy * 0.006));
    lastPointer = { x: event.clientX, y: event.clientY };
  });

  viewer.addEventListener("pointerup", (event) => {
    isDragging = false;
    viewer.releasePointerCapture(event.pointerId);
  });

  viewer.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoom = Math.max(3.4, Math.min(7.2, zoom + event.deltaY * 0.003));
    },
    { passive: false }
  );
}

function resizeRenderer() {
  const width = viewer.clientWidth || 800;
  const height = viewer.clientHeight || 600;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  if (isOriginalMode) return;

  if (ringGroup) {
    if (!isDragging) {
      targetRotationY += 0.0045;
    }

    ringGroup.rotation.y += (targetRotationY - ringGroup.rotation.y) * 0.08;
    ringGroup.rotation.x += (targetRotationX - ringGroup.rotation.x) * 0.08;
    ringGroup.position.y = Math.sin(performance.now() * 0.0012) * 0.025;
  }

  camera.position.set(0, 0.62, zoom);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

function setupIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setupCustomCursor() {
  if (window.matchMedia("(max-width: 680px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let lastSpark = 0;

  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    const now = performance.now();
    if (now - lastSpark > 42) {
      createCursorSpark(mouseX, mouseY);
      lastSpark = now;
    }
  });

  function trail() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(trail);
  }

  document.querySelectorAll("a, button, .ring-viewer").forEach((item) => {
    item.addEventListener("mouseenter", () => ring.classList.add("is-active"));
    item.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
  });

  trail();
}

function createCursorSpark(x, y) {
  const spark = document.createElement("span");
  const driftX = `${(Math.random() - 0.5) * 58}px`;
  const driftY = `${(Math.random() - 0.5) * 58}px`;

  spark.className = "cursor-spark";
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  spark.style.setProperty("--spark-x", `calc(-50% + ${driftX})`);
  spark.style.setProperty("--spark-y", `calc(-50% + ${driftY})`);
  document.body.appendChild(spark);
  window.setTimeout(() => spark.remove(), 700);
}

function setupMagneticButtons() {
  if (window.matchMedia("(max-width: 680px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  document.querySelectorAll(".magnetic").forEach((item) => {
    item.addEventListener("mousemove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "translate(0, 0)";
    });
  });
}

window.addEventListener("resize", resizeRenderer);
