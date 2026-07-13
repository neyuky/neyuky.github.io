const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const heroTitle = document.getElementById("hero-title");
const typedText = document.getElementById("typed-text");

const texts = [
    "Xin chào, mình là Nguyen Vy",
    "Chào mừng đến với hồ sơ cá nhân của mình",
    "Lập trình viên giao diện web",
    "Lập trình sáng tạo",
    "Xây dựng giao diện hiện đại"
];

const closeMenu = () => {
    navMenu.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
};

const setActiveLink = (activeLink) => {
    navLinks.forEach((link) => link.classList.remove("active"));
    activeLink.classList.add("active");
};

const updateHeaderState = () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
};

menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));

        if (!target) {
            return;
        }

        event.preventDefault();
        setActiveLink(link);
        closeMenu();

        const offset = header.offsetHeight + 10;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
            top: targetTop,
            behavior: "smooth"
        });
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
        closeMenu();
    }
});

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

// Intro kiểu gõ mã cho tiêu đề hero.
const highlightTokens = [
    "Nguyen Vy",
    "hồ sơ cá nhân",
    "giao diện web",
    "sáng tạo",
    "giao diện hiện đại"
];

const typingConfig = {
    firstPause: 2300,
    pause: 1450,
    afterDeletePause: 260,
    typeSpeed: 54,
    deleteSpeed: 31
};

const escapeHtml = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatTypedText = (value) => {
    let html = "";
    let index = 0;
    const lowerValue = value.toLowerCase();

    while (index < value.length) {
        const token = highlightTokens.find((item) => {
            const lowerToken = item.toLowerCase();
            const remaining = lowerValue.slice(index);

            return remaining.startsWith(lowerToken)
                || (lowerToken.startsWith(remaining) && remaining.length > 1 && index + remaining.length === value.length);
        });

        if (token) {
            const visiblePart = value.slice(index, Math.min(index + token.length, value.length));
            html += `<span class="typed-highlight">${escapeHtml(visiblePart)}</span>`;
            index += visiblePart.length;
            continue;
        }

        html += escapeHtml(value[index]);
        index += 1;
    }

    return html;
};

const getTypeDelay = (character) => {
    if (character === " ") {
        return typingConfig.typeSpeed + 8;
    }

    if (character === "," || character === "/") {
        return typingConfig.typeSpeed + 48;
    }

    return typingConfig.typeSpeed + (character.charCodeAt(0) % 18);
};

const getDeleteDelay = (character) => typingConfig.deleteSpeed + (character.charCodeAt(0) % 9);

const startHeroTypewriter = () => {
    if (!typedText || !heroTitle) {
        return;
    }

    let textIndex = 0;
    let characterIndex = texts[0].length;
    let phase = "pause";
    let nextStepAt = performance.now() + typingConfig.firstPause;

    const render = () => {
        const currentText = texts[textIndex];
        typedText.innerHTML = formatTypedText(currentText.slice(0, characterIndex));
        heroTitle.setAttribute("aria-label", currentText);
        heroTitle.classList.toggle("is-deleting", phase === "deleting");
    };

    const tick = (now) => {
        if (now >= nextStepAt) {
            const currentText = texts[textIndex];

            if (phase === "pause") {
                phase = "deleting";
                nextStepAt = now + typingConfig.deleteSpeed;
            } else if (phase === "deleting") {
                characterIndex -= 1;

                if (characterIndex <= 0) {
                    characterIndex = 0;
                    phase = "switching";
                    nextStepAt = now + typingConfig.afterDeletePause;
                } else {
                    nextStepAt = now + getDeleteDelay(currentText[characterIndex]);
                }
            } else if (phase === "switching") {
                textIndex = (textIndex + 1) % texts.length;
                phase = "typing";
                nextStepAt = now + typingConfig.afterDeletePause;
            } else if (phase === "typing") {
                characterIndex += 1;

                if (characterIndex >= currentText.length) {
                    characterIndex = currentText.length;
                    phase = "pause";
                    nextStepAt = now + typingConfig.pause;
                } else {
                    nextStepAt = now + getTypeDelay(currentText[characterIndex]);
                }
            }

            render();
        }

        requestAnimationFrame(tick);
    };

    render();
    requestAnimationFrame(tick);
};

startHeroTypewriter();

// Hiển thị khu vực và thẻ khi chúng đi vào vùng nhìn thấy.
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
    });
}, {
    threshold: 0.16,
    rootMargin: "0px 0px -60px 0px"
});

revealItems.forEach((item, index) => {
    item.style.setProperty("--delay", `${Math.min(index * 45, 260)}ms`);

    if (item.getBoundingClientRect().top < window.innerHeight * 0.92) {
        item.classList.add("visible");
    }

    revealObserver.observe(item);
});

// Đồng bộ trạng thái trình đơn khi cuộn trang.
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) {
            return;
        }

        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);

        if (active) {
            setActiveLink(active);
        }
    });
}, {
    threshold: 0.22,
    rootMargin: "-38% 0px -50% 0px"
});

sections.forEach((section) => sectionObserver.observe(section));
