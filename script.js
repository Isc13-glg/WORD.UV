const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const warning = document.getElementById("warning");
const alarm = document.getElementById("alarm");
const cityList = document.getElementById("cityList");

let map;

// 🌍 Cities (alphabetical incl. Paphos)
const cities = [
  "Amsterdam", "Athens", "Berlin", "Brussels", "Bucharest",
  "Budapest", "Copenhagen", "Dublin", "Helsinki", "Kyiv",
  "Lisbon", "London", "Madrid", "Nicosia", "Oslo",
  "Paris", "Paphos", "Prague", "Rome", "Sofia", "Vienna", "Warsaw"
].sort();

function renderCities() {
  cityList.innerHTML = "";
  cities.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    cityList.appendChild(li);
  });
}

renderCities();

// 🔥 THREAT LEVEL SYSTEM
function setThreat(uv) {
  const threat = document.getElementById("threatLevel");

  if (uv <= 2) {
    threat.textContent = "THREAT LEVEL: LOW";
    threat.style.color = "lime";
  }
  else if (uv <= 5) {
    threat.textContent = "THREAT LEVEL: MODERATE";
    threat.style.color = "yellow";
  }
  else if (uv <= 7) {
    threat.textContent = "THREAT LEVEL: HIGH";
    threat.style.color = "orange";
  }
  else {
    threat.textContent = "THREAT LEVEL: EXTREME";
    threat.style.color = "red";
  }
}

// ☀️ Greek-style messages
function getMsg(uv) {
  if (uv <= 2) return "🧊 Safe. Κυριακή Ανδρέου μπορεί να κινηθεί.";
  if (uv <= 5) return "😎 Moderate UV detected.";
  if (uv <= 7) return "☀️ High UV warning.";
  if (uv <= 10) return "🔥 EXTREME UV — stay indoors.";
  return "☠️ CRITICAL SYSTEM ALERT";
}

// 🔊 alarm
function playAlarm() {
  alarm.play().catch(() => {});
}

// 🗺️ MAP INIT
function initMap(lat, lon, uv) {

  map = L.map('map').setView([lat, lon], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup("📍 MONITORED LOCATION")
    .openPopup();

  // 🔴 DANGER ZONE
  let circle = L.circle([lat, lon], {
    radius: uv * 200,
    color: "red",
    fillColor: "#ff0000",
    fillOpacity: 0.25
  }).addTo(map);

  // 🔥 MOVING PULSE EFFECT
  let grow = true;

  setInterval(() => {
    let r = circle.getRadius();

    if (grow) {
      r += 60;
      if (r > uv * 500) grow = false;
    } else {
      r -= 60;
      if (r < uv * 150) grow = true;
    }

    circle.setRadius(r);
  }, 120);

  // 🔧 FIX MAP RENDER BUG (Chrome/Safari)
  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}

// 🚀 START SYSTEM (WORKS ON ALL BROWSERS)
startBtn.addEventListener("click", () => {

  status.textContent = "Scanning satellite network...";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {

      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;

      const res = await fetch(url);
      const data = await res.json();

      const uv = data.daily.uv_index_max[0];

      // UI update
      status.style.display = "none";
      warning.textContent = getMsg(uv);

      setThreat(uv);
      initMap(lat, lon, uv);

      if (uv >= 7) {
        playAlarm();
      }

    },
    (err) => {
      status.textContent = "❌ Location access denied in browser settings.";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );

});
