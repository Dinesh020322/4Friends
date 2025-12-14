// 1. PRELOADER
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 2000);
    }
});

// 2. NAVBAR SCROLL EFFECT
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 3. MOUSE SPOTLIGHT EFFECT
// Note: This calculates position for lighting, it does NOT rotate the card.
document.addEventListener('mousemove', e => {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// 4. BACKGROUND PARTICLES
const canvas = document.getElementById('canvas-container');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    const mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if(this.x < 0 || this.x > width) this.vx *= -1;
            if(this.y < 0 || this.y > height) this.vy *= -1;
            
            // Mouse Interaction (Push effect, not rotation)
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < mouse.radius) {
                const angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle) * 2;
                this.y -= Math.sin(angle) * 2;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
            gradient.addColorStop(0, `rgba(0, 243, 255, ${this.opacity})`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        let count = Math.floor((width * height) / 12000);
        for(let i=0; i<count; i++) particles.push(new Particle());
    }

    function animateCanvas() {
        ctx.fillStyle = 'rgba(3, 3, 5, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        for(let i=0; i<particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            for(let j=i+1; j<particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 243, 255, ${0.15 * (1 - dist/120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateCanvas);
    }

    initParticles();
    animateCanvas();
}

// 5. SCROLL REVEAL & COUNTER ANIMATION
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            const counters = entry.target.querySelectorAll('.stat-number[data-target]');
            counters.forEach(counter => {
                if(counter.textContent !== '0') return;
                
                const target = +counter.getAttribute('data-target');
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if(current < target) {
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target + (target < 1000 ? '+' : '');
                    }
                };
                updateCounter();
            });
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 6. SERVICE CARD TOGGLE
function toggleService(button) {
    const card = button.closest('.service-card');
    const isExpanded = card.classList.contains('expanded');
    
    document.querySelectorAll('.service-card').forEach(c => {
        c.classList.remove('expanded');
        c.querySelector('.service-toggle').textContent = '+';
    });
    
    if (!isExpanded) {
        card.classList.add('expanded');
        button.textContent = '−';
    }
}

// 7. SMOOTH SCROLLING
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// 8. MOBILE MENU
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.flexDirection = 'column';
            navLinks.style.background = 'rgba(3, 3, 5, 0.98)';
            navLinks.style.padding = '2rem';
            navLinks.style.gap = '1.5rem';
        }
    });
}

// 9. CONTACT FORM HANDLER
function handleContactSubmit() {
    const name = document.getElementById('contact-name')?.value;
    const email = document.getElementById('contact-email')?.value;
    const project = document.getElementById('contact-project')?.value;
    const message = document.getElementById('contact-message')?.value;
    
    if (!name || !email || !message) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // In production, send data to backend
    console.log('Form submitted:', { name, email, project, message });
    
    alert('Thank you for your message! We will get back to you soon.');
    
    // Clear form
    const form = document.querySelector('form');
    if(form) form.reset();
}

// 10. PAGE LOAD ANIMATIONS
document.addEventListener('DOMContentLoaded', () => {
    // Trigger animations on page load
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('active');
            }, index * 100);
        });
    }, 300);
});