const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const panel = document.getElementById("panel");
const uvText = document.getElementById("uvText");
const warning = document.getElementById("warning");
const alarm = document.getElementById("alarm");

const cityList = document.getElementById("cityList");
const search = document.getElementById("search");

// 🌍 Europe cities (alphabetical incl. Paphos)
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

search?.addEventListener("input", (e) => {
  const filtered = cities.filter(c =>
    c.toLowerCase().includes(e.target.value.toLowerCase())
  );
  renderCities(filtered);
});

// ☀️ UV messages (Greek prank style)
function getMsg(uv) {
  if (uv <= 2) return "🧊 Safe zone. Κυριακή Ανδρέου μπορεί να κυκλοφορεί.";
  if (uv <= 5) return "😎 Moderate UV. Βάλε λίγο αντηλιακό.";
  if (uv <= 7) return "☀️ Προσοχή. Ο ήλιος είναι δυνατός.";
  if (uv <= 10) return "🔥 EXTREME UV — ΜΗΝ ΠΑΣ ΕΞΩ.";
  return "☠️ ΚΡΙΣΙΜΟ ΕΠΙΠΕΔΟ — SYSTEM ALERT";
}

// 🔊 alarm sound
function playAlarm() {
  alarm.play().catch(() => {});
}

// 🗺️ MAP
let map;
let dangerCircle;

function initMap(lat, lon, uv) {

  map = L.map('map').setView([lat, lon], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  // 🔴 MOVING DANGER ZONE
  let radius = uv * 200;

  dangerCircle = L.circle([lat, lon], {
    radius: radius,
    color: "red",
    fillColor: "#ff0000",
    fillOpacity: 0.25
  }).addTo(map);

  let grow = true;

  setInterval(() => {
    if (!dangerCircle) return;

    let r = dangerCircle.getRadius();

    if (grow) {
      r += 50;
      if (r > uv * 450) grow = false;
    } else {
      r -= 50;
      if (r < uv * 150) grow = true;
    }

    dangerCircle.setRadius(r);
  }, 120);

  // 🔥 FIX CHROME/SAFARI MAP RENDER ISSUE
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}

// 🚀 START BUTTON (SAFE FOR CHROME + SAFARI + iPHONE)
startBtn.addEventListener("click", () => {

  status.textContent = "Scanning location...";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {

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

      initMap(lat, lon, uv);

      if (uv >= 7) {
        playAlarm();
      }

    },
    (err) => {
      status.textContent = "❌ Enable location permissions in browser settings.";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );

});
