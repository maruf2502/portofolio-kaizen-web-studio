// ===========================
// Mobile Menu Toggle
// ===========================
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle) {
  // Mobile menu drag functionality
  let isDragging = false;
  let startX, startY;
  let startTop, startLeft;

  const onDragStart = (e) => {
    isDragging = true;
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    const rect = menuToggle.getBoundingClientRect();
    startTop = rect.top;
    startLeft = rect.left;

    menuToggle.style.transition = "none";
    menuToggle.style.right = "auto"; // Switch to left-based positioning for dragging
    menuToggle.style.left = `${startLeft}px`;
  };

  const onDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    let newTop = startTop + deltaY;
    let newLeft = startLeft + deltaX;

    // Constrain within screen bounds
    const threshold = 10;
    const maxTop = window.innerHeight - menuToggle.offsetHeight - threshold;
    const maxLeft = window.innerWidth - menuToggle.offsetWidth;

    newTop = Math.max(threshold, Math.min(newTop, maxTop));
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    menuToggle.style.top = `${newTop}px`;
    menuToggle.style.left = `${newLeft}px`;
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    // Snap to closest side
    const halfway = window.innerWidth / 2;
    const currentLeft = menuToggle.offsetLeft;

    menuToggle.style.transition =
      "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

    if (currentLeft + menuToggle.offsetWidth / 2 < halfway) {
      // Snap to left
      menuToggle.style.left = "0";
      menuToggle.style.borderRadius = "0 12px 12px 0";
      menuToggle.style.boxShadow = "4px 0 20px rgba(15, 44, 31, 0.3)";
    } else {
      // Snap to right
      menuToggle.style.left = `${window.innerWidth - menuToggle.offsetWidth}px`;
      menuToggle.style.borderRadius = "12px 0 0 12px";
      menuToggle.style.boxShadow = "-4px 0 20px rgba(15, 44, 31, 0.3)";
    }
  };

  menuToggle.addEventListener("mousedown", onDragStart);
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);

  menuToggle.addEventListener("touchstart", onDragStart, { passive: true });
  window.addEventListener("touchmove", onDragMove, { passive: false });
  window.addEventListener("touchend", onDragEnd);

  menuToggle.addEventListener("click", (e) => {
    // Prevent menu opening if button was dragged significantly
    if (
      Math.sqrt(
        Math.pow(menuToggle.offsetTop - startTop, 2) +
          Math.pow(menuToggle.offsetLeft - startLeft, 2),
      ) > 10
    ) {
      return;
    }

    const isActive = navLinks.classList.toggle("active");
    menuToggle.classList.toggle("active");
    document.body.style.overflow = isActive ? "hidden" : "auto";
  });

  // Close menu when link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  });
}

const WHATSAPP_NUMBER_E164 = "6289697607595";

function sanitizeWhatsAppSingleLine(value) {
  return (
    String(value ?? "")
      .replace(/[\r\n]+/g, " ")
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      // WhatsApp formatting markers often accidentally typed
      .replace(/[\*_~`]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function sanitizeWhatsAppMessage(value) {
  return (
    String(value ?? "")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      // Remove common accidental WhatsApp formatting markers
      .replace(/[\*_~`]/g, "")
      // Prevent trailing whitespace on lines
      .split("\n")
      .map((line) => line.replace(/\s+$/g, ""))
      .join("\n")
      .trim()
  );
}

