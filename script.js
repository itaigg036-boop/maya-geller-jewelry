const totalFrames = 240;
const framePath = (index) => `frames/frame_${String(index + 1).padStart(4, "0")}.jpg`;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 680px)").matches;
const canvas = document.getElementById("heroCanvas");
const ctx = canvas?.getContext("2d", { alpha: false });
const frameSection = document.getElementById("frameSection");
const scrollProgress = document.querySelector(".scroll-progress span");
const frameCopy = document.getElementById("frameCopy");
const frameKicker = document.getElementById("frameKicker");
const frameTitle = document.getElementById("frameTitle");
const frameLead = document.getElementById("frameLead");

const frameStory = [
  {
    start: 0,
    kicker: "בית תכשיטי יוקרה",
    title: "Maison Liora",
    lead: "תכשיטים על-זמניים שנוצרים באלגנטיות"
  },
  {
    start: 42,
    kicker: "יהלומים נבחרים",
    title: "אור, חיתוך וברק שקט.",
    lead: "כל אבן נבחרת לפי נוכחות, פרופורציה והאופן שבו היא מחזירה אור בתנועה."
  },
  {
    start: 92,
    kicker: "אטלייה זהב",
    title: "זהב שמעוצב באיפוק.",
    lead: "זהב 14K ו-18K מקבל גימור ידני נקי, עשיר ומעודן."
  },
  {
    start: 145,
    kicker: "עיצוב אישי",
    title: "תכשיט שנבנה סביב הסיפור שלך.",
    lead: "מטבעת אירוסין ועד מתנה יוקרתית, כל פרט ניתן להתאמה בפגישה פרטית."
  },
  {
    start: 198,
    kicker: "Maison Signature",
    title: "יוקרה שנועדה לענידה.",
    lead: "תכשיטים שמרגישים אלגנטיים ברגע הראשון ונשארים נכונים גם שנים קדימה."
  }
];

let images = new Array(totalFrames);
let frameRequests = new Map();
let loadedFrameCount = 0;
let currentFrame = 0;
let targetFrame = 0;
let activeStoryIndex = 0;
let canvasWidth = 0;
let canvasHeight = 0;
let canvasScale = 1;
let lenis;

function hasFrameExperience() {
  return Boolean(canvas && ctx && frameSection);
}

function startFrameLoading() {
  if (!hasFrameExperience()) return;

  Array.from({ length: totalFrames }, (_, index) => index).forEach((index) => {
    loadFrame(index);
  });
}

function loadFrame(index) {
  if (!hasFrameExperience()) {
    return Promise.resolve(null);
  }

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

      if (index === 0 || index === targetFrame || loadedFrameCount === totalFrames) {
        renderFrame(targetFrame);
      }

      resolve(image);
    };
    image.onerror = () => {
      frameRequests.delete(index);
      resolve(null);
    };
    image.src = framePath(index);
  });

  frameRequests.set(index, request);
  return request;
}

function resizeCanvas() {
  if (!hasFrameExperience()) return;

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
  const premiumScale = Math.max(1, 2560 / Math.max(window.innerWidth, 1));
  const desiredScale = Math.max(deviceScale, premiumScale);
  return Math.min(desiredScale, isMobile ? 2 : 2.35);
}

function renderFrame(index) {
  if (!hasFrameExperience()) return;

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
  ctx.filter = "contrast(1.08) saturate(0.92) brightness(0.88)";
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  ctx.filter = "none";
  addCinematicFinish();
}

function addCinematicFinish() {
  const gradient = ctx.createRadialGradient(
    canvasWidth * 0.52,
    canvasHeight * 0.42,
    canvasWidth * 0.18,
    canvasWidth * 0.5,
    canvasHeight * 0.5,
    canvasWidth * 0.84
  );

  gradient.addColorStop(0, "rgba(245, 241, 234, 0.025)");
  gradient.addColorStop(0.58, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.44)");
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
  if (!hasFrameExperience()) return;

  const rect = frameSection.getBoundingClientRect();
  const sectionHeight = frameSection.offsetHeight;
  const windowHeight = window.innerHeight;
  const scrollY = Math.min(Math.max(-rect.top, 0), sectionHeight - windowHeight);
  const scrollableDistance = Math.max(sectionHeight - windowHeight, 1);
  const scrollFraction = scrollY / scrollableDistance;
  targetFrame = Math.min(totalFrames - 1, Math.round(scrollFraction * (totalFrames - 1)));
  loadFrame(targetFrame);
  requestFramesAround(targetFrame);
  updateFrameStory(targetFrame);
}

function updateFrameStory(frameIndex) {
  if (!frameCopy || !frameKicker || !frameTitle || !frameLead) return;

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
  }, 190);
}

function requestFramesAround(index) {
  if (!hasFrameExperience()) return;

  const preloadRadius = isMobile ? 10 : 18;
  for (let offset = 0; offset <= preloadRadius; offset += 1) {
    const previous = index - offset;
    const next = index + offset;
    if (previous >= 0 && !images[previous]) loadFrame(previous);
    if (next < totalFrames && !images[next]) loadFrame(next);
  }
}

