const button = document.getElementById("theme-toggle");
const body = document.body;
const form = document.querySelector("form");

function toggleFunder(card) {
    // This toggles the 'is-expanded' class on the card you clicked
    card.classList.toggle('is-expanded');
}

function openYear(evt, yearName) {
    // 1. Hide all tab content elements
    const tabContent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].classList.remove("active");
    }

    // 2. Remove the "active" class from all buttons
    const tabBtns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
        tabBtns[i].classList.remove("active");
    }

    // 3. Show the current tab and add an "active" class to the button
    document.getElementById(yearName).classList.add("active");
    evt.currentTarget.classList.add("active");
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

