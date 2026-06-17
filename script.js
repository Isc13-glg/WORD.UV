const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const uvValue = document.getElementById("uvValue");
const message = document.getElementById("message");
const result = document.getElementById("result");
const alarm = document.getElementById("alarm");
const cityList = document.getElementById("cityList");
const search = document.getElementById("search");

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

// ☀️ UV messages
function getMessage(uv) {
  if (uv <= 2) return "🧊 Safe UV level.";
  if (uv <= 5) return "😎 Moderate UV.";
  if (uv <= 7) return "☀️ High UV warning.";
  if (uv <= 10) return "🔥 EXTREME UV.";
  return "☠️ CRITICAL DANGER.";
}

//
// 🎤 FIXED iPhone + ALL BROWSERS VOICE
//
function speakUV(uv) {

  if (!("speechSynthesis" in window)) return;

  // IMPORTANT FIX FOR iOS: cancel + resume
  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance();

  let text = `UV index is ${uv}.`;

  if (uv <= 2) text += " Low risk.";
  else if (uv <= 5) text += " Moderate exposure.";
  else if (uv <= 7) text += " High UV warning.";
  else if (uv <= 10) text += " Extreme UV detected.";
  else text += " Critical danger level.";

  msg.text = text;
  msg.lang = "en-US";
  msg.rate = 1;

  // 🔥 iPhone FIX: small delay helps Safari actually speak
  setTimeout(() => {
    window.speechSynthesis.speak(msg);
  }, 150);
}

// 🔊 alarm
function playAlarm(uv) {
  if (uv >= 7 && audioUnlocked) {
    alarm.currentTime = 0;
    alarm.play().catch(() => {});
  }
}

// 📳 vibration (Android only)
function vibratePhone(uv) {
  if (!("vibrate" in navigator)) return;

  if (uv >= 7) {
    navigator.vibrate([200, 100, 200, 100, 500]);
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

// 🚀 START BUTTON
startBtn.addEventListener("click", () => {

  statusText.textContent = "Activating system...";

  // 🔓 unlock audio (CRITICAL FOR iPHONE)
  audioUnlocked = true;

  // force audio permission unlock
  alarm.play().then(() => {
    alarm.pause();
    alarm.currentTime = 0;
  }).catch(() => {});

  // also unlock speech on iOS
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    const uv = data.daily.uv_index_max[0];

    statusText.style.display = "none";
    result.classList.remove("hidden");

    uvValue.textContent = `UV INDEX: ${uv}`;
    message.textContent = getMessage(uv);

    initMap(lat, lon);

    // 🔥 ALL ALERT SYSTEMS
    speakUV(uv);       // FIXED iPhone speech
    playAlarm(uv);
    vibratePhone(uv);

  }, () => {
    statusText.textContent = "Location permission denied.";
  });

});
