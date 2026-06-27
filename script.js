const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");
const weatherBox = document.getElementById("weatherBox");
const uvBox = document.getElementById("uvBox");
const msg = document.getElementById("msg");
const alarm = document.getElementById("alarm");

let map;
let unlocked = false;

---

# 🔊 VOICE (FIXED FOR IPHONE + CHROME)

function speak(text){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

---

# ☀️ UV MESSAGE

function uvMessage(uv){
  if(uv <= 2) return "Low UV – Safe";
  if(uv <= 5) return "Moderate UV";
  if(uv <= 7) return "High UV – Be careful";
  return "Extreme UV – Avoid sun";
}

---

# 🌤️ WEATHER MESSAGE

function weatherMessage(temp){
  if(temp < 10) return "Cold";
  if(temp < 20) return "Mild";
  if(temp < 30) return "Warm";
  return "Hot";
}

---

# 🔊 ALARM (ONLY UV ≥ 6.5)

function playAlarm(uv){
  if(uv >= 6.5 && unlocked){
    alarm.currentTime = 0;
    alarm.play().catch(()=>{});
  }
}

---

# 🗺️ FIXED MAP (NO GREY BUG)

function loadMap(lat,lon){

  setTimeout(() => {

    if(map){
      map.remove();
      map = null;
    }

    map = L.map("map").setView([lat,lon], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:"© OpenStreetMap"
    }).addTo(map);

    L.marker([lat,lon]).addTo(map);

    setTimeout(() => map.invalidateSize(true), 500);

  }, 300);
}

---

# 🌍 WEATHER + UV FETCH

async function getData(lat,lon){

  const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,uv_index,cloud_cover&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  const now = new Date();
  const times = data.hourly.time;

  let i = 0;
  let best = 999999;

  for(let x=0;x<times.length;x++){
    const d = Math.abs(new Date(times[x]) - now);
    if(d < best){ best = d; i = x; }
  }

  let temp = data.hourly.temperature_2m[i];
  let uv = data.hourly.uv_index[i];
  const cloud = data.hourly.cloud_cover[i] ?? 0;

  uv = uv * (1 - (cloud/100)*0.65);
  uv = Math.max(0,Math.min(11,uv));
  uv = Math.round(uv*10)/10;

  return {temp, uv};
}

---

# 🚀 START BUTTON

startBtn.onclick = () => {

  unlocked = true;

  navigator.geolocation.getCurrentPosition(async pos => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    status.textContent = "Loading weather...";

    loadMap(lat,lon);

    const {temp, uv} = await getData(lat,lon);

    result.classList.remove("hidden");

    weatherBox.textContent =
      `🌡️ Temperature: ${temp}°C`;

    uvBox.textContent =
      `☀️ UV Index: ${uv}`;

    msg.textContent =
      `${weatherMessage(temp)} | ${uvMessage(uv)}`;

    speak(`Current temperature is ${temp} degrees. UV index is ${uv}`);

    playAlarm(uv);

    status.style.display = "none";

  });

};
