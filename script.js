/* Frame sequence configuration.
   The provided images live in /frames/ as frame_0001.jpg ... frame_0240.jpg. */
const totalFrames = 240;
const framePath = (index) => `frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 680px)").matches;
const frameIndexes = Array.from({ length: totalFrames }, (_, index) => index);

const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const frameSection = document.getElementById("frameSection");
const scrollProgress = document.querySelector(".scroll-progress span");
const frameCopy = document.getElementById("frameCopy");
const frameKicker = document.getElementById("frameKicker");
const frameTitle = document.getElementById("frameTitle");
const frameLead = document.getElementById("frameLead");

const frameStory = [
  {
    start: 0,
    kicker: "Maison Liora",
    title: "יהלום שנולד לאור.",
    lead: "גללי לאט וראי איך כל ניצוץ, כל קימור וכל פרט בתכשיט מתגלה כמו רגע נדיר."
  },
  {
    start: 42,
    kicker: "חומרי גלם",
    title: "זהב 18 קראט. ברק שנשאר.",
    lead: "הבסיס לכל תכשיט הוא חומר נקי, עשיר ומאוזן, כזה שמרגיש יוקרתי עוד לפני השיבוץ."
  },
  {
    start: 92,
    kicker: "שיבוץ מדויק",
    title: "כל אבן מקבלת במה.",
    lead: "יהלומים ואבני חן נבחרים לפי אור, חיתוך ונוכחות, ואז משובצים ביד לתוצאה נקייה ומדויקת."
  },
  {
    start: 145,
    kicker: "קולקציית Signature",
    title: "תכשיטים לערב, ליום ולרגע שלא חוזר.",
    lead: "טבעות, שרשראות ועגילים שמחברים בין מינימליזם מודרני לבין דרמה אלגנטית."
  },
  {
    start: 198,
    kicker: "התאמה אישית",
    title: "הפריט הבא שלך מתחיל בשיחה.",
    lead: "בחרי מידה, זהב, אבן וחריטה, ואנחנו נהפוך את הסיפור שלך לתכשיט חד פעמי."
  }
];

let images = new Array(totalFrames);
let frameRequests = new Map();
let loadedFrameCount = 0;
let allFramesReady = false;
let currentFrame = 0;
let targetFrame = 0;
let activeStoryIndex = 0;
let canvasWidth = 0;
let canvasHeight = 0;
let canvasScale = 1;
let lenis;

function startFrameLoading() {
  frameIndexes.forEach((index) => {
    loadFrame(index);
  });
}

function loadFrame(index) {
  if (images[index]) {
    return Promise.resolve(images[index]);
  }

  if (frameRequests.has(index)) {
    return frameRequests.get(index);
  }

  const request = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = index < 80 ? "high" : "auto";
    image.onload = () => {
      images[index] = image;
      frameRequests.delete(index);
      loadedFrameCount += 1;
      allFramesReady = loadedFrameCount === totalFrames;

      if (index === 0 || index === targetFrame || allFramesReady) {
        renderFrame(targetFrame);
      }

      resolve(image);
    };
    image.onerror = () => {
      frameRequests.delete(index);
      console.warn(`Frame failed to load: ${framePath(index)}`);
      resolve(null);
    };
    image.src = framePath(index);
  });

  frameRequests.set(index, request);
  return request;
}

function resizeCanvas() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvasScale = getCanvasScale();
  canvas.width = Math.floor(canvasWidth * canvasScale);
  canvas.height = Math.floor(canvasHeight * canvasScale);
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  ctx.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  renderFrame(currentFrame);
}

function getCanvasScale() {
  const deviceScale = window.devicePixelRatio || 1;
  const fourKScale = Math.max(1, 3840 / Math.max(window.innerWidth, 1));
  const desiredScale = Math.max(deviceScale, fourKScale);
  const maxScale = isMobile ? 2 : 2.5;

  return Math.min(desiredScale, maxScale);
}

// Draw with "cover" behavior so every frame fills the viewport like a hero video.
function renderFrame(index) {
  const image = findBestFrame(index);
  if (!image) return;

  const imageRatio = image.width / image.height;
  const canvasRatio = canvasWidth / canvasHeight;
  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imageRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
  } else {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imageRatio;
    offsetY = (canvasHeight - drawHeight) / 2;
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.filter = "contrast(1.07) saturate(1.14) brightness(1.03)";
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  ctx.filter = "none";
  addPremiumImageFinish();
}

function addPremiumImageFinish() {
  const gradient = ctx.createRadialGradient(
    canvasWidth * 0.5,
    canvasHeight * 0.45,
    canvasWidth * 0.18,
    canvasWidth * 0.5,
    canvasHeight * 0.5,
    canvasWidth * 0.82
  );

  gradient.addColorStop(0, "rgba(255, 255, 255, 0.025)");
  gradient.addColorStop(0.62, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.32)");

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function findBestFrame(index) {
  if (images[index]) return images[index];

  for (let distance = 1; distance < totalFrames; distance += 1) {
    const previous = index - distance;
    const next = index + distance;

    if (previous >= 0 && images[previous]) return images[previous];
    if (next < totalFrames && images[next]) return images[next];
  }

  return null;
}

function updateFrameFromScroll() {
  const rect = frameSection.getBoundingClientRect();
  const sectionHeight = frameSection.offsetHeight;
  const windowHeight = window.innerHeight;
  const scrollY = Math.min(Math.max(-rect.top, 0), sectionHeight - windowHeight);
  const scrollableDistance = Math.max(sectionHeight - windowHeight, 1);
  const scrollFraction = scrollY / scrollableDistance;
  targetFrame = Math.min(totalFrames - 1, Math.round(scrollFraction * (totalFrames - 1)));
  loadFrame(targetFrame);
  updateFrameStory(targetFrame);
}

function updateFrameStory(frameIndex) {
  const nextStoryIndex = frameStory.reduce((activeIndex, story, index) => {
    return frameIndex >= story.start ? index : activeIndex;
  }, 0);

  if (nextStoryIndex === activeStoryIndex) return;

  activeStoryIndex = nextStoryIndex;
  const story = frameStory[activeStoryIndex];

  frameCopy.classList.add("is-changing");
  window.setTimeout(() => {
    frameKicker.textContent = story.kicker;
    frameTitle.textContent = story.title;
    frameLead.textContent = story.lead;
    frameCopy.classList.remove("is-changing");
  }, 180);
}

function animationLoop(time) {
  if (lenis) {
    lenis.raf(time);
  }

  if (!prefersReducedMotion) {
    updateFrameFromScroll();
  }

  if (targetFrame !== currentFrame) {
    currentFrame = targetFrame;
    renderFrame(currentFrame);
  }

  updateScrollProgress();

  requestAnimationFrame(animationLoop);
}

function requestFramesAround(index) {
  const preloadRadius = isMobile ? 12 : 20;
  for (let offset = 0; offset <= preloadRadius; offset += 1) {
    const previous = index - offset;
    const next = index + offset;

    if (previous >= 0 && !images[previous]) loadFrame(previous);
    if (next < totalFrames && !images[next]) loadFrame(next);
  }
}

function updateScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  scrollProgress.style.width = `${Math.min(progress * 100, 100)}%`;
}

function setupLenis() {
  if (prefersReducedMotion || !window.Lenis) return;

  lenis = new Lenis({
    duration: 0.72,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    wheelMultiplier: 1.15,
    touchMultiplier: 1.2
  });
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal, .feature-card, .project-card, .quote-card, .stat");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function setupSplitText() {
  document.querySelectorAll(".split-title").forEach((title) => {
    const words = title.textContent.trim().split(/\s+/);
    title.textContent = "";

    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = `${word} `;
      span.style.transitionDelay = `${Math.min(index * 55, 650)}ms`;
      title.appendChild(span);
    });

    title.classList.add("is-visible");
  });
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.count);
        const duration = 1500;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.round(target * eased).toLocaleString("he-IL");

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        }

        requestAnimationFrame(tick);
        observer.unobserve(counter);
      });
    },
    { threshold: 0.45 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupFeaturePresenter() {
  const presenter = document.getElementById("featurePresenter");
  if (!presenter) return;

  const cards = document.querySelectorAll(".feature-card");
  const backdrop = presenter.querySelector(".feature-presenter__backdrop");
  const closeButton = presenter.querySelector(".feature-presenter__close");
  const iconTarget = document.getElementById("featurePresenterIcon");
  const titleTarget = document.getElementById("featurePresenterTitle");
  const textTarget = document.getElementById("featurePresenterText");

  function openPresenter(card) {
    const icon = card.querySelector("svg")?.cloneNode(true);
    const title = card.querySelector("h3")?.textContent || "";
    const text = card.dataset.expanded || card.querySelector("p")?.textContent || "";

    iconTarget.replaceChildren();
    if (icon) {
      iconTarget.appendChild(icon);
    }

    titleTarget.textContent = title;
    textTarget.textContent = text;
    presenter.classList.add("is-open");
    presenter.setAttribute("aria-hidden", "false");
    closeButton.focus();
  }

  function closePresenter() {
    presenter.classList.remove("is-open");
    presenter.setAttribute("aria-hidden", "true");
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => openPresenter(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPresenter(card);
      }
    });
  });

  backdrop.addEventListener("click", closePresenter);
  closeButton.addEventListener("click", closePresenter);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && presenter.classList.contains("is-open")) {
      closePresenter();
    }
  });
}

function setupCustomCursor() {
  if (isMobile || prefersReducedMotion) return;

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

  document.querySelectorAll("a, button, .project-card").forEach((item) => {
    item.addEventListener("mouseenter", () => ring.classList.add("is-active"));
    item.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
  });

  trail();
}

function setupLuxuryInteractions() {
  if (prefersReducedMotion) return;

  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  const interactiveGlowItems = document.querySelectorAll(".feature-card, .quote-card, .stat");
  const tiltCards = document.querySelectorAll(".project-card");

  window.addEventListener(
    "pointermove",
    (event) => {
      document.body.style.setProperty("--spotlight-x", `${event.clientX}px`);
      document.body.style.setProperty("--spotlight-y", `${event.clientY}px`);
    },
    { passive: true }
  );

  interactiveGlowItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      item.style.setProperty("--card-x", `${x}%`);
      item.style.setProperty("--card-y", `${y}%`);
    });
  });

  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * -8}deg) rotateX(${y * 7}deg) translateY(-6px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });

  function updateNavState() {
    navbar?.classList.toggle("is-scrolled", window.scrollY > 24);

    navLinks.forEach((link) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const isActive = rect.top < window.innerHeight * 0.42 && rect.bottom > window.innerHeight * 0.34;
      link.classList.toggle("is-active", isActive);
    });
  }

  window.addEventListener("scroll", updateNavState, { passive: true });
  updateNavState();
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
  if (isMobile || prefersReducedMotion) return;

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

function setupGalleryFilters() {
  const tags = document.querySelectorAll(".tag");
  const cards = document.querySelectorAll(".project-card");

  tags.forEach((tag) => {
    tag.addEventListener("click", () => {
      tags.forEach((item) => item.classList.remove("is-active"));
      tag.classList.add("is-active");

      const selected = tag.textContent.trim();
      cards.forEach((card) => {
        const shouldShow = selected === "הכל" || card.dataset.category === selected;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

function setupParallax() {
  if (prefersReducedMotion) return;

  const parallaxItems = document.querySelectorAll(".ambient, .particles");

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      parallaxItems.forEach((item, index) => {
        const speed = index % 2 === 0 ? 0.045 : -0.035;
        item.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    },
    { passive: true }
  );
}

function setupIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateFrameFromScroll, { passive: true });

setupSplitText();
setupRevealAnimations();
setupCounters();
setupFeaturePresenter();
setupCustomCursor();
setupLuxuryInteractions();
setupMagneticButtons();
setupGalleryFilters();
setupParallax();
setupLenis();
setupIcons();
resizeCanvas();
startFrameLoading();
requestAnimationFrame(animationLoop);
