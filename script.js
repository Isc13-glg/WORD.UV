const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const panel = document.getElementById("panel");
const uvText = document.getElementById("uvText");
const warning = document.getElementById("warning");
const alarm = document.getElementById("alarm");

const cityList = document.getElementById("cityList");
const search = document.getElementById("search");

// 🌍 small sample (alphabetical Europe incl. Paphos)
const cities = [
  "Amsterdam", "Athens", "Berlin", "Brussels", "Bucharest",
  "Budapest", "Copenhagen", "Dublin", "Helsinki", "Kyiv",
  "Lisbon", "London", "Madrid", "Nicosia", "Oslo",
  "Paris", "Paphos", "Prague", "Rome", "Sofia", "Vienna", "Warsaw"
].sort();

function renderCities(list) {
  cityList.innerHTML = "";
  list.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    cityList.appendChild(li);
  });
}

renderCities(cities);

// search filter
search?.addEventListener("input", e => {
  const filtered = cities.filter(c =>
    c.toLowerCase().includes(e.target.value.toLowerCase())
  );
  renderCities(filtered);
});

// UV messages
function getMsg(uv) {
  if (uv <= 2) return "🧊 Safe zone. Κυριακή Ανδρέου may proceed.";
  if (uv <= 5) return "😎 Moderate UV. Some risk detected.";
  if (uv <= 7) return "☀️ High UV. Protective action advised.";
  if (uv <= 10) return "🔥 EXTREME UV ALERT — STAY INDOORS.";
  return "☠️ CRITICAL RADIATION LEVEL — SYSTEM WARNING";
}

// SOUND
function playAlarm() {
  alarm.play();
}

// MAP
let map;

function initMap(lat, lon) {
  map = L.map('map').setView([lat, lon], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  L.marker([lat, lon]).addTo(map)
    .bindPopup("You are here (UV monitored zone)")
    .openPopup();
}

// START BUTTON (fixes iPhone issue)
startBtn.addEventListener("click", () => {

  status.textContent = "Requesting location...";

  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    const uv = data.daily.uv_index_max[0];

    status.style.display = "none";
    panel.classList.remove("hidden");

    uvText.textContent = `UV INDEX: ${uv}`;
    warning.textContent = getMsg(uv);

    initMap(lat, lon);

    if (uv >= 7) {
      playAlarm();
    }

  }, () => {
    status.textContent = "Location blocked. Enable permissions in Safari settings.";
  });

});
