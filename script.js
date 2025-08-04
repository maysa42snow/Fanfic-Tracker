const ficForm = document.getElementById("fic-form");
const ficsContainer = document.getElementById("fics");
const filterShip = document.getElementById("filterShip");
const filterSize = document.getElementById("filterSize");
const filterStatus = document.getElementById("filterStatus");
const toggleTheme = document.getElementById("toggle-theme");

let fics = JSON.parse(localStorage.getItem("fics")) || [];

function getSizeCategory(words) {
  if (words < 10000) return "Short";
  if (words <= 50000) return "Medium";
  return "Long";
}

function renderFics() {
  const filtered = fics.filter(fic => {
    return (!filterShip.value || fic.ship === filterShip.value) &&
           (!filterSize.value || fic.size === filterSize.value) &&
           (!filterStatus.value || fic.status === filterStatus.value);
  });

  ficsContainer.innerHTML = "";

  filtered.forEach(fic => {
    const ficDiv = document.createElement("div");
    ficDiv.className = "fic";

    const ratingStars = fic.rating ? "★".repeat(fic.rating) + "☆".repeat(10 - fic.rating) : "";

    ficDiv.innerHTML = `
      <strong><a href="${fic.url}" target="_blank">${fic.title}</a></strong> by ${fic.author}<br>
      Ship: ${fic.ship} | ${fic.words} words (${fic.size}) | Chapters: ${fic.chapters}<br>
      Status: 
      <select onchange="updateStatus(${fic.id}, this.value)">
        <option ${fic.status === "To Read" ? "selected" : ""}>To Read</option>
        <option ${fic.status === "Reading" ? "selected" : ""}>Reading</option>
        <option ${fic.status === "Complete" ? "selected" : ""}>Complete</option>
      </select><br>
      ${fic.status === "Reading" ? `
        Progress: <input type="range" min="1" max="${fic.chapters}" value="${fic.currentChapter || 1}"
        oninput="updateChapter(${fic.id}, this.value)" />
        Chapter ${fic.currentChapter || 1}/${fic.chapters}<br>
      ` : ""}
      Summary: ${fic.summary || "None"}<br>
      Notes: ${fic.notes || "None"}<br>
      ${fic.status === "Complete" ? `
        Rating: ${ratingStars}<br>
        Comment: ${fic.finalComment || "None"}<br>
        Favorite: ${fic.favorite ? "❤️" : "No"}
      ` : ""}<br>
      <button onclick="editFic(${fic.id})">Edit</button>
      <button onclick="deleteFic(${fic.id})">Delete</button>
    `;

    ficsContainer.appendChild(ficDiv);
  });
}

function updateStatus(id, newStatus) {
  const fic = fics.find(f => f.id === id);
  if (!fic) return;
  fic.status = newStatus;

  if (newStatus === "Complete") {
    fic.rating = parseInt(prompt("Rate this fic (0–10):", fic.rating || 0)) || 0;
    fic.finalComment = prompt("Leave a final comment:", fic.finalComment || "") || "";
    fic.favorite = confirm("Mark as favorite?");
  }

  localStorage.setItem("fics", JSON.stringify(fics));
  renderFics();
}

function updateChapter(id, chapter) {
  const fic = fics.find(f => f.id === id);
  if (!fic) return;
  fic.currentChapter = parseInt(chapter);
  localStorage.setItem("fics", JSON.stringify(fics));
  renderFics();
}

function deleteFic(id) {
  fics = fics.filter(f => f.id !== id);
  localStorage.setItem("fics", JSON.stringify(fics));
  renderShipOptions();
  renderFics();
}

function editFic(id) {
  const fic = fics.find(f => f.id === id);
  if (!fic) return;

  const title = prompt("Title:", fic.title);
  const author = prompt("Author:", fic.author);
  const url = prompt("URL:", fic.url);
  const ship = prompt("Ship:", fic.ship);
  const chapters = parseInt(prompt("Chapters:", fic.chapters));
  const words = parseInt(prompt("Word count:", fic.words));
  const summary = prompt("Summary:", fic.summary);
  const notes = prompt("Notes:", fic.notes);

  Object.assign(fic, {
    title, author, url, ship, chapters, words, summary, notes,
    size: getSizeCategory(words)
  });

  localStorage.setItem("fics", JSON.stringify(fics));
  renderShipOptions();
  renderFics();
}

ficForm.addEventListener("submit", e => {
  e.preventDefault();
  const newFic = {
    id: Date.now(),
    title: ficForm.title.value,
    url: ficForm.url.value,
    author: ficForm.author.value,
    ship: ficForm.ship.value,
    chapters: parseInt(ficForm.chapters.value),
    words: parseInt(ficForm.words.value),
    summary: ficForm.summary.value,
    notes: ficForm.notes.value,
    status: "To Read",
    rating: null,
    finalComment: "",
    favorite: false,
    currentChapter: 1
  };
  newFic.size = getSizeCategory(newFic.words);
  fics.push(newFic);
  localStorage.setItem("fics", JSON.stringify(fics));
  renderShipOptions();
  renderFics();
  ficForm.reset();
});

function renderShipOptions() {
  const ships = [...new Set(fics.map(f => f.ship))];
  filterShip.innerHTML = '<option value="">All Ships</option>' +
    ships.map(s => `<option value="${s}">${s}</option>`).join("");
}

filterShip.addEventListener("change", renderFics);
filterSize.addEventListener("change", renderFics);
filterStatus.addEventListener("change", renderFics);

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  toggleTheme.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

renderShipOptions();
renderFics();