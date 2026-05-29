const form = document.querySelector("#checkin-form");
const status = document.querySelector("#checkin-status");

function cleanFormData(formData) {
  return Object.fromEntries(
    [...formData.entries()].map(([key, value]) => [key, String(value).trim()])
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "Saving...";

  const payload = cleanFormData(new FormData(form));
  payload.createdAt = new Date().toISOString();

  try {
    const response = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Save failed");
    form.reset();
    status.textContent = "You're all set.";
  } catch {
    status.textContent = "Could not save right now. Try again in a minute.";
  }
});