function openWhatsAppChat(message) {
  const text = sanitizeWhatsAppMessage(message);
  const encoded = text ? encodeURIComponent(text) : "";
  const primaryUrl = `https://wa.me/${WHATSAPP_NUMBER_E164}${encoded ? `?text=${encoded}` : ""}`;
  const fallbackUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER_E164}${encoded ? `&text=${encoded}` : ""}`;

  // Some mobile browsers / in-app webviews block popups (window.open).
  // Also, using `noopener` in the window features string can make some browsers
  // return `null` *even when the tab successfully opens*, which caused a double-open
  // when we also triggered the fallback navigation.
  //
  // Strategy:
  // - Try opening a new tab without `noopener` features (so we reliably get a handle)
  // - Immediately sever `opener` to keep it safe
  // - Only fall back to same-tab navigation if the popup was truly blocked
  const popup = window.open(primaryUrl, "_blank");
  if (popup && !popup.closed) {
    try {
      popup.opener = null;
    } catch {
      // Ignore cross-origin access errors
    }
    return;
  }

  // If blocked, use same tab. api.whatsapp.com tends to work better in some webviews.
  window.location.href = fallbackUrl;
}

// ===========================
// CTA Button Interactions
// ===========================
const ctaButtons = document.querySelectorAll(".cta-button");

ctaButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    // Add ripple effect
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.className = "ripple";
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.6)";
    ripple.style.pointerEvents = "none";
    ripple.style.animation = "ripple-animation 0.6s ease-out";

    button.style.position = "relative";
    button.style.overflow = "hidden";
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);

    // Navigate to the right section based on CTA label
    const label = (button.textContent || "").trim().toLowerCase();

    // Hero CTA: go to Packages
    if (label.includes("mulai proyek")) {
      const packagesSection = document.getElementById("packages");
      if (packagesSection) scrollToSectionWithOffset(packagesSection);
      return;
    }

    // Consultation CTA: go to Contact
    if (label.includes("konsultasi")) {
      // If it's the primary consultation CTA, go straight to WhatsApp
      if (
        label.includes("konsultasi gratis") ||
        label.includes("mulai konsultasi")
      ) {
        const waTemplate = [
          "Halo Kaizen Web Studio, saya ingin konsultasi gratis.",
          "",
          "Detail singkat:",
          "- Nama:",
          "- Jenis kebutuhan (Website / Sistem / Maintenance):",
          "- Bidang usaha:",
          "- Target/tujuan:",
          "- Deadline:",
          "- Budget (opsional):",
          "",
          "Terima kasih.",
        ].join("\n");

        openWhatsAppChat(waTemplate);
        showNotification("Membuka WhatsApp untuk konsultasi...", "success");
        return;
      }

      // Otherwise, just scroll to Contact section
      const contactSection = document.getElementById("contact");
      if (contactSection) scrollToSectionWithOffset(contactSection);
    }
  });
});

// ===========================
// Intersection Observer for Animations
// ===========================
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.setProperty("--reveal-y", "0px");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe cards and elements
document
  .querySelectorAll(
    ".philosophy-card, .service-card, .package-card, .benefit-item, .timeline-item, .case-study-card",
  )
  .forEach((el) => {
    el.style.opacity = "0";
    el.style.setProperty("--reveal-y", "20px");
    observer.observe(el);
  });

// ===========================
// Packages Interactions
// ===========================
const packageCards = document.querySelectorAll(".package-card");

// ===========================
// Card Interactions (Spotlight + Tilt)
// ===========================
const prefersReducedMotion = window.matchMedia?.(
  "(prefers-reduced-motion: reduce)",
)?.matches;
const supportsHover = window.matchMedia?.(
  "(hover: hover) and (pointer: fine)",
)?.matches;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function attachScrambleText(el, { duration = 520 } = {}) {
  if (!el || prefersReducedMotion || !supportsHover) return;

  const original = (el.textContent || "").trim();
  if (!original) return;

  const chars = "KAIZENWEBSTUDIO0123456789";
  let running = false;

  el.addEventListener("pointerenter", () => {
    if (running) return;
    running = true;

    const start = performance.now();

    const frame = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const revealCount = Math.floor(p * original.length);

      let out = "";
      for (let i = 0; i < original.length; i++) {
        const ch = original[i];
        if (ch === " ") {
          out += " ";
          continue;
        }
        if (i < revealCount) {
          out += ch;
        } else {
          out += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      el.textContent = out;
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = original;
        running = false;
      }
    };

    requestAnimationFrame(frame);
  });
}

// ===========================
// Hero Visual Parallax
// ===========================
(() => {
  if (prefersReducedMotion || !supportsHover) return;
  const heroVisual = document.querySelector(".hero-visual");
  if (!heroVisual) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let lastMoveAt = performance.now();

  const tick = (now) => {
    const idleFor = now - lastMoveAt;
    const isIdle = idleFor > 1100;

    if (isIdle) {
      // Gentle ambient drift when idle
      targetX = Math.sin(now / 1100) * 8;
      targetY = Math.cos(now / 1300) * 6;
    }

    currentX = lerp(currentX, targetX, 0.12);
    currentY = lerp(currentY, targetY, 0.12);

    heroVisual.style.setProperty("--hx", `${currentX.toFixed(2)}px`);
    heroVisual.style.setProperty("--hy", `${currentY.toFixed(2)}px`);

    requestAnimationFrame(tick);
  };

  heroVisual.addEventListener("pointermove", (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width ? x / rect.width - 0.5 : 0;
    const cy = rect.height ? y / rect.height - 0.5 : 0;

    // Small values so it feels premium, not gimmicky
    targetX = cx * 22;
    targetY = cy * 18;
    lastMoveAt = performance.now();
  });

  heroVisual.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
    lastMoveAt = performance.now();
  });

  requestAnimationFrame(tick);
})();

// Hero background spotlight that follows the pointer
(() => {
  if (prefersReducedMotion) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const updateSpot = (e, opacity) => {
    const rect = hero.getBoundingClientRect();
    const x = rect.width ? ((e.clientX - rect.left) / rect.width) * 100 : 50;
    const y = rect.height ? ((e.clientY - rect.top) / rect.height) * 100 : 50;
    hero.style.setProperty("--hero-spot-x", `${x.toFixed(2)}%`);
    hero.style.setProperty("--hero-spot-y", `${y.toFixed(2)}%`);
    hero.style.setProperty("--hero-spot-opacity", opacity);
  };

  hero.addEventListener("pointerenter", (e) => updateSpot(e, "0.14"));
  hero.addEventListener("pointermove", (e) => updateSpot(e, "0.14"));
  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-spot-opacity", "0");
  });
})();

// Hero wave ripple + letter wobble
(() => {
  if (prefersReducedMotion) return;
  const hero = document.querySelector(".hero");
  const waveLayer = hero?.querySelector(".hero-wave-layer");
  const title = hero?.querySelector(".hero-title");
  if (!hero || !waveLayer || !title) return;

  // Split title into word & letter spans to prevent mid-word wrapping
  // while still allowing the wobble effect on individual characters.
  const wrapLetters = (el) => {
    const text = (el.textContent || "").trim();
    const words = text.split(" ");
    const frag = document.createDocumentFragment();

    words.forEach((word, wordIdx) => {
      const wordWrapper = document.createElement("span");
      wordWrapper.style.display = "inline-block";
      wordWrapper.style.whiteSpace = "nowrap";

      for (const ch of word) {
        const span = document.createElement("span");
        span.textContent = ch;
        span.className = "hero-letter";
        wordWrapper.appendChild(span);
      }

      frag.appendChild(wordWrapper);

      // Add space between words
      if (wordIdx < words.length - 1) {
        frag.appendChild(document.createTextNode(" "));
      }
    });

    el.textContent = "";
    el.appendChild(frag);
  };

  wrapLetters(title);
  const letters = Array.from(title.querySelectorAll(".hero-letter"));

  let rafId = 0;
  const influence = 240; // px radius for letter wobble

  const onMove = (e) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;

      const rect = hero.getBoundingClientRect();
      const x = rect.width ? ((e.clientX - rect.left) / rect.width) * 100 : 50;
      const y = rect.height ? ((e.clientY - rect.top) / rect.height) * 100 : 50;

      hero.style.setProperty("--wave-x", `${x.toFixed(2)}%`);
      hero.style.setProperty("--wave-y", `${y.toFixed(2)}%`);
      hero.style.setProperty("--wave-scale", "1.18");
      hero.style.setProperty("--wave-opacity", "0.36");

      letters.forEach((span) => {
        const b = span.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > influence) {
          span.style.transform = "translateY(0px) scale(1)";
          return;
        }
        const strength = 1 - dist / influence;
        const lift = strength * 12;
        const scale = 1 + strength * 0.06;
        span.style.transform = `translateY(${-lift.toFixed(2)}px) scale(${scale.toFixed(3)})`;
      });
    });
  };

  const resetWave = () => {
    hero.style.setProperty("--wave-scale", "1");
    hero.style.setProperty("--wave-opacity", "0");
    letters.forEach(
      (span) => (span.style.transform = "translateY(0px) scale(1)"),
    );
  };

  hero.addEventListener("pointerenter", onMove);
  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", resetWave);
})();

// Hero scroll responsiveness (parallax + fading glow)
(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const heroVisual = hero.querySelector(".hero-visual");
  const heroContent = hero.querySelector(".hero-content");
  let ticking = false;

  const update = () => {
    ticking = false;
    const scrollY = window.scrollY || 0;
    const heroHeight = hero.offsetHeight || 1;
    const progress = Math.min(1, Math.max(0, scrollY / heroHeight));

    const visualOffset = progress * 26; // push visual down slightly
    const contentOffset = -progress * 18; // lift text a bit

    hero.style.setProperty(
      "--wave-opacity",
      (0.36 * (1 - progress)).toFixed(3),
    );
    hero.style.setProperty(
      "--hero-spot-opacity",
      (0.14 * (1 - progress * 0.85)).toFixed(3),
    );

    if (heroVisual) {
      heroVisual.style.setProperty(
        "--hero-scroll-y",
        `${visualOffset.toFixed(2)}px`,
      );
    }

    if (heroContent) {
      heroContent.style.setProperty(
        "--hero-content-translate",
        `${contentOffset.toFixed(2)}px`,
      );
      heroContent.style.setProperty(
        "--hero-content-opacity",
        `${(1 - progress * 0.4).toFixed(3)}`,
      );
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  update();
})();

// CTA section glow + reveal on scroll
(() => {
  if (prefersReducedMotion) return;
  const cta = document.querySelector(".cta-section");
  if (!cta) return;

  const container = cta.querySelector(".container");
  const button = cta.querySelector(".cta-button-dark");
  const heading = cta.querySelector("h2");

  const updateSpot = (e, opacity = 0.28) => {
    const rect = cta.getBoundingClientRect();
    const xPct = rect.width ? ((e.clientX - rect.left) / rect.width) * 100 : 50;
    const yPct = rect.height
      ? ((e.clientY - rect.top) / rect.height) * 100
      : 50;
    cta.style.setProperty("--cta-spot-x", `${xPct.toFixed(2)}%`);
    cta.style.setProperty("--cta-spot-y", `${yPct.toFixed(2)}%`);
    cta.style.setProperty("--cta-spot-opacity", opacity.toFixed(2));

    if (button) {
      const bx = (xPct - 50) / 50;
      const by = (yPct - 50) / 50;
      const lift = -(by * 6);
      const scale = 1 + Math.max(Math.abs(bx), Math.abs(by)) * 0.03;
      button.style.setProperty("--cta-btn-ty", `${lift.toFixed(2)}px`);
      button.style.setProperty("--cta-btn-scale", `${scale.toFixed(3)}`);
    }
  };

  const resetSpot = () => {
    cta.style.setProperty("--cta-spot-opacity", "0");
    if (button) {
      button.style.setProperty("--cta-btn-ty", "0px");
      button.style.setProperty("--cta-btn-scale", "1");
    }
  };

  cta.addEventListener("pointerenter", (e) => updateSpot(e, 0.3));
  cta.addEventListener("pointermove", (e) => updateSpot(e, 0.3));
  cta.addEventListener("pointerleave", resetSpot);

  if (container) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          const translate = visible ? "0px" : "20px";
          const opacity = visible ? "1" : "0.65";
          container.style.setProperty("--cta-translate", translate);
          container.style.setProperty("--cta-opacity", opacity);

          if (visible && heading) {
            attachScrambleText(heading, { duration: 480 });
            obs.unobserve(container);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(container);
  }
})();

// Global scroll direction tracker (works both up and down)
(() => {
  let lastY = window.scrollY || 0;
  let ticking = false;

  const applyDirection = () => {
    ticking = false;
    const y = window.scrollY || 0;
    const dir = y > lastY ? "down" : "up";
    if (document.body.dataset.scrollDirection !== dir) {
      document.body.dataset.scrollDirection = dir;
    }
    lastY = y;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyDirection);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
})();

// Premium micro-interaction for hero visual text blocks
document.querySelectorAll(".hero-visual .visual-text").forEach((el) => {
  attachScrambleText(el, { duration: 520 });
});

// ===========================
// Hero Ambient Motion (always-on subtle movement)
// ===========================
(() => {
  if (prefersReducedMotion) return;
  const heroVisual = document.querySelector(".hero-visual");
  if (!heroVisual) return;

  const visuals = Array.from(heroVisual.querySelectorAll(".visual-element"));
  const emblem = heroVisual.querySelector(".hero-emblem");
  if (!visuals.length && !emblem) return;

  // Per-element motion params
  const params = visuals.map((el, idx) => {
    const base = 8 + idx * 3;
    return {
      el,
      ax: base,
      ay: base * 0.75,
      sx: 900 + idx * 260,
      sy: 1100 + idx * 320,
      rot: 0.6 + idx * 0.25,
    };
  });

  const start = performance.now();
  const tick = (now) => {
    const t = now - start;

    for (const p of params) {
      const x = Math.sin(t / p.sx) * p.ax;
      const y = Math.cos(t / p.sy) * p.ay;
      const r = Math.sin(t / (p.sx * 1.4)) * p.rot;
      p.el.style.setProperty("--fx", `${x.toFixed(2)}px`);
      p.el.style.setProperty("--fy", `${y.toFixed(2)}px`);
      p.el.style.setProperty("--r", `${r.toFixed(2)}deg`);
    }

    if (emblem) {
      const ex = Math.sin(t / 1200) * 5;
      const ey = Math.cos(t / 1500) * 4;
      emblem.style.setProperty("--efx", `${ex.toFixed(2)}px`);
      emblem.style.setProperty("--efy", `${ey.toFixed(2)}px`);
    }

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
})();

function enableSpotlightTilt(card, { maxTilt = 8 } = {}) {
  if (!card || prefersReducedMotion || !supportsHover) return;

  let rafId = 0;
  let lastEvent = null;

  const update = () => {
    rafId = 0;
    if (!lastEvent) return;

    const rect = card.getBoundingClientRect();
    const x = lastEvent.clientX - rect.left;
    const y = lastEvent.clientY - rect.top;

    const nx = rect.width ? (x / rect.width) * 2 - 1 : 0;
    const ny = rect.height ? (y / rect.height) * 2 - 1 : 0;

    card.style.setProperty("--spot-x", `${x}px`);
    card.style.setProperty("--spot-y", `${y}px`);
    card.style.setProperty("--ry", `${(nx * maxTilt).toFixed(2)}deg`);
    card.style.setProperty("--rx", `${(-ny * maxTilt).toFixed(2)}deg`);
  };

  const onMove = (e) => {
    lastEvent = e;
    if (rafId) return;
    rafId = requestAnimationFrame(update);
  };

  const onLeave = () => {
    lastEvent = null;
    card.style.removeProperty("--spot-x");
    card.style.removeProperty("--spot-y");
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerleave", onLeave);
}

document
  .querySelectorAll(
    ".philosophy-card, .service-card, .package-card, .benefit-item, .timeline-item, .case-study-card",
  )
  .forEach((card) => {
    enableSpotlightTilt(card, {
      maxTilt: card.classList.contains("benefit-item") ? 6 : 8,
    });
  });

// ===========================
// Contact Interactions (Spotlight + Copy)
// ===========================
(() => {
  const contactDetails = document.querySelector(".contact-details");
  if (!contactDetails) return;

  // Spotlight follow on the whole contact card
  if (!prefersReducedMotion) {
    let rafId = 0;
    let lastEvent = null;

    const update = () => {
      rafId = 0;
      if (!lastEvent) return;

      const rect = contactDetails.getBoundingClientRect();
      const x = lastEvent.clientX - rect.left;
      const y = lastEvent.clientY - rect.top;
      contactDetails.style.setProperty("--spot-x", `${x}px`);
      contactDetails.style.setProperty("--spot-y", `${y}px`);
    };

    const onMove = (e) => {
      lastEvent = e;
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    contactDetails.addEventListener("pointerenter", () => {
      contactDetails.classList.add("is-interactive");
    });
    contactDetails.addEventListener("pointermove", onMove);
    contactDetails.addEventListener("pointerleave", () => {
      lastEvent = null;
      contactDetails.classList.remove("is-interactive");
      contactDetails.style.removeProperty("--spot-x");
      contactDetails.style.removeProperty("--spot-y");
    });
  }

  const canCopy = !!navigator.clipboard?.writeText;
  const items = Array.from(document.querySelectorAll(".contact-item"));

  const triggerActive = (item) => {
    item.classList.add("is-active");
    window.setTimeout(() => item.classList.remove("is-active"), 450);
  };

  const copyItemValue = async (item) => {
    const valueEl = item.querySelector(".contact-value");
    const raw = (valueEl?.textContent || "").trim();
    if (!raw) return;

    if (!canCopy) {
      showNotification("Browser tidak mendukung copy otomatis.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(raw);
      showNotification(`Disalin: ${raw}`, "success");
    } catch {
      showNotification("Gagal menyalin. Coba salin manual.", "error");
    }
  };

  items.forEach((item) => {
    // Make keyboard-focusable without changing HTML
    item.tabIndex = 0;
    item.setAttribute("role", "button");

    item.addEventListener("click", async (e) => {
      triggerActive(item);
      // If user clicks the actual link, let it navigate and don't hijack.
      if (e.target.closest("a")) return;
      await copyItemValue(item);
    });

    item.addEventListener("pointermove", (e) => {
      if (prefersReducedMotion || !supportsHover) return;
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      item.style.setProperty("--spot-x", `${x}px`);
      item.style.setProperty("--spot-y", `${y}px`);
    });

    item.addEventListener("pointerleave", () => {
      item.style.removeProperty("--spot-x");
      item.style.removeProperty("--spot-y");
    });

    item.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      triggerActive(item);
      await copyItemValue(item);
    });
  });
})();

function scrollToSectionWithOffset(sectionEl) {
  if (!sectionEl) return;
  const offsetTop = sectionEl.offsetTop - 80;
  window.scrollTo({ top: offsetTop, behavior: "smooth" });
}

// ===========================
// Page Loader (entry animation)
// ===========================
(() => {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;

  const inner = loader.querySelector(".loader-inner");
  const skipBtn = loader.querySelector(".loader-skip");
  // ensure loader does not cover navbar so navbar remains white during load
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    const nbRect = navbar.getBoundingClientRect();
    // position loader below navbar
    loader.style.top = `${Math.round(nbRect.height)}px`;
    loader.style.height = `calc(100% - ${Math.round(nbRect.height)}px)`;
    // allow pointer events on nav while loader blocks rest
    loader.style.pointerEvents = "auto";
  }
  const MIN_VISIBLE_MS = 750;
  const MAX_FALLBACK_MS = 4200;
  const prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  // mark loader active and block scroll until exit begins
  document.body.classList.add("loader-active", "block-scroll");
  const start = performance.now();

  const hide = (fast = false) => {
    if (loader.classList.contains("exiting")) return;
    // allow user to scroll during the end transition
    document.body.classList.remove("block-scroll");
    // let pointer events pass through so user can interact/scroll during animation
    try {
      loader.style.pointerEvents = "none";
    } catch {}
    // Use a balanced default duration: normal ~900ms, fast (skip) ~420ms
    const duration = fast ? 420 : 900;
    const innerRect = inner?.getBoundingClientRect();
    const targetEl =
      document.querySelector(".hero .hero-title") ||
      document.querySelector(".hero");

    // Prepare exit: compute transform toward target element for contextual reveal
    if (targetEl && innerRect) {
      // Curtain-open effect: two panels slide outward like theater curtains
      const panels =
        loader.querySelector(".curtain-panels") ||
        document.createElement("div");
      if (!loader.querySelector(".curtain-panels")) {
        panels.className = "curtain-panels";
        const left = document.createElement("div");
        left.className = "curtain-panel curtain-left";
        const right = document.createElement("div");
        right.className = "curtain-panel curtain-right";
        panels.appendChild(left);
        panels.appendChild(right);
        loader.appendChild(panels);
      }

      // set duration and trigger curtain opening
      loader.style.setProperty("--curtain-duration", `${duration}ms`);
      loader.classList.add("curtain");

      // pre-fade inner so panels don't feel crowded
      loader.classList.add("pre-fade");

      // reveal page content immediately (so it can paint underneath while panels move)
      document.body.classList.remove("content-hidden");

      // trigger open on next frame (panels will slide outward while overlay background becomes transparent)
      requestAnimationFrame(() => loader.classList.add("opening"));

      // cleanup after animation completes
      const total = duration + 120;
      setTimeout(() => {
        document.body.classList.remove("loader-active", "block-scroll");
        const pc = loader.querySelector(".curtain-panels");
        if (pc) pc.remove();
        if (document.body.contains(loader)) {
          loader.classList.add("hidden");
          loader.setAttribute("aria-hidden", "true");
          try {
            loader.remove();
          } catch {}
        }
      }, total + 60);

      return;
    }

    // Fallback: simple exit
    loader.classList.add("exiting");
    // reveal content and then remove loader
    setTimeout(() => {
      document.body.classList.remove("content-hidden");
    }, 80);
    setTimeout(() => {
      document.body.classList.remove("loader-active", "block-scroll");
    }, 180);
    setTimeout(() => {
      if (!loader.classList.contains("hidden")) {
        loader.classList.add("hidden");
        loader.setAttribute("aria-hidden", "true");
        try {
          loader.remove();
        } catch {}
      }
    }, duration + 20);
  };

  const onLoad = () => {
    const waited = performance.now() - start;
    const remain = Math.max(0, MIN_VISIBLE_MS - waited);
    setTimeout(() => hide(false), remain);
  };

  // Skip control
  skipBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    hide(true);
  });
  const onKey = (e) => {
    if (e.key === "Escape" || e.key === "Enter") {
      hide(true);
      window.removeEventListener("keydown", onKey);
    }
  };
  window.addEventListener("keydown", onKey);

  // Allow subtle parallax on pointer move while loader visible
  if (!prefersReducedMotion && inner) {
    inner.style.transition = "transform 300ms cubic-bezier(.2,.8,.2,1)";
    loader.addEventListener("pointermove", (e) => {
      const rect = loader.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
      inner.style.transform = `translate3d(${nx.toFixed(1)}px, ${ny.toFixed(1)}px, 0)`;
    });
    loader.addEventListener("pointerleave", () => {
      inner.style.transform = "";
    });
  }

  // Hide after page fully loaded or fallback timeout
  window.addEventListener("load", onLoad, { once: true });
  setTimeout(() => {
    if (document.body.contains(loader)) hide(false);
  }, MAX_FALLBACK_MS);
})();

function selectPackage(card, { scrollToContact = true } = {}) {
  if (!card) return;

  packageCards.forEach((c) => c.classList.remove("is-selected"));
  card.classList.add("is-selected");

  const selectedName = card.dataset.package || "Paket";
  const selectedPrice = card.dataset.price || "";
  const contactSection = document.getElementById("contact");

  if (scrollToContact && contactSection) {
    scrollToSectionWithOffset(contactSection);
  }

  showNotification(`Paket ${selectedName} dipilih.`, "success");
}

packageCards.forEach((card) => {
  // Click anywhere on card to select (without forcing scroll)
  card.addEventListener("click", (e) => {
    if (e.target.closest("button, a, input, textarea, select")) return;
    selectPackage(card, { scrollToContact: false });
    openPackageOrderModal({
      packageName: card?.dataset?.package || "Paket",
      packagePrice: card?.dataset?.price || "",
    });
  });
});

document.querySelectorAll("[data-package-select]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".package-card");
    selectPackage(card, { scrollToContact: false });
    openPackageOrderModal({
      packageName:
        card?.dataset?.package || btn.dataset.packageSelect || "Paket",
      packagePrice: card?.dataset?.price || "",
    });
  });
});

// ===========================
// Package Order Modal
// ===========================
let selectedPackageForOrder = { name: "Paket", price: "" };

function isValidEmail(value) {
  const email = (value || "").trim();
  if (!email) return false;
  // Simple, pragmatic email check (HTML5 validation still applies)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function openPackageOrderModal({ packageName, packagePrice } = {}) {
  const overlay = document.getElementById("packageModal");
  const title = document.getElementById("packageModalTitle");
  const subtitle = document.getElementById("packageModalSubtitle");
  const summaryValue = document.getElementById("orderPackageValue");
  const form = document.getElementById("packageOrderForm");
  const nameInput = document.getElementById("orderName");
  const emailInput = document.getElementById("orderEmail");
  const companyInput = document.getElementById("orderCompany");
  const pkgNameInput = document.getElementById("orderPackageName");
  const pkgPriceInput = document.getElementById("orderPackagePrice");

  if (
    !overlay ||
    !title ||
    !subtitle ||
    !summaryValue ||
    !form ||
    !nameInput ||
    !emailInput ||
    !companyInput ||
    !pkgNameInput ||
    !pkgPriceInput
  )
    return;

  selectedPackageForOrder = {
    name: (packageName || "Paket").trim(),
    price: (packagePrice || "").trim(),
  };

  title.textContent = `Pesan Paket ${selectedPackageForOrder.name}`;
  subtitle.textContent = selectedPackageForOrder.price
    ? `Paket: ${selectedPackageForOrder.name} (${selectedPackageForOrder.price})`
    : `Paket: ${selectedPackageForOrder.name}`;

  summaryValue.textContent = selectedPackageForOrder.price
    ? `${selectedPackageForOrder.name} (${selectedPackageForOrder.price})`
    : `${selectedPackageForOrder.name}`;

  pkgNameInput.value = selectedPackageForOrder.name;
  pkgPriceInput.value = selectedPackageForOrder.price;

  // Reset form state
  form.reset();
  [nameInput, emailInput, companyInput].forEach((el) =>
    el.classList.remove("is-invalid"),
  );

  overlay.hidden = false;
  document.body.style.overflow = "hidden";

  // Focus the first field
  window.setTimeout(() => nameInput.focus(), 50);
}

function closePackageOrderModal() {
  const overlay = document.getElementById("packageModal");
  if (!overlay) return;
  overlay.hidden = true;
  document.body.style.overflow = "";
}

(() => {
  const overlay = document.getElementById("packageModal");
  const closeBtn = document.getElementById("packageModalClose");
  const form = document.getElementById("packageOrderForm");
  const nameInput = document.getElementById("orderName");
  const emailInput = document.getElementById("orderEmail");
  const companyInput = document.getElementById("orderCompany");

  if (
    !overlay ||
    !closeBtn ||
    !form ||
    !nameInput ||
    !emailInput ||
    !companyInput
  )
    return;

  // Ensure modal is hidden on load (some CSS rules may override UA styles)
  overlay.hidden = true;

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePackageOrderModal();
  });

  overlay.addEventListener("click", (e) => {
    // Click outside modal closes
    if (e.target && e.target === overlay) closePackageOrderModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) {
      closePackageOrderModal();
    }
  });

  const markInvalid = (el, isInvalid) => {
    el.classList.toggle("is-invalid", isInvalid);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = sanitizeWhatsAppSingleLine(nameInput.value);
    const email = sanitizeWhatsAppSingleLine(emailInput.value).toLowerCase();
    const company = sanitizeWhatsAppSingleLine(companyInput.value);

    const nameOk = name.length >= 2;
    const emailOk = isValidEmail(email);

    markInvalid(nameInput, !nameOk);
    markInvalid(emailInput, !emailOk);

    if (!nameOk || !emailOk) {
      showNotification("Mohon isi Nama dan Email dengan benar.", "error");
      return;
    }

    const pkgName = sanitizeWhatsAppSingleLine(
      document.getElementById("orderPackageName")?.value ||
        selectedPackageForOrder.name ||
        "Paket",
    );
    const pkgPrice = sanitizeWhatsAppSingleLine(
      document.getElementById("orderPackagePrice")?.value ||
        selectedPackageForOrder.price ||
        "",
    );
    const pkgLine = pkgPrice ? `${pkgName} (${pkgPrice})` : `${pkgName}`;

    const waMessage = [
      "Halo Kaizen Web Studio,",
      "",
      "Saya ingin pemesanan / konsultasi untuk:",
      `Paket: ${pkgLine}`,
      "",
      "Data pemesan:",
      `- Nama: ${name}`,
      `- Email: ${email}`,
      `- Perusahaan: ${company || "-"}`,
      "",
      "Info tambahan (opsional, boleh diisi):",
      "- Jenis website/sistem yang dibutuhkan:",
      "- Target/tujuan:",
      "- Deadline:",
      "- Budget (opsional):",
      "- Referensi (opsional):",
      "",
      "Mohon info langkah selanjutnya ya. Terima kasih.",
    ].join("\n");

    closePackageOrderModal();
    openWhatsAppChat(waMessage);
    showNotification("Membuka WhatsApp untuk pemesanan...", "success");
  });
})();

// ===========================
// Scroll Progress Indicator
// ===========================
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  // You can use this for a progress bar if needed
  // Update navbar styling on scroll
  const navbar = document.querySelector(".navbar");
  if (scrollTop > 50) {
    navbar.style.boxShadow = "var(--shadow-md)";
  } else {
    navbar.style.boxShadow = "var(--shadow-sm)";
  }
});

// ===========================
// Smooth Scroll Offset for Anchor Links
// ===========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href !== "#") {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offsetTop = target.offsetTop - 80; // Account for navbar height
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    }
  });
});

// ===========================
// Notification System
// ===========================
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        ${
          type === "success"
            ? "background-color: #10b981; color: white;"
            : "background-color: #ef4444; color: white;"
        }
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// ===========================
// Email Link (mailto) Fallback
// ===========================
(() => {
  const emailLink = document.querySelector(".email-link");
  if (!emailLink) return;

  emailLink.addEventListener("click", (e) => {
    // Let the browser try mailto first
    const mailtoUrl = emailLink.getAttribute("href");
    if (!mailtoUrl || !mailtoUrl.toLowerCase().startsWith("mailto:")) return;

    // Some in-app browsers block mailto navigation; fallback to Gmail web compose.
    // We can't reliably detect if mail app opened, but visibility change is a decent signal.
    let didHide = false;
    const onVis = () => {
      if (document.visibilityState === "hidden") didHide = true;
    };

    document.addEventListener("visibilitychange", onVis, { once: true });

    // Ensure we trigger navigation from this click gesture.
    // (No preventDefault here; but force assignment helps some webviews.)
    window.location.href = mailtoUrl;

    setTimeout(() => {
      document.removeEventListener("visibilitychange", onVis);
      if (didHide) return;

      const to = "kaizen.webstudio11@gmail.com";
      const subject = "Pemesanan / Konsultasi - Kaizen Web Studio";
      const body = [
        "Halo Kaizen Web Studio,",
        "",
        "Saya ingin konsultasi / pemesanan dengan detail berikut:",
        "",
        "- Nama:",
        "- Email:",
        "- Perusahaan (opsional):",
        "- Paket yang diminati (Starter / Business / Custom):",
        "- Ringkasan kebutuhan:",
        "- Target/tujuan:",
        "- Deadline:",
        "- Budget (opsional):",
        "- Referensi (desain/website) (opsional):",
        "",
        "Terima kasih.",
      ].join("\n");

      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = gmailComposeUrl;
    }, 900);
  });
})();

// ===========================
// Add CSS Animations
// ===========================
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Counter Animation for Stats
// ===========================
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 30;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 30);
}

// ===========================
// Initialize on Page Load
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Kaizen Web Studio loaded successfully");

  // Add loading state
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.opacity = "1";
    document.body.style.transition = "opacity 0.5s ease-in";
  }, 100);
});

// ===========================
// Keyboard Navigation
// ===========================
document.addEventListener("keydown", (e) => {
  // Close mobile menu on Escape
  if (e.key === "Escape") {
    navLinks.classList.remove("active");
    const spans = menuToggle.querySelectorAll("span");
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  }

  // Navigate with Tab for accessibility
  if (e.key === "Tab") {
    const focusedElement = document.activeElement;
    if (focusedElement.classList.contains("cta-button")) {
      focusedElement.style.outline = "2px solid #2563eb";
    }
  }
});

console.log("[v0] Kaizen Web Studio - JavaScript initialized");
