document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteHeader = document.querySelector("#site-header");
const menuToggle = document.querySelector("#menu-toggle");
const primaryMenu = document.querySelector("#primary-menu");
const backToTop = document.querySelector("#back-to-top");

function updateScrollState() {
    const isScrolled = window.scrollY > 12;

    siteHeader?.classList.toggle("is-scrolled", isScrolled);
    backToTop?.classList.toggle("is-visible", window.scrollY > 560);
}

function closeMobileMenu() {
    if (!menuToggle || !primaryMenu) {
        return;
    }

    menuToggle.classList.remove("is-open");
    primaryMenu.classList.remove("is-open");
    siteHeader?.classList.remove("menu-active");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Mở menu");
}

function openMobileMenu() {
    if (!menuToggle || !primaryMenu) {
        return;
    }

    menuToggle.classList.add("is-open");
    primaryMenu.classList.add("is-open");
    siteHeader?.classList.add("menu-active");
    document.body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Đóng menu");
}

function setupMobileMenu() {
    if (!menuToggle || !primaryMenu) {
        return;
    }

    menuToggle.addEventListener("click", () => {
        if (primaryMenu.classList.contains("is-open")) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    primaryMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        const isMenuOpen = primaryMenu.classList.contains("is-open");
        const clickedInsideHeader = siteHeader?.contains(target);

        if (isMenuOpen && !clickedInsideHeader) {
            closeMobileMenu();
        }
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId.length <= 1) {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });
        });
    });
}

function setupRevealEffects() {
    const revealItems = document.querySelectorAll(".reveal");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14,
        rootMargin: "0px 0px -60px 0px"
    });

    revealItems.forEach((item) => observer.observe(item));
}

function setupImageModal() {
    const modal = document.querySelector("#screenshot-modal");
    const modalImage = document.querySelector("#modal-image");
    const modalTitle = document.querySelector("#modal-title");
    const closeButton = modal?.querySelector(".modal-close");
    const screenshotButtons = document.querySelectorAll("[data-modal-image]");
    let lastFocusedElement = null;

    if (!modal || !modalImage || !modalTitle || !closeButton) {
        return;
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        if (lastFocusedElement instanceof HTMLElement) {
            lastFocusedElement.focus();
        }
    }

    function openModal(button) {
        const imageSrc = button.getAttribute("data-modal-image");
        const imageAlt = button.getAttribute("data-modal-alt") || "";
        const imageTitle = button.getAttribute("data-modal-title") || "Ảnh giao diện Pixora";

        if (!imageSrc) {
            return;
        }

        lastFocusedElement = document.activeElement;
        modalImage.src = imageSrc;
        modalImage.alt = imageAlt;
        modalTitle.textContent = imageTitle;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        closeButton.focus();
    }

    screenshotButtons.forEach((button) => {
        button.addEventListener("click", () => openModal(button));
    });

    modal.addEventListener("click", (event) => {
        const closeTarget = event.target.closest("[data-modal-close]");

        if (closeTarget) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!modal.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            closeModal();
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusableElements = modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) {
            return;
        }

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    });
}

function setupFaqAccordion() {
    const accordion = document.querySelector("[data-accordion]");

    if (!accordion) {
        return;
    }

    const items = Array.from(accordion.querySelectorAll(".faq-item"));
    const buttons = items.map((item) => item.querySelector(".faq-question")).filter(Boolean);

    function setItemState(item, isOpen) {
        const button = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        item.classList.toggle("is-open", isOpen);
        button?.setAttribute("aria-expanded", String(isOpen));
        answer?.setAttribute("aria-hidden", String(!isOpen));
    }

    function openOnly(targetItem) {
        const shouldClose = targetItem.classList.contains("is-open");

        items.forEach((item) => setItemState(item, false));

        if (!shouldClose) {
            setItemState(targetItem, true);
        }
    }

    items.forEach((item) => {
        setItemState(item, item.classList.contains("is-open"));

        const button = item.querySelector(".faq-question");
        button?.addEventListener("click", () => openOnly(item));
    });

    buttons.forEach((button, index) => {
        button.addEventListener("keydown", (event) => {
            let nextIndex = index;

            if (event.key === "ArrowDown") {
                nextIndex = (index + 1) % buttons.length;
            } else if (event.key === "ArrowUp") {
                nextIndex = (index - 1 + buttons.length) % buttons.length;
            } else if (event.key === "Home") {
                nextIndex = 0;
            } else if (event.key === "End") {
                nextIndex = buttons.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            buttons[nextIndex].focus();
        });
    });
}

function setupBackToTop() {
    backToTop?.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth"
        });
    });
}

setupMobileMenu();
setupSmoothScroll();
setupRevealEffects();
setupImageModal();
setupFaqAccordion();
setupBackToTop();
updateScrollState();

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});
