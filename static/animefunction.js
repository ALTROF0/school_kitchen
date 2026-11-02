const API_BASE = "http://127.0.0.1:5000";

const animeInput   = document.getElementById("anime");
const MCInput      = document.getElementById("maincharacter");
const SCInput      = document.getElementById("sidecharacter");
const MCPowerInput = document.getElementById("maincharacter-Power");
const SCPowerInput = document.getElementById("sidecharacter-Power");
const wordsInput   = document.getElementById("WORDS");
const STATSInput   = document.getElementById("STATS");

const animeError   = document.getElementById("anime-error");
const MCError      = document.getElementById("maincharacter-error");
const SCError      = document.getElementById("sidecharacter-error");
const MCPowerError = document.getElementById("maincharacter-Power-error");
const SCPowerError = document.getElementById("sidecharacter-Power-error");
const wordsError   = document.getElementById("WORDS-error");
const STATSError   = document.getElementById("STATS-error");

const submitBtn      = document.getElementById("submit-btn");
const successMessage = document.getElementById("success-message");
const form           = document.getElementById("registration-form");
const formTitle      = document.getElementById("form-title");

// --- Edit-mode detection ---------------------------------------------------
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");
const isEditMode = Boolean(editId);

if (isEditMode) {
    formTitle.textContent = "ANIME EDIT";
    submitBtn.textContent = "WATASHI WA UPDATE";
}

// --- Validation helpers ----------------------------------------------------
function setValidity(input, errorEl, message, isValid) {
    input.className = isValid ? "valid" : "invalid";
    errorEl.textContent = isValid ? "" : message;
    return isValid;
}

function validateAnime()   { return setValidity(animeInput,   animeError,   "Anime name is required.",            animeInput.value.trim()   !== ""); }
function validateMC()      { return setValidity(MCInput,      MCError,      "Main character name is required.",   MCInput.value.trim()      !== ""); }
function validateSC()      { return setValidity(SCInput,      SCError,      "Side character name is required.",   SCInput.value.trim()      !== ""); }
function validateMCPower() { return setValidity(MCPowerInput, MCPowerError, "Main character power is required.",  MCPowerInput.value.trim() !== ""); }
function validateSCPower() { return setValidity(SCPowerInput, SCPowerError, "Side character power is required.",  SCPowerInput.value.trim() !== ""); }
function validateWords()   { return setValidity(wordsInput,   wordsError,   "Words are required.",                wordsInput.value.trim()   !== ""); }

function validateSTATS() {
    const v = STATSInput.value.trim();
    if (v === "") {
        return setValidity(STATSInput, STATSError, "Stats are required.", false);
    }
    const n = Number(v);
    if (Number.isNaN(n) || !Number.isInteger(n) || n < 0) {
        return setValidity(STATSInput, STATSError, "Stats must be a non-negative whole number.", false);
    }
    return setValidity(STATSInput, STATSError, "", true);
}

function checkAllFields() {
    const ok = [
        validateAnime(), validateMC(), validateSC(),
        validateMCPower(), validateSCPower(), validateWords(), validateSTATS(),
    ].every(Boolean);
    submitBtn.disabled = !ok;
    return ok;
}

[animeInput, MCInput, SCInput, MCPowerInput, SCPowerInput, wordsInput, STATSInput]
    .forEach(input => input.addEventListener("input", checkAllFields));

// --- Prefill in edit mode --------------------------------------------------
async function prefillForEdit() {
    if (!isEditMode) return;
    try {
        const res = await fetch(`${API_BASE}/api/anime/${editId}`);
        if (!res.ok) {
            alert("Could not load the anime for editing.");
            return;
        }
        const rec = await res.json();
        animeInput.value   = rec.animeName;
        MCInput.value      = rec.mainCharacter;
        SCInput.value      = rec.sideCharacter;
        MCPowerInput.value = rec.mcPower;
        SCPowerInput.value = rec.scPower;
        wordsInput.value   = rec.words;
        STATSInput.value   = rec.stats;
        checkAllFields();
    } catch (err) {
        console.error("Prefill error:", err);
    }
}
document.addEventListener("DOMContentLoaded", prefillForEdit);

// --- Submit (create or update) --------------------------------------------
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!checkAllFields()) return;

    submitBtn.disabled = true;

    const payload = {
        animeName:     animeInput.value.trim(),
        mainCharacter: MCInput.value.trim(),
        sideCharacter: SCInput.value.trim(),
        mcPower:       MCPowerInput.value.trim(),
        scPower:       SCPowerInput.value.trim(),
        words:         wordsInput.value.trim(),
        stats:         Number(STATSInput.value.trim()),
    };

    const url    = isEditMode ? `${API_BASE}/api/anime/${editId}` : `${API_BASE}/api/anime`;
    const method = isEditMode ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            alert("Failed: " + (err.error || response.status));
            submitBtn.disabled = false;
            return;
        }

        form.classList.add("hidden");
        successMessage.classList.remove("hidden");

        setTimeout(() => {
            window.location.href = "/animetable.html";
        }, 70000);
    } catch (error) {
        console.error("Network Error:", error);
        alert("Server connection failed. Is Flask running on port 5000?");
        submitBtn.disabled = false;
    }
});