function animationLoop(time) {
  if (lenis) {
    lenis.raf(time);
  }

  if (hasFrameExperience() && !prefersReducedMotion) {
    updateFrameFromScroll();
  }

  if (hasFrameExperience() && targetFrame !== currentFrame) {
    currentFrame = targetFrame;
    renderFrame(currentFrame);
  }

  updateScrollProgress();
  requestAnimationFrame(animationLoop);
}

function updateScrollProgress() {
  if (!scrollProgress) return;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  scrollProgress.style.width = `${Math.min(progress * 100, 100)}%`;
}

function setupLenis() {
  if (prefersReducedMotion || !window.Lenis) return;

  lenis = new Lenis({
    duration: 0.78,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    wheelMultiplier: 1.05,
    touchMultiplier: 1.15
  });
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(
    ".reveal, .collection-card, .product-card, .value-card, .story-media, .quote-card, .stat"
  );

  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
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
      span.style.transitionDelay = `${Math.min(index * 55, 700)}ms`;
      title.appendChild(span);
    });

    window.setTimeout(() => title.classList.add("is-visible"), 180);
  });
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

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
          if (progress < 1) requestAnimationFrame(tick);
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
    if (icon) iconTarget.appendChild(icon);
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

  backdrop?.addEventListener("click", closePresenter);
  closeButton?.addEventListener("click", closePresenter);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && presenter.classList.contains("is-open")) closePresenter();
  });
}

function setupCustomCursor() {
  if (isMobile || prefersReducedMotion) return;

  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;

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
    if (now - lastSpark > 54) {
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

  document.querySelectorAll("a, button, .collection-card, .product-card").forEach((item) => {
    item.addEventListener("mouseenter", () => ring.classList.add("is-active"));
    item.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
  });

  trail();
}

function createCursorSpark(x, y) {
  const spark = document.createElement("span");
  const driftX = `${(Math.random() - 0.5) * 54}px`;
  const driftY = `${(Math.random() - 0.5) * 54}px`;

  spark.className = "cursor-spark";
  spark.style.left = `${x}px`;
  spark.style.top = `${y}px`;
  spark.style.setProperty("--spark-x", `calc(-50% + ${driftX})`);
  spark.style.setProperty("--spark-y", `calc(-50% + ${driftY})`);
  document.body.appendChild(spark);
  window.setTimeout(() => spark.remove(), 700);
}

function setupLuxuryInteractions() {
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  const tiltCards = document.querySelectorAll(".collection-card, .product-card");

  if (!prefersReducedMotion) {
    window.addEventListener(
      "pointermove",
      (event) => {
        document.body.style.setProperty("--spotlight-x", `${event.clientX}px`);
        document.body.style.setProperty("--spotlight-y", `${event.clientY}px`);
      },
      { passive: true }
    );

    tiltCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * -4}deg) rotateX(${y * 3}deg) translateY(-8px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

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

function setupMagneticButtons() {
  if (isMobile || prefersReducedMotion) return;

  document.querySelectorAll(".magnetic").forEach((item) => {
    item.addEventListener("mousemove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.14}px, ${y * 0.14}px)`;
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "translate(0, 0)";
    });
  });
}

function setupGalleryFilters() {
  const tags = document.querySelectorAll(".tag");
  const cards = document.querySelectorAll(".project-card");
  if (!tags.length || !cards.length) return;

  tags.forEach((tag) => {
    tag.addEventListener("click", () => {
      tags.forEach((item) => item.classList.remove("is-active"));
      tag.classList.add("is-active");
      const selected = tag.textContent.trim();
      cards.forEach((card) => {
        const shouldShow = selected === "All" || card.dataset.category === selected;
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

function setupParallax() {
  if (prefersReducedMotion) return;

  const parallaxItems = document.querySelectorAll(".hero-orb, .story-media");
  if (!parallaxItems.length) return;

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      parallaxItems.forEach((item, index) => {
        const speed = index % 2 === 0 ? 0.026 : -0.018;
        item.style.setProperty("--parallax-y", `${y * speed}px`);
      });
    },
    { passive: true }
  );
}

function setupProductGallery() {
  const mainImage = document.querySelector(".product-main-image");
  const thumbs = Array.from(document.querySelectorAll(".gallery-thumb"));
  const prevButton = document.querySelector("[data-gallery-prev]");
  const nextButton = document.querySelector("[data-gallery-next]");
  if (!mainImage || !thumbs.length) return;

  let activeIndex = thumbs.findIndex((thumb) => thumb.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;

  function setActive(index) {
    activeIndex = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[activeIndex];
    const image = thumb.querySelector("img");
    mainImage.style.opacity = "0";
    window.setTimeout(() => {
      mainImage.src = image.src;
      mainImage.alt = image.alt;
      mainImage.style.opacity = "1";
    }, 160);
    thumbs.forEach((item) => item.classList.remove("is-active"));
    thumb.classList.add("is-active");
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => setActive(index));
  });

  prevButton?.addEventListener("click", () => setActive(activeIndex - 1));
  nextButton?.addEventListener("click", () => setActive(activeIndex + 1));
}

function setupContactForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const status = form.querySelector(".form-status");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (status) {
      status.textContent = "תודה, Maison Liora תחזור אליך בהקדם.";
    }
    form.reset();
  });
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
setupProductGallery();
setupContactForm();
setupLenis();
setupIcons();
resizeCanvas();
startFrameLoading();
requestAnimationFrame(animationLoop);
