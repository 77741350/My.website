// ========== Optimized JavaScript - Lightweight Version ========== //

// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => preloader.classList.add('hidden'), 800);
});

// Navbar Scroll
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Mobile Navigation
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Active Navigation on Scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (navLink) {
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// Animation Observer
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 1500; const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(progress * target);
            counter.textContent = value;
            if (progress < 1) requestAnimationFrame(animate);
        };
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { requestAnimationFrame(animate); }
        }, { threshold: 0.5 });
        observer.observe(counter);
    });
}
animateCounters();

// Product Filter
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            setTimeout(() => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
                } else {
                    card.style.opacity = '0'; card.style.transform = 'scale(0.8)'; setTimeout(() => card.style.display = 'none', 300);
                }
            }, 50);
        });
    });
});

// Shopping Cart
let cart = [];
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartBody = document.getElementById('cartBody');
const cartFooter = document.getElementById('cartFooter');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function updateCart() {
    cartCount.textContent = cart.length;
    if (cart.length === 0) {
        cartBody.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>سلتك فارغة</p></div>`;
        cartFooter.style.display = 'none';
    } else {
        let html = ''; let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            html += `
                <div class="cart-item">
                    <div class="cart-item-icon"><i class="fas fa-mobile-screen-button"></i></div>
                    <div class="cart-item-info"><div class="cart-item-name">${item.name}</div><div class="cart-item-price">$${item.price}</div></div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        });
        cartBody.innerHTML = html;
        cartTotal.textContent = '$' + total;
        cartFooter.style.display = 'block';
    }
}

function removeFromCart(index) { cart.splice(index, 1); updateCart(); }

// NOTE: add-to-cart and wishlist bindings are handled in auth.js
// because products are loaded dynamically from the API.

// Wishlist (initial static cards handled in auth.js)
    });
});

// Testimonials Slider
const track = document.getElementById('testimonialsTrack');
let currentSlide = 0;

function updateSlider() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

document.getElementById('prevBtn').addEventListener('click', () => {
    currentSlide = Math.max(0, currentSlide - 1); updateSlider();
});

document.getElementById('nextBtn').addEventListener('click', () => {
    const maxSlide = Math.max(0, document.querySelectorAll('.testimonial-card').length - 1);
    currentSlide = Math.min(currentSlide + 1, maxSlide); updateSlider();
});

// Auto Slide
setInterval(() => {
    const cards = document.querySelectorAll('.testimonial-card');
    const maxSlide = Math.max(0, cards.length - 1);
    if (currentSlide >= maxSlide) currentSlide = 0; else currentSlide++;
    updateSlider();
}, 5000);

// Contact Form
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const whatsappUrl = `https://wa.me/967780402502?text=${encodeURIComponent(`مرحباً، أنا ${name}\n${message}\nالبريد: ${email}`)}`;
    window.open(whatsappUrl, '_blank');
    e.target.reset();
    alert('شكراً لتواصلك معنا! سيتم تحويلك إلى واتساب.');
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

console.log('Pm Store - Optimized Website Loaded! 🛒');
