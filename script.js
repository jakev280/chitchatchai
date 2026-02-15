const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5000" 
    : "https://chitchatchai-backend.onrender.com";

// --- 1. Master Page Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Nudging the backend...");
    fetch(`${API_BASE_URL}/`) 
            .then(() => console.log("Local backend nudged!"))
            .catch(err => console.log("Backend not running yet."));

    // --- Journey Logic ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const target = document.getElementById('journey-content-target');

    async function switchYear(yearId) {
        if (!target) return;
        target.style.opacity = '0.5';
        try {
            const response = await fetch(`components/${yearId}.html`);
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

    // --- Stripe Success Message ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('session') === 'success') {
        // Show the alert first
        alert("Thank you for your tea-rrific support! Your donation helps us keep the community connected.");
        
    const newUrl = window.location.pathname; 
    window.history.replaceState({}, document.title, newUrl);

    }

    // --- Form Listener ---
    setupFormListener();
});

// --- 2. Donation & Chips Logic ---
const chips = document.querySelectorAll('.chip');
const amountInput = document.getElementById('donation-amount');
const donateBtn = document.getElementById('donate-btn');
const statusMsg = document.getElementById('donation-status');
const customContainer = document.getElementById('custom-amount-container');

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        // 1. Update Visuals
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        // 2. Update Value
        if (chip.id === 'custom-chip') {
            if (customContainer) customContainer.style.display = 'flex';
            amountInput.focus();
        } else {
            if (customContainer) customContainer.style.display = 'none';
            amountInput.value = chip.getAttribute('data-amount');
        }
    });
});

// If they type a number, de-select the chips
amountInput?.addEventListener('input', () => {
    chips.forEach(c => c.classList.remove('active'));
});

if (donateBtn) {
    donateBtn.addEventListener('click', async () => {
        donateBtn.disabled = true;
        statusMsg.style.display = 'block';
        try {
            const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseInt(amountInput.value) }),
            });
            const session = await response.json();
            if (session.url) window.location.href = session.url;
            else throw new Error(session.error);
        } catch (error) {
            alert('Server warming up! Try again in 30 seconds.');
            donateBtn.disabled = false;
            statusMsg.style.display = 'none';
        }
    });
}

// --- 3. UI Helpers (Carousel, Funder, Form) ---
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

function toggleFunder(card) {
  card.classList.toggle("is-expanded");
}

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

