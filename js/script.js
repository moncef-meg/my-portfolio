document.addEventListener('DOMContentLoaded', () => {
    
    /* --- 1. INTERACTIVE CANVAS KINETIC PARTICLES BACKGROUND --- */
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const mouse = { x: null, y: null, radius: 140 };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 25) + 12;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = Math.random() * 0.25 + 0.08;
                this.color = Math.random() > 0.4 ? 'rgba(102, 4, 252, 0.22)' : 'rgba(152, 252, 0, 0.18)';
            }
            update() {
                this.baseX += Math.cos(this.angle) * this.speed;
                this.baseY += Math.sin(this.angle) * this.speed;
                if (this.baseX < 0 || this.baseX > canvas.width) this.angle = Math.PI - this.angle;
                if (this.baseY < 0 || this.baseY > canvas.height) this.angle = -this.angle;
                this.x = this.baseX; 
                this.y = this.baseY;
                
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x; 
                    let dy = mouse.y - this.y;
                    let distance = Math.hypot(dx, dy);
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * this.density;
                        this.y -= (dy / distance) * force * this.density;
                    }
                }
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const count = Math.min(Math.floor(window.innerWidth / 12), 110);
            for (let i = 0; i < count; i++) { particles.push(new Particle()); }
        }
        initParticles();

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    /* --- 2. DYNAMIC MULTI-TIER FILTER PRESET SYSTEM --- */
    const mainFilterBtns = document.querySelectorAll('.main-filters .filter-btn');
    const subFilterBtns = document.querySelectorAll('.sub-filters .filter-btn');
    const allSubFilterContainers = document.querySelectorAll('.sub-filters');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    let activeMainFilter = 'photography'; 
    let activeSubFilter = 'all';

    function applyFilters() {
        portfolioItems.forEach(item => {
            const itemCat = item.getAttribute('data-cat');
            const itemSub = item.getAttribute('data-sub');
            let matchMain = (itemCat === activeMainFilter);
            let matchSub = (activeSubFilter === 'all' || itemSub === activeSubFilter);
            
            if (matchMain && matchSub) {
                item.classList.remove('hide');
            } else {
                item.classList.add('hide');
            }
        });
    }

    mainFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mainFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeMainFilter = btn.getAttribute('data-filter');
            activeSubFilter = 'all'; 
            
            allSubFilterContainers.forEach(container => container.classList.add('hidden'));
            subFilterBtns.forEach(b => b.classList.remove('active'));

            if (activeMainFilter === 'photography') document.getElementById('photo-subs').classList.remove('hidden');
            else if (activeMainFilter === 'videography') document.getElementById('video-subs').classList.remove('hidden');
            else if (activeMainFilter === 'motion') document.getElementById('motion-subs').classList.remove('hidden');
            
            const activeContainer = document.querySelector(`.sub-filters:not(.hidden)`);
            if (activeContainer) {
                const globalSubBtn = activeContainer.querySelector('[data-subfilter="all"]');
                if (globalSubBtn) globalSubBtn.classList.add('active');
            }
            applyFilters();
        });
    });

    subFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.sub-filters').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSubFilter = btn.getAttribute('data-subfilter');
            applyFilters();
        });
    });

    applyFilters();

    /* --- 3. PREMIUM RUNTIME PORTFOLIO LIGHTBOX ENGINE --- */
    const lightbox = document.getElementById('portfolio-lightbox');
    const mediaBox = document.getElementById('lightbox-media-box');
    const captionText = document.getElementById('lightbox-caption-text');
    const counterText = document.getElementById('lightbox-counter-text');
    const closeBtn = document.getElementById('lightbox-close-btn');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');

    let currentGalleryMedia = [];
    let currentGalleryTitles = [];
    let currentMediaIndex = 0;
    let currentMediaType = 'image';

    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const rawImages = item.getAttribute('data-images');
            const rawTitles = item.getAttribute('data-titles');
            currentMediaType = item.getAttribute('data-type') || 'image';
            const defaultTitle = item.querySelector('.item-title')?.textContent || '';

            try {
                currentGalleryMedia = JSON.parse(rawImages || '[]');
                currentGalleryTitles = JSON.parse(rawTitles || '[]');
            } catch (e) {
                console.error("Failed to parse project array metadata structure", e);
                return;
            }

            if (currentGalleryMedia.length === 0) return;

            currentMediaIndex = 0;
            openLightbox(defaultTitle);
        });
    });

    function openLightbox(fallbackTitle) {
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderMedia(fallbackTitle);
    }

    function renderMedia(fallbackTitle) {
        mediaBox.innerHTML = '';
        const mediaPath = currentGalleryMedia[currentMediaIndex];
        const titleText = currentGalleryTitles[currentMediaIndex] || fallbackTitle;

        if (currentMediaType === 'video' || mediaPath.toLowerCase().endsWith('.mp4')) {
            const videoElement = document.createElement('video');
            videoElement.src = mediaPath;
            videoElement.controls = true;
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            mediaBox.appendChild(videoElement);
        } else {
            const imgElement = document.createElement('img');
            imgElement.src = mediaPath;
            imgElement.alt = titleText;
            mediaBox.appendChild(imgElement);
        }

        captionText.textContent = titleText;
        counterText.textContent = `${currentMediaIndex + 1} / ${currentGalleryMedia.length}`;

        if (currentGalleryMedia.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }

    function nextMedia() {
        if (currentGalleryMedia.length <= 1) return;
        currentMediaIndex = (currentMediaIndex + 1) % currentGalleryMedia.length;
        renderMedia(captionText.textContent);
    }

    function prevMedia() {
        if (currentGalleryMedia.length <= 1) return;
        currentMediaIndex = (currentMediaIndex - 1 + currentGalleryMedia.length) % currentGalleryMedia.length;
        renderMedia(captionText.textContent);
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        mediaBox.innerHTML = '';
    }

    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextMedia(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevMedia(); });
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.closest('.lightbox-content') === null) {
                closeLightbox();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextMedia();
        if (e.key === 'ArrowLeft') prevMedia();
    });

    /* --- 4. NAVIGATION DEBOUNCED INTERACTION HIGHLIGHTER --- */
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(sec => {
            const sectionTop = sec.offsetTop;
            const sectionHeight = sec.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
});