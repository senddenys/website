function initHeroBugs() {
  const arena = document.getElementById("bugsArena");
  const heroText = document.querySelector(".hero-text");
  if (!arena) return;

  const BUG_COUNT = 32;
  const SCATTER_RADIUS = 110;
  const SCATTER_FORCE = 140;
  const TEXT_PADDING = 56;
  const TEXT_REPEL_FORCE = 90;
  const bugs = [];

  function getArenaRect() {
    return arena.getBoundingClientRect();
  }

  function getTextZone() {
    if (!heroText) return null;
    const arenaRect = getArenaRect();
    const textRect = heroText.getBoundingClientRect();
    return {
      left: textRect.left - arenaRect.left - TEXT_PADDING,
      right: textRect.right - arenaRect.left + TEXT_PADDING,
      top: textRect.top - arenaRect.top - TEXT_PADDING,
      bottom: textRect.bottom - arenaRect.top + TEXT_PADDING,
    };
  }

  function isInsideZone(px, py, zone) {
    return px >= zone.left && px <= zone.right && py >= zone.top && py <= zone.bottom;
  }

  function getBugPixels(bug, rect) {
    return {
      px: (bug.x / 100) * rect.width + bug.offsetX,
      py: (bug.y / 100) * rect.height + bug.offsetY,
    };
  }

  function repelFromZone(px, py, zone) {
    const closestX = Math.max(zone.left, Math.min(px, zone.right));
    const closestY = Math.max(zone.top, Math.min(py, zone.bottom));
    const dx = px - closestX;
    const dy = py - closestY;
    const dist = Math.hypot(dx, dy);

    if (isInsideZone(px, py, zone)) {
      if (dist < 0.001) return { x: 0, y: -TEXT_REPEL_FORCE };
      return { x: (dx / dist) * TEXT_REPEL_FORCE, y: (dy / dist) * TEXT_REPEL_FORCE };
    }

    const edgeBuffer = 36;
    if (dist < edgeBuffer && dist > 0) {
      const force = ((edgeBuffer - dist) / edgeBuffer) * TEXT_REPEL_FORCE * 0.6;
      return { x: (dx / dist) * force, y: (dy / dist) * force };
    }

    return { x: 0, y: 0 };
  }

  function clampOutsideZone(bug, rect, zone) {
    const { px, py } = getBugPixels(bug, rect);
    if (!isInsideZone(px, py, zone)) return;

    const closestX = Math.max(zone.left, Math.min(px, zone.right));
    const closestY = Math.max(zone.top, Math.min(py, zone.bottom));
    let dx = px - closestX;
    let dy = py - closestY;
    let dist = Math.hypot(dx, dy);

    if (dist < 0.001) {
      dx = 0;
      dy = -1;
      dist = 1;
    }

    const margin = 24;
    const safePx = closestX + (dx / dist) * margin;
    const safePy = closestY + (dy / dist) * margin;
    const basePx = (bug.x / 100) * rect.width;
    const basePy = (bug.y / 100) * rect.height;

    bug.offsetX = safePx - basePx;
    bug.offsetY = safePy - basePy;
  }

  function randomPositionOutsideZone(zone, rect) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const x = 6 + Math.random() * 88;
      const y = 8 + Math.random() * 84;
      const px = (x / 100) * rect.width;
      const py = (y / 100) * rect.height;
      if (!isInsideZone(px, py, zone)) return { x, y };
    }

    const corners = [
      { x: 12, y: 14 },
      { x: 88, y: 14 },
      { x: 12, y: 86 },
      { x: 88, y: 86 },
    ];
    return corners[Math.floor(Math.random() * corners.length)];
  }

  function createBugs() {
    bugs.forEach((bug) => bug.el.remove());
    bugs.length = 0;

    const rect = getArenaRect();
    const zone = getTextZone();
    if (!zone) return;

    for (let i = 0; i < BUG_COUNT; i++) {
      const bug = document.createElement("img");
      bug.src = "assets/bug-icon.png";
      bug.alt = "";
      bug.className = "hero-bug";
      bug.draggable = false;

      const { x, y } = randomPositionOutsideZone(zone, rect);
      const size = 32 + Math.random() * 36;
      const rotation = -40 + Math.random() * 80;

      bug.style.left = `${x}%`;
      bug.style.top = `${y}%`;
      bug.style.width = `${size}px`;
      bug.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

      arena.appendChild(bug);
      bugs.push({
        el: bug,
        x,
        y,
        rotation,
        offsetX: 0,
        offsetY: 0,
        targetX: 0,
        targetY: 0,
      });
    }
  }

  function scatterFromPoint(clientX, clientY) {
    const rect = getArenaRect();
    const zone = getTextZone();
    if (!zone) return;

    bugs.forEach((bug) => {
      const { px, py } = getBugPixels(bug, rect);
      const dx = px - (clientX - rect.left);
      const dy = py - (clientY - rect.top);
      const dist = Math.hypot(dx, dy);

      let targetX = 0;
      let targetY = 0;

      if (dist < SCATTER_RADIUS && dist > 0) {
        const force = (SCATTER_RADIUS - dist) / SCATTER_RADIUS;
        targetX = (dx / dist) * SCATTER_FORCE * force;
        targetY = (dy / dist) * SCATTER_FORCE * force;
      }

      const repel = repelFromZone(px + targetX, py + targetY, zone);
      bug.targetX = targetX + repel.x;
      bug.targetY = targetY + repel.y;
    });
  }

  function resetScatter() {
    const rect = getArenaRect();
    const zone = getTextZone();
    if (!zone) return;

    bugs.forEach((bug) => {
      const { px, py } = getBugPixels(bug, rect);
      const repel = repelFromZone(px, py, zone);
      bug.targetX = repel.x;
      bug.targetY = repel.y;
    });
  }

  createBugs();
  window.addEventListener("load", createBugs);

  arena.addEventListener("mousemove", (e) => scatterFromPoint(e.clientX, e.clientY));
  arena.addEventListener("mouseleave", resetScatter);
  arena.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    if (touch) scatterFromPoint(touch.clientX, touch.clientY);
  }, { passive: true });
  arena.addEventListener("touchend", resetScatter);

  window.addEventListener("resize", () => {
    bugs.forEach((bug) => {
      bug.offsetX = 0;
      bug.offsetY = 0;
      bug.targetX = 0;
      bug.targetY = 0;
    });
    createBugs();
  });

  function animate() {
    const rect = getArenaRect();
    const zone = getTextZone();

    bugs.forEach((bug) => {
      bug.offsetX += (bug.targetX - bug.offsetX) * 0.18;
      bug.offsetY += (bug.targetY - bug.offsetY) * 0.18;

      if (zone) {
        const { px, py } = getBugPixels(bug, rect);
        const repel = repelFromZone(px, py, zone);
        bug.offsetX += repel.x * 0.12;
        bug.offsetY += repel.y * 0.12;
        clampOutsideZone(bug, rect, zone);
      }

      bug.el.style.transform =
        `translate(calc(-50% + ${bug.offsetX}px), calc(-50% + ${bug.offsetY}px)) rotate(${bug.rotation}deg)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
}

function initPreloader() {
  window.addEventListener("load", () => {
    setTimeout(() => {
      document.body.classList.add("loaded");
    }, 800);
  });
}

function initCarousel(trackId, prevId, nextId, counterId) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  const counter = document.getElementById(counterId);
  if (!track || !prevBtn || !nextBtn) return null;

  const slides = track.children.length;
  let current = 0;
  let interval;

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    if (counter) counter.textContent = `${current + 1}/${slides}`;
  }

  function goTo(index) {
    current = (index + slides) % slides;
    update();
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  function startAuto() {
    interval = setInterval(() => goTo(current + 1), 7000);
  }

  function stopAuto() {
    clearInterval(interval);
  }

  const section = track.closest("section");
  if (section) {
    section.addEventListener("mouseenter", stopAuto);
    section.addEventListener("mouseleave", startAuto);
  }

  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) goTo(diff < 0 ? current + 1 : current - 1);
  }, { passive: true });

  update();
  startAuto();
  return { goTo, stopAuto, startAuto };
}

function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".section-head, .skill-card, .stat-item, .hero-text"
  );

  targets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initHeroBugs();
  initCarousel("certTrack", "certPrev", "certNext", "certCounter");
  initCarousel("testTrack", "testPrev", "testNext", "testCounter");
  initScrollReveal();
});
