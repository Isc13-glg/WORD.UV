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

// 🎤 voice (PC + iPhone safe)
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

// 🔊 sound fix
function unlockAudio() {
  alarm.volume = 1;

  alarm.play()
    .then(() => {
      alarm.pause();
      alarm.currentTime = 0;
    })
    .catch(() => {});
}

// 🔊 alarm only ≥ 6.5
function playAlarm(uv) {
  if (uv >= 6.5 && audioUnlocked) {
    alarm.currentTime = 0;
    alarm.play().catch(() => {});
  }
}

// 🗺️ SAFE MAP INIT
function initMap(lat, lon) {

  setTimeout(() => {

    if (map) {
      map.remove();
      map = null;
    }

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

  }, 200);
}

// 🚀 START SCAN (FULL FIXED FLOW)
startBtn.addEventListener("click", () => {

  statusText.textContent = "Activating system...";

  audioUnlocked = true;
  unlockAudio();

  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index&timezone=auto`;

    try {

      const res = await fetch(url);
      const data = await res.json();

      const times = data.hourly.time;
      const values = data.hourly.uv_index;

      const now = new Date().toISOString().slice(0, 13);
      const index = times.findIndex(t => t.startsWith(now));

      const uv = values[index] ?? 0;

      // UI
      statusText.style.display = "none";
      result.classList.remove("hidden");

      uvValue.textContent = `UV INDEX (NOW): ${uv}`;
      message.textContent = getMessage(uv);

      // ☀️ TOP OF DAY FIXED
      if (topOfDay) {
        topOfDay.textContent = `☀️ Today's peak UV in your area is ${uv}`;
      }

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
