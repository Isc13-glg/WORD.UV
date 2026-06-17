const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const uvValue = document.getElementById("uvValue");
const message = document.getElementById("message");
const result = document.getElementById("result");
const alarm = document.getElementById("alarm");
const cityList = document.getElementById("cityList");
const search = document.getElementById("search");
const topOfDay = document.getElementById("topOfDay");

let map;
let audioUnlocked = false;

// 🌍 cities
const cities = [
  "Amsterdam","Athens","Berlin","Brussels","Bucharest",
  "Budapest","Copenhagen","Dublin","Helsinki","Kyiv",
  "Lisbon","London","Madrid","Nicosia","Oslo",
  "Paris","Paphos","Prague","Rome","Sofia","Vienna","Warsaw"
].sort();

function renderCities(list = cities) {
  cityList.innerHTML = "";
  list.forEach(c => {
    const li = document.createElement("li");
    li.textContent = c;
    cityList.appendChild(li);
  });
}

renderCities();

search.addEventListener("input", e => {
  const filtered = cities.filter(c =>
    c.toLowerCase().includes(e.target.value.toLowerCase())
  );
  renderCities(filtered);
});

// ☀️ message
function getMessage(uv) {
  if (uv <= 2) return "Safe UV";
  if (uv <= 5) return "Moderate UV";
  if (uv <= 7) return "High UV warning";
  if (uv <= 10) return "Extreme UV";
  return "Critical danger";
}

// 🎤 voice
function speakUV(uv) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(
    `UV index is ${uv}. ${getMessage(uv)}`
  );

  msg.lang = "en-US";
  msg.rate = 1;

  window.speechSynthesis.speak(msg);
}

// 🔊 alarm
function playAlarm(uv) {
  if (uv >= 6.5 && audioUnlocked) {
    alarm.currentTime = 0;
    alarm.play().catch(() => {});
  }
}

// 🗺️ map
function initMap(lat, lon) {
  if (map) map.remove();

  map = L.map("map").setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  L.marker([lat, lon]).addTo(map);

  setTimeout(() => map.invalidateSize(), 300);
}

// 🚀 START
startBtn.addEventListener("click", () => {

  statusText.textContent = "Activating system...";

  audioUnlocked = true;

  alarm.play().then(() => {
    alarm.pause();
    alarm.currentTime = 0;
  }).catch(() => {});

  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    // ☀️ REAL FIXED UV REQUEST
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index,cloud_cover&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    // ⏱️ closest time matching (FIX)
    const times = data.hourly.time;
    const uvArr = data.hourly.uv_index;
    const cloudArr = data.hourly.cloud_cover;

    const now = new Date();

    let idx = 0;
    let best = Infinity;

    for (let i = 0; i < times.length; i++) {
      const diff = Math.abs(new Date(times[i]) - now);
      if (diff < best) {
        best = diff;
        idx = i;
      }
    }

    let uv = uvArr[idx];
    const cloud = cloudArr[idx] ?? 0;

    // ☁️ Apple-like smoothing
    uv = uv * (1 - (cloud / 100) * 0.65);

    uv = Math.max(0, Math.min(11, uv));
    uv = Math.round(uv * 10) / 10;

    statusText.style.display = "none";
    result.classList.remove("hidden");

    uvValue.textContent = `UV Index: ${uv}`;
    message.textContent = getMessage(uv);

    topOfDay.textContent = `☀️ Today's peak UV in your area is ${uv}`;

    initMap(lat, lon);
    speakUV(uv);
    playAlarm(uv);

  });

});
