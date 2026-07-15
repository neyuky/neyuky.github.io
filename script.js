const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const heroTitle = document.getElementById("hero-title");
const typedText = document.getElementById("typed-text");
const musicCard = document.getElementById("music-card");
const musicExpandToggle = document.getElementById("music-expand-toggle");
const musicCollapseToggle = document.getElementById("music-collapse-toggle");
const musicToggle = document.getElementById("music-toggle");
const musicProgress = document.getElementById("music-progress");
const musicProgressFill = document.getElementById("music-progress-fill");
const musicCurrentTime = document.getElementById("music-current-time");
const musicDuration = document.getElementById("music-duration");
const musicStatus = document.getElementById("music-status");
const soundCloudPlayer = document.getElementById("soundcloud-player");

const initAmbientParticles = () => {
    const canvas = document.getElementById("ambient-particles");
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !context) {
        return;
    }

    const dotColors = [
        { r: 99, g: 102, b: 241, max: 0.44 },
        { r: 59, g: 130, b: 246, max: 0.40 },
        { r: 168, g: 85, b: 247, max: 0.38 },
        { r: 6, g: 182, b: 212, max: 0.34 },
        { r: 255, g: 255, b: 255, max: 0.48 }
    ];
    const blobColors = [
        { r: 99, g: 102, b: 241, max: 0.13 },
        { r: 59, g: 130, b: 246, max: 0.11 },
        { r: 168, g: 85, b: 247, max: 0.11 },
        { r: 6, g: 182, b: 212, max: 0.10 },
        { r: 255, g: 255, b: 255, max: 0.095 }
    ];
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

    let prefersReducedMotion = reducedMotionQuery.matches;
    let particles = [];
    let linePairs = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = null;
    let lastFrame = performance.now();
    let nextLineRefresh = 0;
    let resizeTimer = null;

    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
    const rgba = (color, alpha) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const getClusteredX = () => {
        if (Math.random() > 0.68) {
            return randomBetween(-36, width + 36);
        }

        const clusters = [-0.06, 0.16, 0.42, 0.74, 1.06];
        const center = randomItem(clusters) * width;
        const spread = randomBetween(width * 0.035, width * 0.12);

        return clamp(center + randomBetween(-spread, spread), -44, width + 44);
    };

    const getParticleProfile = () => {
        const total = window.innerWidth <= 640 ? 20 : window.innerWidth <= 1024 ? 35 : 64;
        const adjustedTotal = prefersReducedMotion ? Math.max(4, Math.round(total * 0.2)) : total;
        const sparkleCount = window.innerWidth <= 640 || prefersReducedMotion
            ? 0
            : Math.min(3, Math.max(1, Math.round(adjustedTotal * 0.04)));
        const minBlobCount = window.innerWidth <= 640 ? 1 : 2;
        const blobCount = Math.min(adjustedTotal - sparkleCount, Math.max(minBlobCount, Math.round(adjustedTotal * 0.1)));

        return {
            total: adjustedTotal,
            dots: Math.max(0, adjustedTotal - blobCount - sparkleCount),
            blobs: blobCount,
            sparkles: sparkleCount
        };
    };

    const resetParticle = (particle, type = "dot", startAbove = false) => {
        const isBlob = type === "blob";
        const isSparkle = type === "sparkle";
        const isMobile = window.innerWidth <= 640;
        const color = randomItem(isBlob ? blobColors : dotColors);
        const layerSeed = Math.random();
        const motionSeed = Math.random();
        const layer = isBlob ? "mist" : layerSeed < 0.42 ? "far" : layerSeed < 0.82 ? "middle" : "near";
        const opacityScale = isMobile ? 0.8 : 1;
        const depth = isBlob
            ? randomBetween(0.24, 0.56)
            : layer === "far"
                ? randomBetween(0.22, 0.45)
                : layer === "middle"
                    ? randomBetween(0.46, 0.74)
                    : randomBetween(0.75, 1);
        const layerAlpha = layer === "far" ? randomBetween(0.50, 0.66) : layer === "middle" ? randomBetween(0.70, 0.86) : randomBetween(0.88, 1);
        const floating = !isBlob && motionSeed < 0.10;
        const drifting = !isBlob && motionSeed >= 0.10 && motionSeed < 0.25;
        const rareLarge = !isBlob && !isSparkle && layer === "near" && Math.random() < 0.18;

        particle.type = type;
        particle.color = color;
        particle.layer = layer;
        particle.depth = depth;
        particle.anchorX = getClusteredX();
        particle.y = startAbove ? randomBetween(-height * 0.32, -18) : randomBetween(-20, height + 20);
        particle.size = isBlob
            ? randomBetween(8, 14)
            : isSparkle
                ? randomBetween(3, 5)
                : layer === "far"
                    ? randomBetween(2, 3)
                    : layer === "middle"
                        ? randomBetween(3.4, 5)
                        : rareLarge
                            ? randomBetween(6, 8)
                            : randomBetween(4, 5.8);
        particle.speed = isBlob
            ? randomBetween(0.25, 2.2)
            : floating
                ? randomBetween(0.12, 1.4)
                : layer === "far"
                    ? randomBetween(1.2, 5.2)
                    : layer === "middle"
                        ? randomBetween(5.2, 12)
                        : randomBetween(10, 22);
        particle.driftAmplitude = isBlob
            ? randomBetween(1.2, 4.5)
            : floating
                ? randomBetween(0.3, 1.4)
                : drifting
                    ? randomBetween(4, 7)
                    : randomBetween(0.5, 2.6);
        particle.driftSpeed = isBlob ? randomBetween(0.04, 0.14) : drifting ? randomBetween(0.16, 0.30) : randomBetween(0.04, 0.16);
        particle.phase = randomBetween(0, Math.PI * 2);
        particle.pulse = randomBetween(0, Math.PI * 2);
        particle.angle = randomBetween(0, Math.PI);
        particle.pulseSpeed = isBlob ? randomBetween(0.12, 0.32) : isSparkle ? randomBetween(0.10, 0.24) : randomBetween(0.30, 0.72);
        particle.alphaMin = isBlob
            ? randomBetween(0.020, 0.038) * opacityScale
            : isSparkle
                ? randomBetween(0.14, 0.18) * opacityScale
                : randomBetween(0.16, 0.25) * layerAlpha * opacityScale;
        particle.alphaMax = isBlob
            ? color.max * randomBetween(0.60, 0.88) * opacityScale
            : isSparkle
                ? randomBetween(0.20, 0.32) * opacityScale
                : color.max * layerAlpha * opacityScale;
        particle.glow = isBlob || (!isSparkle && Math.random() < 0.32);
        particle.blur = isBlob ? randomBetween(6, 10) : particle.glow ? randomBetween(4, 8) : randomBetween(0.4, 1.8);

        if (prefersReducedMotion) {
            particle.speed = 0;
            particle.driftAmplitude = 0;
            particle.driftSpeed = 0;
            particle.pulseSpeed = 0;
            particle.alphaMax *= 0.78;
        }

        return particle;
    };

    const createParticles = () => {
        const profile = getParticleProfile();
        const nextParticles = [];
        let index = 0;

        for (; index < profile.dots; index += 1) {
            nextParticles.push(resetParticle(particles[index] || {}, "dot"));
        }

        for (let blobIndex = 0; blobIndex < profile.blobs; blobIndex += 1) {
            nextParticles.push(resetParticle(particles[index + blobIndex] || {}, "blob"));
        }

        index += profile.blobs;

        for (let sparkleIndex = 0; sparkleIndex < profile.sparkles; sparkleIndex += 1) {
            nextParticles.push(resetParticle(particles[index + sparkleIndex] || {}, "sparkle"));
        }

        particles = nextParticles;
        linePairs = [];
        nextLineRefresh = 0;
    };

    const setupCanvas = () => {
        width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        height = window.innerHeight || document.documentElement.clientHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(width * dpr);
        canvas.height = Math.ceil(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        createParticles();

        if (prefersReducedMotion) {
            context.clearRect(0, 0, width, height);
            drawParticles();
        }
    };

    const getDrawPoint = (particle) => ({
        x: particle.anchorX + Math.sin(particle.phase) * particle.driftAmplitude + pointer.x * particle.depth,
        y: particle.y + pointer.y * particle.depth * 0.65
    });

    const refreshConnections = (now) => {
        const dots = particles.filter((particle) => particle.type === "dot");
        const pairCount = Math.min(4, Math.max(1, Math.round(dots.length * 0.04)));
        const nextPairs = [];
        let attempts = 0;

        while (nextPairs.length < pairCount && attempts < pairCount * 18) {
            attempts += 1;
            const first = randomItem(dots);
            const second = randomItem(dots);

            if (!first || !second || first === second) {
                continue;
            }

            const firstPoint = getDrawPoint(first);
            const secondPoint = getDrawPoint(second);
            const distance = Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y);

            if (distance > 172) {
                continue;
            }

            nextPairs.push({
                first,
                second,
                startedAt: now,
                duration: randomBetween(1400, 2800),
                color: Math.random() > 0.48 ? "255, 255, 255" : "99, 102, 241"
            });
        }

        linePairs = nextPairs;
        nextLineRefresh = now + randomBetween(2600, 5200);
    };

    const updateParticles = (delta, now) => {
        pointer.x += (pointer.targetX - pointer.x) * 0.055;
        pointer.y += (pointer.targetY - pointer.y) * 0.055;

        particles.forEach((particle) => {
            particle.y += particle.speed * delta;
            particle.phase += particle.driftSpeed * delta;
            particle.pulse += particle.pulseSpeed * delta;

            if (particle.y - particle.size > height + 28) {
                resetParticle(particle, particle.type, true);
            }
        });

        if (now >= nextLineRefresh && !prefersReducedMotion) {
            refreshConnections(now);
        }
    };

    const drawConnections = (now) => {
        context.save();
        context.lineWidth = 0.8;
        context.shadowBlur = 0;

        linePairs.forEach((pair) => {
            const progress = Math.min((now - pair.startedAt) / pair.duration, 1);
            const alpha = Math.sin(progress * Math.PI) * 0.052;

            if (alpha <= 0 || progress >= 1) {
                return;
            }

            const firstPoint = getDrawPoint(pair.first);
            const secondPoint = getDrawPoint(pair.second);
            context.beginPath();
            context.strokeStyle = `rgba(${pair.color}, ${alpha})`;
            context.moveTo(firstPoint.x, firstPoint.y);
            context.lineTo(secondPoint.x, secondPoint.y);
            context.stroke();
        });

        context.restore();
    };

    const drawParticles = () => {
        context.save();

        particles.forEach((particle) => {
            const pulse = (Math.sin(particle.pulse) + 1) / 2;
            const alpha = particle.alphaMin + (particle.alphaMax - particle.alphaMin) * pulse;
            const scale = particle.type === "sparkle" ? 0.94 + 0.08 * pulse : 0.9 + 0.2 * pulse;
            const point = getDrawPoint(particle);

            if (particle.type === "sparkle") {
                const size = particle.size * scale;

                context.save();
                context.translate(point.x, point.y);
                context.rotate(particle.angle);
                context.strokeStyle = rgba(particle.color, alpha);
                context.lineWidth = 0.8;
                context.shadowBlur = 0;
                context.beginPath();
                context.moveTo(0, -size);
                context.lineTo(0, size);
                context.moveTo(-size, 0);
                context.lineTo(size, 0);
                context.stroke();
                context.beginPath();
                context.fillStyle = rgba(particle.color, alpha * 0.72);
                context.moveTo(0, -size * 0.7);
                context.lineTo(size * 0.32, 0);
                context.lineTo(0, size * 0.7);
                context.lineTo(-size * 0.32, 0);
                context.closePath();
                context.fill();
                context.restore();
                return;
            }

            context.beginPath();
            context.fillStyle = rgba(particle.color, alpha);
            context.shadowBlur = particle.blur;
            context.shadowColor = rgba(particle.color, Math.min(alpha * 0.72, 0.26));
            context.arc(point.x, point.y, particle.size * scale, 0, Math.PI * 2);
            context.fill();
        });

        context.restore();
    };

    const animateParticles = (now) => {
        if (prefersReducedMotion) {
            context.clearRect(0, 0, width, height);
            drawParticles();
            frameId = null;
            return;
        }

        const delta = Math.min((now - lastFrame) / 1000, 0.05);
        lastFrame = now;

        context.clearRect(0, 0, width, height);
        updateParticles(delta, now);
        drawConnections(now);
        drawParticles();

        frameId = requestAnimationFrame(animateParticles);
    };

    const startAnimation = () => {
        if (frameId || document.visibilityState === "hidden") {
            return;
        }

        if (prefersReducedMotion) {
            context.clearRect(0, 0, width, height);
            drawParticles();
            return;
        }

        lastFrame = performance.now();
        frameId = requestAnimationFrame(animateParticles);
    };

    const stopAnimation = () => {
        if (!frameId) {
            return;
        }

        cancelAnimationFrame(frameId);
        frameId = null;
    };

    const handleResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(setupCanvas, 160);
    };

    const handlePointerMove = (event) => {
        if (prefersReducedMotion || !finePointerQuery.matches || width <= 640) {
            return;
        }

        const range = width <= 1024 ? 9 : 15;
        pointer.targetX = ((event.clientX / width) - 0.5) * range;
        pointer.targetY = ((event.clientY / height) - 0.5) * range;
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
            stopAnimation();
            return;
        }

        startAnimation();
    };

    const handleReducedMotionChange = (event) => {
        prefersReducedMotion = event.matches;
        pointer.x = 0;
        pointer.y = 0;
        pointer.targetX = 0;
        pointer.targetY = 0;
        stopAnimation();
        createParticles();

        context.clearRect(0, 0, width, height);
        drawParticles();

        if (!prefersReducedMotion) {
            startAnimation();
        }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    }

    setupCanvas();
    startAnimation();
};

