const button = document.getElementById("theme-toggle");
const body = document.body;
const form = document.querySelector("form");

function initCarousel(scope = document) {
  const carousel = scope.querySelector("#highlightsCarousel");
  if (!carousel) return; // this year might not have a carousel

  const slides = Array.from(carousel.querySelectorAll(".slide"));
  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");

  if (!slides.length || !prevBtn || !nextBtn) {
    console.warn("Carousel found but missing slides/buttons.");
    return;
  }

  // Find active slide or default to first
  let currentIndex = slides.findIndex(s => s.classList.contains("active"));
  if (currentIndex === -1) currentIndex = 0;

  // Ensure only one active
  slides.forEach((s, i) => s.classList.toggle("active", i === currentIndex));

  function showSlide(newIndex) {
    slides[currentIndex].classList.remove("active");
    currentIndex = (newIndex + slides.length) % slides.length; // wrap
    slides[currentIndex].classList.add("active");
  }

  // Use onclick so re-initializing doesn't stack multiple listeners
  prevBtn.onclick = () => showSlide(currentIndex - 1);
  nextBtn.onclick = () => showSlide(currentIndex + 1);
}

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const target = document.getElementById('journey-content-target');

    /**
     * The core logic to fetch and display the year content
     */
    async function switchYear(yearId) {
        // 1. Visual feedback: Dim the current content
        target.style.opacity = '0.5';
        
        try {
            // 2. Fetch the small HTML snippet
            const response = await fetch(`components/${yearId}.html`);
            if (!response.ok) throw new Error('File not found');
            const html = await response.text();
            
            // 3. Inject the new HTML and restore opacity
            target.innerHTML = html;
            target.style.opacity = '1';
            initCarousel(target);
            
        } catch (error) {
            console.error("Fetch error:", error);
            target.innerHTML = "<p>Content is being updated. Please check back soon!</p>";
            target.style.opacity = '1';
        }
    }

    /**
     * Setup Button Clicks
     */
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons and add to the clicked one
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Get the year ID (e.g., 'year2021') from the onclick or data attribute
            // If you use data-year="year2021" in your HTML:
            const yearId = button.getAttribute('data-year');
            switchYear(yearId);
        });
    });

    // Load the most recent year by default
    switchYear('year2024');
});


function toggleFunder(card) {
    // This toggles the 'is-expanded' class on the card you clicked
    card.classList.toggle('is-expanded');
}

function toggleContactForm() {
    const formContainer = document.getElementById('contactFormContainer');
    const isOpening = !formContainer.classList.contains('is-visible');
    
    formContainer.classList.toggle('is-visible');
    
    if (isOpening) {
        // Wait for the animation to start, then scroll
        setTimeout(() => {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

function setupFormListener() {
    const form = document.querySelector("form");
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault(); 
        
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // 1. Save the original form HTML
            const originalFormHTML = form.innerHTML;

            // 2. Show the success message (REMOVED EMOJI)
            form.innerHTML = `
            <div class="success-message" style="text-align: center; padding: 2rem; animation: fadeIn 0.5s;">
                <h2 style="color: white; margin-bottom: 0.5rem;">Message Sent!</h2>
                <p style="color: rgba(255,255,255,0.9); margin-bottom: 2rem;">
                    Thanks for reaching out. We'll be in touch soon!
                </p>
                
                <button type="button" class="button" id="resetForm">
                    Send another message
                </button>
            </div>
            `;

            // 3. Logic to restore the form when the button is clicked
            document.getElementById('resetForm').onclick = () => {
                form.innerHTML = originalFormHTML;
                
                // Clear the fields so it's a fresh start
                form.reset(); 
                
                // RE-ATTACH: This ensures the 'Send Message' button works again
                setupFormListener(); 
            };
        } else {
            alert("Oops! There was a problem. Please try again.");
        }
    };
}

// Run it once when the page loads
setupFormListener();

