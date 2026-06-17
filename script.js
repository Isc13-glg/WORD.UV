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

// 🌍 Europe cities
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

// 🎤 FIXED iPHONE VOICE
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

  setTimeout(() => {
    window.speechSynthesis.speak(msg);
  }, 150);
}

// 🔊 alarm (mobile safe)
function playAlarm(uv) {
  if (uv >= 7 && audioUnlocked) {
    alarm.currentTime = 0;
    alarm.play().catch(() => {});
  }
}

// 🗺️ MAP FIX (Safari + Chrome safe)
function initMap(lat, lon) {

  if (map) {
    map.remove();
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
}

// 🚀 START BUTTON (iPHONE SAFE — NO FREEZE)
startBtn.addEventListener("click", () => {

  statusText.textContent = "Activating system...";

  audioUnlocked = true;

  // 🔓 unlock audio on iOS
  alarm.play().then(() => {
    alarm.pause();
    alarm.currentTime = 0;
  }).catch(() => {});

  // ⏱️ SAFETY: prevents infinite loading on iPhone
  let failSafe = setTimeout(() => {
    statusText.textContent = "System delay — try again.";
  }, 8000);

  navigator.geolocation.getCurrentPosition(async (pos) => {

    clearTimeout(failSafe);

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=uv_index_max&timezone=auto`;

      const res = await fetch(url);
      const data = await res.json();

      const uv = data?.daily?.uv_index_max?.[0] ?? 0;

      // ✅ ALWAYS UPDATE UI (iPHONE FIX)
      requestAnimationFrame(() => {

        statusText.style.display = "none";
        result.classList.remove("hidden");

        uvValue.textContent = `UV INDEX: ${uv}`;
        message.textContent = getMessage(uv);

        initMap(lat, lon);

        speakUV(uv);
        playAlarm(uv);

      });

    } catch (e) {
      statusText.textContent = "UV fetch failed — retry.";
    }

  }, () => {

    clearTimeout(failSafe);

    statusText.textContent =
      "Location permission denied — enable Safari location.";

  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });

});
