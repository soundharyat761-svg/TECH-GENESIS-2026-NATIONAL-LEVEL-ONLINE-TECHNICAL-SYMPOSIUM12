document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Constants and State
    const regForm = document.getElementById('regForm');
    const tableBody = document.querySelector('#participantSection table tbody');
    const phoneInput = document.getElementById('phone');
    const btnSubmit = document.querySelector('.btn-submit');

    // Load existing data from storage on startup
    loadFromStorage();

    // 2. Real-time Input Formatting (Phone Number)
    phoneInput.addEventListener('input', (e) => {
        // Removes non-digits and formats: +XX XXXXX XXXXX
        let digits = e.target.value.replace(/\D/g, '');
        if (digits.length > 0) {
            if (digits.length <= 2) e.target.value = `+${digits}`;
            else if (digits.length <= 7) e.target.value = `+${digits.slice(0, 2)} ${digits.slice(2)}`;
            else e.target.value = `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7, 12)}`;
        }
    });

    // 3. Main Submission Logic (Attached to window for HTML onclick compatibility)
    window.submitForm = async function() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const workshop = document.getElementById('workshop').options[document.getElementById('workshop').selectedIndex].text;
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const isDeclared = document.getElementById('declare').checked;

        // --- Advanced Validation ---
        if (!name || !email || phone.length < 10) {
            showNotification("Please fill all required fields correctly.", "error");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            showNotification("Invalid email format.", "error");
            return;
        }

        if (!isDeclared) {
            showNotification("Please accept the declaration.", "error");
            return;
        }

        // --- UI Feedback: Loading State ---
        const originalText = btnSubmit.innerText;
        btnSubmit.disabled = true;
        btnSubmit.innerText = "VERIFYING...";
        btnSubmit.style.cursor = "not-allowed";

        // Simulate API Latency (Asynchronous)
        await new Promise(resolve => setTimeout(resolve, 1200));

        // --- Data Processing ---
        const participant = { name, email, phone, workshop, mode, id: `TG-${Date.now().toString().slice(-4)}` };
        
        appendToTable(participant, true); // True triggers the "New" highlight
        saveToStorage(participant);
        
        // --- Finalize ---
        alert(`Successfully Registered!\nRegistration ID: ${participant.id}\nThank you, ${name}.`);
        
        btnSubmit.disabled = false;
        btnSubmit.innerText = originalText;
        btnSubmit.style.cursor = "pointer";
        regForm.reset();
    };

    // 4. Table Management Functions
    function appendToTable(data, isNew = false) {
        const row = tableBody.insertRow();
        if (isNew) row.style.backgroundColor = "#d4edda"; // Light green highlight for new entry

        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.email}</td>
            <td>${data.phone}</td>
            <td>${data.workshop}</td>
            <td><strong>${data.mode}</strong></td>
        `;

        // Fade the highlight out after 3 seconds
        if (isNew) {
            setTimeout(() => {
                row.style.transition = "background-color 1.5s ease";
                row.style.backgroundColor = "transparent";
            }, 2000);
        }
    }

    // 5. Persistent Storage Logic
    function saveToStorage(obj) {
        let list = JSON.parse(localStorage.getItem('tg2026_users')) || [];
        list.push(obj);
        localStorage.setItem('tg2026_users', JSON.stringify(list));
    }

    function loadFromStorage() {
        let list = JSON.parse(localStorage.getItem('tg2026_users')) || [];
        list.forEach(item => appendToTable(item));
    }

    // Helper for non-intrusive logging (can be expanded to custom UI toasts)
    function showNotification(msg, type) {
        console.log(`[${type.toUpperCase()}] ${msg}`);
        alert(msg);
    }
});
