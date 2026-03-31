const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5000" 
    : "https://chitchatchai-backend.onrender.com";

// --- 1. Master Page Initializer ---
document.addEventListener('DOMContentLoaded', async () => {
    
    window.scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                window.scrollObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1, // Wait until 25% of the component is visible
        rootMargin: '0px 0px -50px 0px' // "Bottom margin" - triggers slightly before it hits the bottom
    });

    loadComponent('introduction-placeholder', 'components/introduction.html');
    loadComponent('volunteers-placeholder', 'components/volunteers.html');
    loadComponent('funders-placeholder', 'components/funders.html');
    loadComponent('interactive-placeholder', 'components/interactive.html');
    loadComponent('past-funders-placeholder', 'components/past-funders.html');
    loadComponent('community-connections-placeholder', 'components/community-connections.html');
    await loadComponent('through-the-years-placeholder', 'components/through-the-years.html');

    // --- Journey Logic ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    

    async function switchYear(yearId) {
        const target = document.getElementById('journey-content-target');
        if (!target) return;
        target.style.opacity = '0.5';
        try {
            const response = await fetch(`components/years/${yearId}.html`);
            if (!response.ok) throw new Error('File not found');
            const html = await response.text();
            target.innerHTML = html;
            target.style.opacity = '1';
            initCarousel(target);
        } catch (error) {
            console.error("Fetch error:", error);
            target.innerHTML = "<p>Content is being updated. Please check back soon!</p>";
            target.style.opacity = '1';
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            switchYear(button.getAttribute('data-year'));
        });
    });

    switchYear('year2025'); // Default load

    // --- Form Listener ---
    setupFormListener();
});




// --- 2. UI Helpers (Carousel, Funder, Form) ---
function initCarousel(scope = document) {
    const carousel = scope.querySelector("#highlightsCarousel");
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll(".slide"));
    const prevBtn = carousel.querySelector(".prev");
    const nextBtn = carousel.querySelector(".next");
    if (!slides.length || !prevBtn || !nextBtn) return;

    let currentIndex = slides.findIndex(s => s.classList.contains("active"));
    if (currentIndex === -1) currentIndex = 0;

    function showSlide(newIndex) {
        slides[currentIndex].classList.remove("active");
        currentIndex = (newIndex + slides.length) % slides.length;
        slides[currentIndex].classList.add("active");
    }
    prevBtn.onclick = () => showSlide(currentIndex - 1);
    nextBtn.onclick = () => showSlide(currentIndex + 1);
}

function toggleFunder(card) { card.classList.toggle('is-expanded'); }

function toggleContactForm() {
    const formContainer = document.getElementById('contactFormContainer');
    if (!formContainer) return;
    const isOpening = !formContainer.classList.contains('is-visible');
    formContainer.classList.toggle('is-visible');
    if (isOpening) {
        setTimeout(() => formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
}

function setupFormListener() {
    const form = document.querySelector("form");
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            const originalFormHTML = form.innerHTML;
            form.innerHTML = `<div class="success-message" style="text-align: center; padding: 2rem;">
                <h2>Message Sent!</h2><p>We'll be in touch soon!</p>
                <button type="button" class="button" id="resetForm">Send another</button></div>`;
            document.getElementById('resetForm').onclick = () => {
                form.innerHTML = originalFormHTML;
                form.reset();
                setupFormListener();
            };
        } else { alert("Oops! Try again."); }
    };
}

async function loadComponent(id, path) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;
    
    // Add the base class so it starts hidden
    placeholder.classList.add('scroll-reveal');

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        const html = await response.text();
        
        placeholder.innerHTML = html;

        // Tell the global observer to watch this specific placeholder
        if (window.scrollObserver) {
            window.scrollObserver.observe(placeholder);
        }
        
    } catch (error) {
        console.error("Component load error:", error);
    }
}

function toggleStoryText() {
    const storyBody = document.getElementById('story-body');
    const btn = document.getElementById('story-btn');
    
    if (!storyBody || !btn) return;

    const isVisible = storyBody.classList.contains('is-visible');
    
    if (isVisible) {
        storyBody.classList.remove('is-visible');
        btn.innerHTML = 'Read Our Story';
    } else {
        storyBody.classList.add('is-visible');
        btn.innerHTML = 'Close Story';
    }
}