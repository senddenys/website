function toggleState() {
  const body = document.body;
  body.classList.toggle("before");
  body.classList.toggle("after");

  if (body.classList.contains("after")) {
    const explodedBugs = document.querySelectorAll(".exploded-bug");
    explodedBugs.forEach((bug) => bug.remove());
    const mainBug = document.querySelector(".bouncing-bug");
    if (mainBug) mainBug.style.opacity = "0";
  }

  if (body.classList.contains("before")) {
    const mainBug = document.querySelector(".bouncing-bug");
    if (mainBug) mainBug.style.opacity = "";
  }
}

function explodeBug(event) {
  event.stopPropagation();
  const bug = event.currentTarget;
  const rect = bug.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  bug.style.opacity = "0";

  const bugCount = 10;
  for (let i = 0; i < bugCount; i++) {
    const explodedBug = document.createElement("div");
    explodedBug.className = "exploded-bug";
    explodedBug.textContent = "🐛";
    explodedBug.style.left = centerX + "px";
    explodedBug.style.top = centerY + "px";

    const angle = (i / bugCount) * 360;
    const distance = 170 + Math.random() * 70;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;
    const rotate = Math.random() * 480 - 240;

    explodedBug.style.setProperty("--explode-x", x + "px");
    explodedBug.style.setProperty("--explode-y", y + "px");
    explodedBug.style.setProperty("--explode-rotate", rotate + "deg");
    explodedBug.style.setProperty("--fly-start-x", x + "px");
    explodedBug.style.setProperty("--fly-start-y", y + "px");
    explodedBug.onclick = explodeBug;
    document.body.appendChild(explodedBug);

    setTimeout(() => {
      explodedBug.classList.add("flying");
    }, 1000);
  }

  if (bug.classList.contains("exploded-bug")) {
    setTimeout(() => bug.remove(), 120);
  } else {
    setTimeout(() => {
      bug.style.opacity = "1";
    }, 500);
  }
}

function showBsodFlash() {
  const bsod = document.getElementById("bsodScreen");
  if (!bsod) return;
  bsod.classList.add("active");
  setTimeout(() => {
    bsod.classList.remove("active");
  }, 1000);
}

let currentTestimonial = 0;
const totalTestimonials = 4;
let carouselInterval;
let isHovering = false;
let bsodInterval;

function updateCarousel() {
  const slides = document.querySelector(".testimonial-slides");
  const dots = document.querySelectorAll(".carousel-dot");
  if (!slides) return;

  slides.style.transform = `translateX(-${currentTestimonial * 100}%)`;
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentTestimonial);
  });
}

function nextTestimonial() {
  currentTestimonial = (currentTestimonial + 1) % totalTestimonials;
  updateCarousel();
}

function previousTestimonial() {
  currentTestimonial = (currentTestimonial - 1 + totalTestimonials) % totalTestimonials;
  updateCarousel();
}

function goToTestimonial(index) {
  currentTestimonial = index;
  updateCarousel();
}

function startCarousel() {
  carouselInterval = setInterval(() => {
    if (!isHovering) nextTestimonial();
  }, 7000);
}

function setupCarouselHover() {
  const carousel = document.querySelector(".testimonial-carousel");
  if (!carousel) return;

  carousel.addEventListener("mouseenter", () => {
    isHovering = true;
  });
  carousel.addEventListener("mouseleave", () => {
    isHovering = false;
  });
}

function setupCarouselSwipe() {
  const carousel = document.querySelector(".testimonial-carousel");
  if (!carousel) return;

  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});

  carousel.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextTestimonial();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      previousTestimonial();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.style.opacity = "0";
    setTimeout(() => {
      hero.style.opacity = "1";
    }, 100);
  }

  setupCarouselHover();
  setupCarouselSwipe();
  startCarousel();

  const btn = document.getElementById("reportBugBtn");
  if (btn) {
    btn.style.left = window.innerWidth - 160 + "px";
    btn.style.top = window.innerHeight - 80 + "px";
    btn.style.right = "auto";
    btn.style.bottom = "auto";

    btn.addEventListener("mouseenter", function (e) {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - e.clientX;
      const dy = cy - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const jump = 150 + Math.random() * 120;

      let newX = rect.left + (dx / dist) * jump;
      let newY = rect.top + (dy / dist) * jump;
      const minX = 10;
      const maxX = window.innerWidth - rect.width - 10;
      const minY = 10;
      const maxY = window.innerHeight - rect.height - 10;
      const clampedX = Math.max(minX, Math.min(maxX, newX));
      const clampedY = Math.max(minY, Math.min(maxY, newY));

      if (clampedX !== newX) {
        newX = Math.max(minX, Math.min(maxX, rect.left - (dx / dist) * jump));
      }
      if (clampedY !== newY) {
        newY = Math.max(minY, Math.min(maxY, rect.top - (dy / dist) * jump));
      }

      btn.style.left = newX + "px";
      btn.style.top = newY + "px";
    });
  }

  bsodInterval = setInterval(() => {
    if (document.body.classList.contains("before")) {
      showBsodFlash();
    }
  }, 10000);
});
