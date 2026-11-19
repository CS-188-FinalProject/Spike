
const USERNAME_PATTERN = /^[a-zA-Z0-9]{1,20}$/;
const PASSWORD_PATTERN = /^[\x21-\x7E]{8,}$/;

function setValid(input) {
	input.classList.remove("is-invalid");
	input.classList.add("is-valid");
}

function setError(input, message) {
	input.classList.add("is-invalid");
	input.classList.remove("is-valid");
	const feedback = input.parentElement.querySelector(".invalid-feedback");
	if (feedback) {
		feedback.textContent = message;
	}
}

function validatePassword(id) {
	const password = document.getElementById(id);
	// .test() checks whether the text matches the regular expression.
	// .value is the text the user typed into the input.
	if (!PASSWORD_PATTERN.test(password.value)) {
		setError(password, "Password must be at least 8 characters with no spaces.");
		return false;
	}
	setValid(password);
	return true;
}

function validateUsername(id) {
	const username = document.getElementById(id);
	if (!USERNAME_PATTERN.test(username.value)) {
		setError(username, "Username must be alphanumeric and at most 20 characters.");
		return false;
	}
	setValid(username);
	return true;
}

function validateDisplayName(id) {
	const displayName = document.getElementById(id);
	// .trim() removes spaces from both ends, so "   " counts as empty.
	if (displayName.value.trim() === "") {
		setError(displayName, "Display name cannot be empty.");
		return false;
	}
	setValid(displayName);
	return true;
}

function hideModal(id) {
	const modal = bootstrap.Modal.getInstance(document.getElementById(id));
	// ?. means "only call hide() if getInstance found something".
	modal?.hide();
}

async function postJson(url, data) {
	try {
		const response = await fetch(url, {
			method: "POST", // We are sending data, so we use POST
			headers: { "Content-Type": "application/json" }, // Tell the server the body is JSON
			body: JSON.stringify(data), // Turn the JavaScript object into a JSON string
		});
		const result = await response.json();
		return { response, result };
	} catch {
		// fetch() throws if the server can't be reached, and .json() throws if the
		// server sent back something that isn't JSON (like an HTML error page).
		return null;
	}
}

// Runs when the register form is submitted.
async function submitRegisterForm(event) {
	// Without this, the browser would submit the form itself and reload the page,
	// and our code below would never get to send the request.
	event.preventDefault();

	let isValid = validatePassword("registerPassword");
	isValid = validateUsername("registerUsername") && isValid;
	isValid = validateDisplayName("registerDisplayName") && isValid;
	if (!isValid) {
		return;
	}

	// The keys here must match what the server reads in Register.post().
	const formData = {
		username: document.getElementById("registerUsername").value,
		password: document.getElementById("registerPassword").value,
		displayName: document.getElementById("registerDisplayName").value,
	};

	const reply = await postJson("/register", formData);
	if (reply === null) {
		alert("Could not reach the server. Please try again.");
		return;
	}

	// response.ok is true for status codes 200-299 (we send 201 on success).
	if (!reply.response.ok) {
		alert("Registration failed: " + reply.result.message);
		return;
	}

	alert("Registration successful! Welcome, " + reply.result.displayName);
	hideModal("registerModal");
}

async function submitLoginForm(event) {

	event.preventDefault();

	let isValid = validatePassword("loginPassword");
	isValid = validateUsername("loginUsername") && isValid;
	if (!isValid) {
		return;
	}

	const formData = {
		username: document.getElementById("loginUsername").value,
		password: document.getElementById("loginPassword").value
	}

	const reply = await postJson("/login", formData);
	if (reply === null) {
		alert("Could not reach the server. Please try again.");
		return;
	}

	if (!reply.response.ok) {
		alert("Login failed: " + reply.result.message);
		return;
	}

	window.location.href = "/account";

	alert(reply.result.message);
	hideModal("loginModal");
}

async function logout() {
	const reply = await postJson("/logout", {});
	if (reply == null || !reply.response.ok) {
		alert("Logout failed. Please try again.");
		return;
	}
	window.location.href ="/";
}

async function logoutall() {
	const reply = await postJson("/logoutall", {});
	if (reply == null || !reply.response.ok) {
		alert("Logout failed. Please try again.");
		return;
	}
}

function clearValidation(event) {
	event.target.classList.remove("is-invalid", "is-valid");
}

function resetModalForms(event) {
	for (const form of event.target.querySelectorAll("form")) {
		// reset() puts every input in the form back to its starting value.
		form.reset();
		// reset() doesn't know about Bootstrap's classes, so we remove them ourselves.
		for (const input of form.querySelectorAll(".is-valid, .is-invalid")) {
			input.classList.remove("is-valid", "is-invalid");
		}
	}
}

function attachEventListeners() {
	// ?. means "only call addEventListener if the element exists". Every page
	// includes this script, but a page might not have every form on it.
	document.getElementById("registerForm")?.addEventListener("submit", submitRegisterForm);
	document.getElementById("loginForm")?.addEventListener("submit", submitLoginForm);
	document.getElementById("logoutButton").addEventListener("click", logout);
	document.getElementById("logoutAllButton").addEventListener("click", logoutall);

	for (const input of document.querySelectorAll("input")) {
		input.addEventListener("input", clearValidation);
	}

	for (const modal of document.querySelectorAll(".modal")) {
		modal.addEventListener("hidden.bs.modal", resetModalForms);
	}
}

// Run attachEventListeners once the page's HTML has loaded. If it has already
// loaded by the time this script runs, run it right away. Otherwise, wait for
// the DOMContentLoaded event.
function onReady(callback) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", callback);
	} else {
		callback();
	}
}

// The only top-level code in this file. Everything else happens in functions.
onReady(attachEventListeners);
