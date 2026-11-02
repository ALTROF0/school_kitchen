// ============================================================
//  NGANYAFORM.js  —  Client-side validation + form submission
// ============================================================

// ---------- 1. Grab DOM elements ----------
const nameInput     = document.getElementById("name");
const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput  = document.getElementById("confirm-password");
const ageInput      = document.getElementById("age");
const roadInput     = document.getElementById("road");

const nameError     = document.getElementById("name-error");
const emailError    = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const confirmError  = document.getElementById("confirm-error");
const ageError      = document.getElementById("age-error");
const roadError     = document.getElementById("road-error");

const submitBtn      = document.getElementById("submit-btn");
const successMessage = document.getElementById("success-message");
const form           = document.getElementById("registration-form");

// ---------- 2. Helpers ----------
function mark(input, errorEl, isValid, message) {
  input.className = isValid ? "valid" : "invalid";
  errorEl.textContent = isValid ? "" : message;
  return isValid;
}

// ---------- 3. Individual validators ----------
function validateName() {
  const value = nameInput.value.trim();
  return mark(nameInput, nameError, value !== "", "Name is required.");
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (value === "") {
    return mark(emailInput, emailError, false, "Email is required.");
  }
  // Must contain "@" AND a dot somewhere after the "@"
  const atIndex = value.indexOf("@");
  const hasAt   = atIndex > 0;
  const hasDot  = hasAt && value.indexOf(".", atIndex) > atIndex + 1;
  return mark(
    emailInput,
    emailError,
    hasAt && hasDot,
    "Please enter a valid email (e.g. name@domain.com)."
  );
}

function validatePassword() {
  const value = passwordInput.value;
  if (value === "") {
    return mark(passwordInput, passwordError, false, "Password is required.");
  }
  return mark(
    passwordInput,
    passwordError,
    value.length >= 8,
    "Password must be at least 8 characters."
  );
}

function validateConfirm() {
  const value = confirmInput.value;
  if (value === "") {
    return mark(confirmInput, confirmError, false, "Please confirm your password.");
  }
  return mark(
    confirmInput,
    confirmError,
    value === passwordInput.value,
    "Passwords do not match."
  );
}

function validateAge() {
  const raw = ageInput.value.trim();
  if (raw === "") {
    return mark(ageInput, ageError, false, "Age is required.");
  }
  const value = Number(raw);
  const ok = Number.isInteger(value) && value >= 1 && value <= 120;
  return mark(ageInput, ageError, ok, "Please enter a valid age (1–120).");
}

function validateRoad() {
  const value = roadInput.value.trim();
  return mark(roadInput, roadError, value !== "", "Road is required.");
}

// ---------- 4. Master check ----------
function checkAllFields() {
  const allValid =
    validateName() &&
    validateEmail() &&
    validatePassword() &&
    validateConfirm() &&
    validateAge() &&
    validateRoad();
  submitBtn.disabled = !allValid;
  return allValid;
}

// ---------- 5. Real-time listeners ----------
[nameInput, emailInput, passwordInput, confirmInput, ageInput, roadInput]
  .forEach((el) => el.addEventListener("input", checkAllFields));

// ---------- 6. Submit handler ----------
form.addEventListener("submit", async function (event) {
  event.preventDefault();               // stop page reload

  if (!checkAllFields()) return;        // final safety net

  // Keys MUST match matatu.py's data["..."] lookups exactly.
  const payload = {
    fullName:     nameInput.value.trim(),
    emailAddress: emailInput.value.trim(),
    passWord:     passwordInput.value,   // NB: capital W — matches backend
    age:          Number(ageInput.value),
    road:         roadInput.value.trim(),
  };

  submitBtn.disabled = true;            // prevent double-submit

  try {
    const response = await fetch("http://127.0.0.1:5000/api/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server replied ${response.status}`);
    }

    // Success → hide form, show message
    form.classList.add("hidden");
    successMessage.classList.remove("hidden");
  } catch (error) {
    console.error("Submit failed:", error);
    alert("Submission failed: " + error.message);
    submitBtn.disabled = false;         // let them retry
  }
});