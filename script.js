// IIFE para evitar contaminación del scope global
(function() {
    'use strict';

    // Constantes
    const SCROLL_THRESHOLD = 100;
    const HEADER_OFFSET = 90;
    const ANIMATION_DURATION = 800;
    const CAROUSEL_INTERVAL = 5000;
    const NOTIFICATION_DURATION = 3000;
    const PARTICLES_COUNT = 50;

    // Cache de elementos DOM
    const DOM = {
        header: null,
        carousels: null,
        slides: null,
        navigation: {
            prev: null,
            next: null
        },
        menu: {
            toggle: null,
            container: null
        },
        form: null,
        sections: null,
        init() {
            this.header = document.querySelector('header');
            this.carousels = document.querySelectorAll('.carousel-container');
            this.slides = document.querySelectorAll('.carousel-slide');
            this.navigation.prev = document.querySelector('.prev');
            this.navigation.next = document.querySelector('.next');
            this.menu.toggle = document.querySelector('.menu-toggle');
            this.menu.container = document.querySelector('.menu');
            this.form = document.querySelector('form');
            this.sections = document.querySelectorAll('section');
        }
    };

    // Estado de la aplicación
    const State = {
        scroll: {
            last: 0,
            current: 0
        },
        carousel: {
            current: 0,
            isAnimating: false,
            interval: null
        }
    };

    // Controlador unificado del carrusel
    const CarouselController = {
        init() {
            DOM.carousels.forEach(container => {
                const carousel = {
                    container,
                    slides: container.querySelectorAll('.carousel-slide'),
                    prevBtn: container.querySelector('.carousel-btn.prev'),
                    nextBtn: container.querySelector('.carousel-btn.next'),
                    indicators: container.querySelectorAll('.indicator'),
                    currentSlide: 0,
                    isAnimating: false,
                    autoplayInterval: null
                };

                this.setupCarousel(carousel);
            });
        },

        setupCarousel(carousel) {
            // Configurar botones de navegación
            if (carousel.prevBtn) {
                carousel.prevBtn.addEventListener('click', () => this.updateSlide(carousel, 'prev'));
            }
            if (carousel.nextBtn) {
                carousel.nextBtn.addEventListener('click', () => this.updateSlide(carousel, 'next'));
            }

            // Configurar indicadores
            carousel.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => this.goToSlide(carousel, index));
            });

            // Configurar autoplay
            this.startAutoplay(carousel);

            // Pausar en hover
            carousel.container.addEventListener('mouseenter', () => this.stopAutoplay(carousel));
            carousel.container.addEventListener('mouseleave', () => this.startAutoplay(carousel));

            // Controles de teclado
            carousel.container.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.updateSlide(carousel, 'prev');
                } else if (e.key === 'ArrowRight') {
                    this.updateSlide(carousel, 'next');
                }
            });
        },

        updateSlide(carousel, direction) {
            if (carousel.isAnimating) return;
            carousel.isAnimating = true;

            const totalSlides = carousel.slides.length;
            const currentSlide = carousel.slides[carousel.currentSlide];
            
            // Remover clase activa del slide actual
            currentSlide.classList.remove('active');
            if (carousel.indicators.length) {
                carousel.indicators[carousel.currentSlide].classList.remove('active');
                carousel.indicators[carousel.currentSlide].setAttribute('aria-selected', 'false');
            }

            // Calcular siguiente slide
            if (direction === 'next') {
                carousel.currentSlide = (carousel.currentSlide === totalSlides - 1) ? 0 : carousel.currentSlide + 1;
            } else {
                carousel.currentSlide = (carousel.currentSlide === 0) ? totalSlides - 1 : carousel.currentSlide - 1;
            }

            // Activar nuevo slide
            const nextSlide = carousel.slides[carousel.currentSlide];
            nextSlide.classList.add('active');
            
            if (carousel.indicators.length) {
                carousel.indicators[carousel.currentSlide].classList.add('active');
                carousel.indicators[carousel.currentSlide].setAttribute('aria-selected', 'true');
            }

            setTimeout(() => {
                carousel.isAnimating = false;
            }, ANIMATION_DURATION);
        },

        goToSlide(carousel, index) {
            if (carousel.isAnimating || carousel.currentSlide === index) return;
            carousel.isAnimating = true;

            carousel.slides[carousel.currentSlide].classList.remove('active');
            if (carousel.indicators.length) {
                carousel.indicators[carousel.currentSlide].classList.remove('active');
                carousel.indicators[carousel.currentSlide].setAttribute('aria-selected', 'false');
            }

            carousel.currentSlide = index;

            carousel.slides[carousel.currentSlide].classList.add('active');
            if (carousel.indicators.length) {
                carousel.indicators[carousel.currentSlide].classList.add('active');
                carousel.indicators[carousel.currentSlide].setAttribute('aria-selected', 'true');
            }

            setTimeout(() => {
                carousel.isAnimating = false;
            }, ANIMATION_DURATION);
        },

        startAutoplay(carousel) {
            carousel.autoplayInterval = setInterval(() => {
                this.updateSlide(carousel, 'next');
            }, CAROUSEL_INTERVAL);
        },

        stopAutoplay(carousel) {
            clearInterval(carousel.autoplayInterval);
        }
    };

    const HeaderController = {
        init() {
            if (!DOM.header) return;
            
            this.setupScrollListeners();
        },

        handleScroll() {
            State.scroll.current = window.pageYOffset;

            this.updateHeaderVisibility();
            this.updateHeaderBackground();
            
            State.scroll.last = State.scroll.current;
        },

        updateHeaderVisibility() {
            if (State.scroll.current > State.scroll.last && State.scroll.current > SCROLL_THRESHOLD) {
                DOM.header.classList.add('scrolled');
        } else {
                DOM.header.classList.remove('scrolled');
            }

            if (State.scroll.current === 0) {
                DOM.header.classList.remove('scrolled', 'visible');
            }
        },

        updateHeaderBackground() {
            const opacity = State.scroll.current > 50 ? '0.98' : '0.95';
            DOM.header.style.backgroundColor = `rgba(26, 26, 26, ${opacity})`;
        },

        setupScrollListeners() {
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        }
    };

    const FormController = {
        init() {
            if (!DOM.form) return;

            this.setupFormValidation();
            this.setupInputEffects();
        },

        setupFormValidation() {
            DOM.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!this.validateForm()) return;

                await this.submitForm();
            });
        },

        setupInputEffects() {
            const inputs = DOM.form.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    input.parentElement.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value) {
                        input.parentElement.classList.remove('focused');
                    }
                });
            });
        },

        async submitForm() {
            try {
                const formData = new FormData(DOM.form);
                const response = await fetch('https://formsubmit.co/ajax/adm201364@gmail.com', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    this.showNotification();
                    this.showSuccessMessage();
                    DOM.form.reset();
                } else {
                    throw new Error('Error al enviar el formulario');
                }
            } catch (error) {
                this.showErrorMessage();
                console.error('Error:', error);
            }
        },

        validateForm() {
            const inputs = DOM.form.querySelectorAll('[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    this.showInputError(input);
                } else {
                    input.classList.remove('error');
                }
            });
            
            return isValid;
        },

        showInputError(input) {
            if (input.nextElementSibling?.classList.contains('input-error')) return;

            const errorMessage = document.createElement('div');
            errorMessage.className = 'input-error';
            errorMessage.textContent = 'Por favor, completa este campo';
            
            input.parentElement.appendChild(errorMessage);
            
            setTimeout(() => errorMessage.remove(), NOTIFICATION_DURATION);
        },

        showNotification() {
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Mensaje Enviado", {
                    body: "Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.",
                    icon: "EAD negro.png"
                });
            }
        },

        showSuccessMessage() {
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = '¡Mensaje enviado con éxito!';
            DOM.form.insertBefore(successMessage, DOM.form.firstChild);

            setTimeout(() => successMessage.remove(), NOTIFICATION_DURATION);
        },

        showErrorMessage() {
            const errorToast = document.createElement('div');
            errorToast.className = 'error-toast';
            errorToast.textContent = 'Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.';
            document.body.appendChild(errorToast);

            setTimeout(() => errorToast.remove(), NOTIFICATION_DURATION);
        }
    };

    const NavigationController = {
        init() {
            this.setupSmoothScroll();
            this.setupMobileMenu();
        },

        setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
            e.preventDefault();
                    this.scrollToTarget(anchor.getAttribute('href'));
                    this.updateActiveMenuItem(anchor);
                });
            });
        },

        setupMobileMenu() {
            if (!DOM.menu.toggle || !DOM.menu.container) return;

            DOM.menu.toggle.addEventListener('click', () => this.toggleMobileMenu());
            
            DOM.menu.container.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => this.closeMobileMenu());
            });
        },

        scrollToTarget(href) {
            const target = document.querySelector(href);
            if (!target) return;

            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - HEADER_OFFSET;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        },

        updateActiveMenuItem(clickedItem) {
            document.querySelectorAll('.menu a').forEach(link => {
                link.classList.remove('active');
            });
            clickedItem.classList.add('active');
        },

        toggleMobileMenu() {
            DOM.menu.toggle.classList.toggle('active');
            DOM.menu.container.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        },

        closeMobileMenu() {
            DOM.menu.toggle.classList.remove('active');
            DOM.menu.container.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    };

    const EffectsController = {
        init() {
            this.initializeAOS();
            this.setupImageLoading();
            this.createParticles();
            this.setupScrollEffects();
        },

        initializeAOS() {
            AOS.init({
                duration: 800,
                offset: 100,
                once: true,
                easing: 'ease-out-cubic'
            });
        },

        setupImageLoading() {
            document.querySelectorAll('img').forEach(img => {
                img.addEventListener('load', () => img.classList.add('loaded'));
                if (img.complete) img.classList.add('loaded');
            });
        },

        createParticles() {
            const container = document.createElement('div');
            container.className = 'particles';
            document.body.appendChild(container);

            for (let i = 0; i < PARTICLES_COUNT; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 3 + 1;
            const left = Math.random() * 100;
            const delay = Math.random() * 20;
            const opacity = Math.random() * 0.5;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-delay: -${delay}s;
                opacity: ${opacity};
            `;
            
                container.appendChild(particle);
            }
        },

        setupScrollEffects() {
            window.addEventListener('scroll', () => {
                this.handleParallax();
                this.handleReveal();
            }, { passive: true });
        },

        handleParallax() {
            const scrolled = window.pageYOffset;
            DOM.sections.forEach(section => {
                if (!section.dataset.speed) return;
                const speed = section.dataset.speed;
                const yPos = -(scrolled * speed);
                section.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        },

        handleReveal() {
            const reveals = document.querySelectorAll('.reveal');
            const windowHeight = window.innerHeight;
            
            reveals.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                if (elementTop < windowHeight - 150) {
                    element.classList.add('active');
                }
            });
        }
    };

    function initCarousel(carouselElement) {
        const slides = carouselElement.querySelectorAll('.carousel-slide');
        const prevBtn = carouselElement.parentElement.querySelector('.prev');
        const nextBtn = carouselElement.parentElement.querySelector('.next');
        const indicators = carouselElement.parentElement.querySelectorAll('.indicator');
        let currentSlide = 0;
        let isAutoPlaying = true;
        let autoPlayInterval;

        function updateSlide(direction) {
            slides[currentSlide].classList.remove('active');
            indicators[currentSlide].setAttribute('aria-selected', 'false');

            if (direction === 'next') {
                currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
            } else {
                currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
            }

            slides[currentSlide].classList.add('active');
            indicators[currentSlide].setAttribute('aria-selected', 'true');
        }

        function startAutoPlay() {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => {
                if (isAutoPlaying) updateSlide('next');
            }, 5000);
        }

        function goToSlide(index) {
            slides[currentSlide].classList.remove('active');
            indicators[currentSlide].setAttribute('aria-selected', 'false');
            currentSlide = index;
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].setAttribute('aria-selected', 'true');
        }

        // Event Listeners
        prevBtn.addEventListener('click', () => {
            updateSlide('prev');
            startAutoPlay();
        });

        nextBtn.addEventListener('click', () => {
            updateSlide('next');
            startAutoPlay();
        });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                goToSlide(index);
                startAutoPlay();
            });
        });

        carouselElement.parentElement.addEventListener('mouseenter', () => {
            isAutoPlaying = false;
        });

        carouselElement.parentElement.addEventListener('mouseleave', () => {
            isAutoPlaying = true;
            startAutoPlay();
        });

        // Keyboard navigation
        carouselElement.parentElement.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                updateSlide('prev');
                startAutoPlay();
            } else if (e.key === 'ArrowRight') {
                updateSlide('next');
                startAutoPlay();
            }
        });

        // Start autoplay
        startAutoPlay();
    }

    // Inicialización
    document.addEventListener('DOMContentLoaded', function() {
        DOM.init();
        CarouselController.init();
        HeaderController.init();
        FormController.init();
        NavigationController.init();
        EffectsController.init();

        // Solicitar permiso para notificaciones
        if ("Notification" in window) {
            Notification.requestPermission();
        }

        // Inicializar AOS
        AOS.init({
            duration: 800,
            offset: 50,
            easing: 'ease-in-out'
        });

        // Initialize all carousels
        document.querySelectorAll('.carousel').forEach(carousel => {
            initCarousel(carousel);
        });
    });
})(); 