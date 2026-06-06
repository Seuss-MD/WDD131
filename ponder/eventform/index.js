const form = document.querySelector("#eventForm");
const typeSelect = document.querySelector("#type");
const extraField = document.querySelector("#extraField");
const extraLabel = document.querySelector("#extraLabel");
const extraInput = document.querySelector("#extraInput");
const eventDate = document.querySelector("#eventDate");
const messages = document.querySelector("#messages");

eventDate.min = getTomorrowString();

typeSelect.addEventListener("change", showExtraField);
form.addEventListener("submit", validateForm);

function showExtraField() {
  extraInput.value = "";

  if (typeSelect.value === "student") {
    extraField.hidden = false;
    extraLabel.textContent = "Student I#";
    extraInput.placeholder = "Enter 9 digit student I-Number";
    extraInput.maxLength = 9;
    extraInput.inputMode = "numeric";
  } else if (typeSelect.value === "guest") {
    extraField.hidden = false;
    extraLabel.textContent = "Access Code";
    extraInput.placeholder = "Enter access code";
    extraInput.removeAttribute("maxLength");
    extraInput.inputMode = "text";
  } else {
    extraField.hidden = true;
  }
}

function validateForm(event) {
  event.preventDefault();

  const errors = [];

  const firstName = document.querySelector("#firstName").value.trim();
  const lastName = document.querySelector("#lastName").value.trim();
  const email = document.querySelector("#email").value.trim();
  const type = typeSelect.value;
  const selectedDate = eventDate.value;
  const extraValue = extraInput.value.trim();

  if (firstName === "") {
    errors.push("First name is required.");
  }

  if (lastName === "") {
    errors.push("Last name is required.");
  }

  if (email === "") {
    errors.push("Email is required.");
  } else if (!validEmail(email)) {
    errors.push("Please enter a valid email address.");
  }

  if (type === "") {
    errors.push("Please choose Student or Guest.");
  }

  if (selectedDate === "") {
    errors.push("Event date is required.");
  } else if (!dateIsAfterToday(selectedDate)) {
    errors.push("Event date must be later than the current date.");
  }

  if (type === "student") {
    if (!/^\d{9}$/.test(extraValue)) {
      errors.push("Student I# must be 9 digits.");
    }
  }

  if (type === "guest") {
    if (extraValue !== "EVENT131") {
      errors.push("Access Code is invalid.");
    }
  }

  if (errors.length > 0) {
    showErrors(errors);
    return;
  }

  showTicket(firstName, lastName, email, type, selectedDate, extraValue);
}

function showErrors(errors) {
  messages.innerHTML = `
    <div class="error-box">
      <div class="error-list">
        ${errors.map(error => `<p class="error-message">${error}</p>`).join("")}
      </div>
    </div>
  `;
}

function showTicket(firstName, lastName, email, type, selectedDate, extraValue) {

  messages.innerHTML = `
      <h2>Ticket Created!</h2>
      <p> ${firstName} ${lastName}</p>
      <p> ${selectedDate}</p>
      ${type}
  `;

  form.reset();
  extraField.hidden = true;
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function dateIsAfterToday(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = makeLocalDate(dateString);

  return selected > today;
}

function makeLocalDate(dateString) {
  const parts = dateString.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  return new Date(year, month, day);
}

function getTomorrowString() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return dateToInputValue(tomorrow);
}

function dateToInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const date = makeLocalDate(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}