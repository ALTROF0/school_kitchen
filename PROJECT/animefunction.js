let animeInput = document.getElementById("anime");
let MCInput = document.getElementById("maincharacter");
let SCInput = document.getElementById("sidecharacter");
let MCPowerInput = document.getElementById("maincharacter-Power"); // Fixed ID with space
let SCPowerInput = document.getElementById("sidecharacter-Power"); // Fixed ID with space
let wordsInput = document.getElementById("WORDS");
let STATSInput = document.getElementById("STATS");

let animeError = document.getElementById("anime-error");
let MCError = document.getElementById("maincharacter-error");
let SCError = document.getElementById("sidecharacter-error");
let MCPowerError = document.getElementById("maincharacter-Power-error");
let SCPowerError = document.getElementById("sidecharacter-Power-error");
let wordsError = document.getElementById("WORDS-error");
let STATSInputError = document.getElementById("STATS-error");

let submitBtn = document.getElementById("submit-btn");
let successMessage = document.getElementById("success-message");
let form = document.getElementById("registration-form");

function validateAnime() {
    let value = animeInput.value.trim();
    if (value === "") {
        animeInput.className = "invalid";
        animeError.textContent = "Anime name is required.";
        return false;
    } else {
        animeInput.className = "valid";
        animeError.textContent = "";
        return true;
    }
}

function validateMC() {
    let value = MCInput.value.trim();
    if (value === "") {
        MCInput.className = "invalid";
        MCError.textContent = "Main character name is required.";
        return false;
    } else {
        MCInput.className = "valid";
        MCError.textContent = "";
        return true;
    }
}

function validateSC() {
    let value = SCInput.value.trim();
    if (value === "") {
        SCInput.className = "invalid";
        SCError.textContent = "Side character name is required.";
        return false;
    } else {
        SCInput.className = "valid";
        SCError.textContent = "";
        return true;
    }
}

function validateMCPower() {
    let value = MCPowerInput.value.trim();
    if (value === "") {
        MCPowerInput.className = "invalid";
        MCPowerError.textContent = "Main character power is required.";
        return false;
    } else {
        MCPowerInput.className = "valid";
        MCPowerError.textContent = "";
        return true;
    }
}

function validateSCPower() {
    let value = SCPowerInput.value.trim();
    if (value === "") {
        SCPowerInput.className = "invalid";
        SCPowerError.textContent = "Side character power is required.";
        return false;
    } else {
        SCPowerInput.className = "valid";
        SCPowerError.textContent = "";
        return true;
    }
}

function validateWords() {
    let value = wordsInput.value.trim();
    if (value === "") {
        wordsInput.className = "invalid";
        wordsError.textContent = "Words are required.";
        return false;
    } else {
        wordsInput.className = "valid";
        wordsError.textContent = "";
        return true;
    }
}

function validateSTATS() {
    let value = STATSInput.value.trim();
    if (value === "") {
        STATSInput.className = "invalid";
        STATSInputError.textContent = "Stats are required.";
        return false;
    } else {
        STATSInput.className = "valid";
        STATSInputError.textContent = "";
        return true;
    }
}

function checkAllFields() {
    let isAnimeValid = validateAnime();
    let isMCValid = validateMC();
    let isSCValid = validateSC();
    let isMCPowerValid = validateMCPower();
    let isSCPowerValid = validateSCPower();
    let isWordsValid = validateWords();
    let isSTATSValid = validateSTATS();

    if (isAnimeValid && isMCValid && isSCValid && isMCPowerValid && isSCPowerValid && isWordsValid && isSTATSValid) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// Attach input listeners globally on startup
[animeInput, MCInput, SCInput, MCPowerInput, SCPowerInput, wordsInput, STATSInput].forEach(input => {
    input.addEventListener("input", checkAllFields);
});

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Match keys expected by Flask backend
    const formData = {
        animeName: animeInput.value,
        mainCharacter: MCInput.value,
        sideCharacter: SCInput.value,
        mcPower: MCPowerInput.value,
        scPower: SCPowerInput.value,
        words: wordsInput.value,
        stats: STATSInput.value
    };

    try {
        const response = await fetch("http://127.0.0.1:5000/api/anime", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Success:", data); // Fixed variable name from result -> data

            form.classList.add("hidden"); // Fixed typo from from -> form
            successMessage.classList.remove("hidden");
        } else {
            alert("Failed to submit data. Please try again.");
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("Server connection failed. Is your Flask running?");
    }
});
document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevents default form submission

    // Hide the form and display the success message block
    document.getElementById('registration-form').style.display = 'none';
    document.getElementById('success-message').classList.remove('hidden');

    // Wait 5 seconds (5000 milliseconds) for the video/message, then redirect
    setTimeout(function() {
        window.location.href = 'animetable.html'; // Replace with your table filename
    }, 10000); 
});