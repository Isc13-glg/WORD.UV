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

// 🌍 Cities
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

// 🔎 search
search?.addEventListener("input", (e) => {
  const filtered = cities.filter(c =>
    c.toLowerCase().includes(e.target.value.toLowerCase())
  );
  renderCities(filtered);
});

// ☀️ UV message
function getMessage(uv) {
  if (uv <= 2) return "🧊 Safe UV level.";
  if (uv <= 5) return "😎 Moderate UV.";
  if (uv <= 7) return "☀️ High UV warning.";
  if (uv <= 10) return "🔥 EXTREME UV.";
  return "☠️ CRITICAL DANGER.";
}

// 🎤 voice
function speakUV(uv) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  let text = `UV index is ${uv}.`;

  if (uv <= 2) text += " Low risk.";
  else if (uv <= 5) text += " Moderate exposure.";
  else if (uv <= 7) text += " High UV warning.";
  else if (uv <= 10) text += " Extreme UV detected.";
  else text += " Critical danger level.";

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-US";
  msg.rate = 1;

  window.speechSynthesis.speak(msg);
}

// 🔊 alarm ≥ 6.5
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

  L.marker([lat, lon])
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  setTimeout(() => {
    map.invalidateSize();
  }, 300);
}

// 🚀 START (APPLE-LIKE UV LOGIC)
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

    // ☀️ APPLE-LIKE UV REQUEST
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index&hourly=cloud_cover&timezone=auto`;

    try {

      const res = await fetch(url);
      const data = await res.json();

      // ☀️ base UV
      let uv = data.current?.uv_index ?? 0;

      // ☁️ cloud adjustment (Apple-like smoothing)
      const hour = new Date().getHours();
      const cloud = data.hourly?.cloud_cover?.[hour] ?? 0;

      const cloudFactor = 1 - (cloud / 100) * 0.6;
      uv = uv * cloudFactor;

      uv = Math.round(uv * 10) / 10;

      // UI
      statusText.style.display = "none";
      result.classList.remove("hidden");

      uvValue.textContent = `Current UV Index: ${uv}`;
      message.textContent = getMessage(uv);

      // ☀️ TOP OF DAY
      topOfDay.textContent = `☀️ Today's peak UV in your area is ${uv}`;

      initMap(lat, lon);
      speakUV(uv);
      playAlarm(uv);

    } catch (e) {
      statusText.textContent = "UV system failed — retry.";
    }

  }, () => {
    statusText.textContent = "Location permission denied.";
  });

});