initAmbientParticles();

const initSoundCloudPlayer = () => {
    if (!musicCard || !musicExpandToggle || !musicCollapseToggle || !musicToggle || !musicProgress || !musicProgressFill || !musicCurrentTime || !musicDuration || !musicStatus || !soundCloudPlayer) {
        return;
    }

    const mobilePlayerQuery = window.matchMedia("(max-width: 640px)");
    let widget = null;
    let isReady = false;
    let duration = 0;
    let readyTimeout = null;
    let userChangedPlayerSize = false;

    const setPlayerExpanded = (expanded, userInitiated = false) => {
        if (userInitiated) {
            userChangedPlayerSize = true;
        }

        musicCard.classList.toggle("is-collapsed", !expanded);
        musicExpandToggle.setAttribute("aria-expanded", String(expanded));
        musicCollapseToggle.setAttribute("aria-expanded", String(expanded));
    };

    setPlayerExpanded(!mobilePlayerQuery.matches);

    musicExpandToggle.addEventListener("click", () => {
        setPlayerExpanded(true, true);
    });

    musicCollapseToggle.addEventListener("click", () => {
        setPlayerExpanded(false, true);
    });

    if (typeof mobilePlayerQuery.addEventListener === "function") {
        mobilePlayerQuery.addEventListener("change", (event) => {
            if (!userChangedPlayerSize) {
                setPlayerExpanded(!event.matches);
            }
        });
    } else if (typeof mobilePlayerQuery.addListener === "function") {
        mobilePlayerQuery.addListener((event) => {
            if (!userChangedPlayerSize) {
                setPlayerExpanded(!event.matches);
            }
        });
    }

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.max(0, Math.floor((milliseconds || 0) / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        return `${minutes}:${seconds}`;
    };

    const setStatus = (message, isError = false) => {
        musicStatus.textContent = message;
        musicCard.classList.toggle("has-error", isError);
    };

    const setPlaying = (playing) => {
        musicCard.classList.toggle("is-playing", playing);
        musicToggle.setAttribute("aria-pressed", String(playing));
        musicToggle.setAttribute("aria-label", playing ? "Tạm dừng nhạc" : "Phát nhạc");
    };

    const updateProgress = (currentPosition = 0) => {
        const safeDuration = Math.max(duration, 0);
        const progress = safeDuration > 0 ? Math.min(currentPosition / safeDuration, 1) : 0;

        musicProgressFill.style.width = `${progress * 100}%`;
        musicCurrentTime.textContent = formatTime(currentPosition);
        musicDuration.textContent = formatTime(safeDuration);
    };

    const refreshDuration = () => {
        if (!widget) {
            return;
        }

        widget.getDuration((trackDuration) => {
            duration = Number(trackDuration) || 0;
            updateProgress(0);
        });
    };

    const setReady = () => {
        window.clearTimeout(readyTimeout);
        isReady = true;
        musicCard.classList.add("is-ready");
        musicToggle.disabled = false;
        musicProgress.disabled = false;
        setStatus("Sẵn sàng phát");
        refreshDuration();
    };

    const setLoadError = () => {
        if (isReady) {
            return;
        }

        musicToggle.disabled = true;
        musicProgress.disabled = true;
        setPlaying(false);
        setStatus("Không thể tải bài nhạc", true);
    };

    if (!window.SC || typeof window.SC.Widget !== "function" || !window.SC.Widget.Events) {
        setLoadError();
        return;
    }

    try {
        widget = window.SC.Widget(soundCloudPlayer);
    } catch (_) {
        setLoadError();
        return;
    }

    const widgetEvents = window.SC.Widget.Events;
    readyTimeout = window.setTimeout(setLoadError, 12000);

    widget.bind(widgetEvents.READY, setReady);

    widget.bind(widgetEvents.PLAY, () => {
        setPlaying(true);
        setStatus("Đang phát");
        refreshDuration();
    });

    widget.bind(widgetEvents.PAUSE, () => {
        setPlaying(false);
        if (isReady) {
            setStatus("Đã tạm dừng");
        }
    });

    widget.bind(widgetEvents.FINISH, () => {
        setPlaying(false);
        updateProgress(0);
        widget.seekTo(0);
        setStatus("Sẵn sàng phát lại");
    });

    widget.bind(widgetEvents.PLAY_PROGRESS, (event) => {
        const currentPosition = Number(event?.currentPosition) || (duration * (Number(event?.relativePosition) || 0));
        updateProgress(currentPosition);
    });

    musicToggle.addEventListener("click", () => {
        if (!isReady || !widget) {
            return;
        }

        widget.isPaused((paused) => {
            if (paused) {
                widget.play();
                return;
            }

            widget.pause();
        });
    });

    musicProgress.addEventListener("click", (event) => {
        if (!isReady || !widget || duration <= 0) {
            return;
        }

        const rect = musicProgress.getBoundingClientRect();
        const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const targetPosition = duration * ratio;

        widget.seekTo(targetPosition);
        updateProgress(targetPosition);
    });
};

initSoundCloudPlayer();

const closeMenu = () => {
    if (!navMenu || !menuToggle) {
        return;
    }

    navMenu.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
};

const setActiveLink = (activeLink) => {
    navLinks.forEach((link) => link.classList.remove("active"));
    activeLink.classList.add("active");
};

const updateHeaderState = () => {
    if (!header) {
        return;
    }

    header.classList.toggle("scrolled", window.scrollY > 24);
};

const updateActiveLinkFromScroll = () => {
    if (!header || sections.length === 0) {
        return;
    }

    const offset = header.offsetHeight + 90;
    let currentSection = sections[0];
    const isAtPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    sections.forEach((section) => {
        if (window.scrollY + offset >= section.offsetTop) {
            currentSection = section;
        }
    });

    if (isAtPageEnd) {
        currentSection = sections[sections.length - 1];
    }

    const active = document.querySelector(`.nav-link[href="#${currentSection.id}"]`);

    if (active) {
        setActiveLink(active);
    }
};

const handleScroll = () => {
    updateHeaderState();
    updateActiveLinkFromScroll();
};

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("open");
        menuToggle.classList.toggle("open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        const target = href ? document.querySelector(href) : null;

        if (!target || !header) {
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

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

const setupStaticHeroTitle = () => {
    if (!typedText || !heroTitle) {
        return;
    }

    typedText.textContent = "Neyuky";
    heroTitle.setAttribute("aria-label", "Biến ý tưởng thành trải nghiệm số. Neyuky");
    heroTitle.classList.add("is-static");
};

setupStaticHeroTitle();

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
