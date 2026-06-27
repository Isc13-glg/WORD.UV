
const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const card = document.getElementById("card");

const tempBox = document.getElementById("temp");
const uvBox = document.getElementById("uv");
const windBox = document.getElementById("wind");
const humBox = document.getElementById("hum");
const msg = document.getElementById("msg");

const alarm = document.getElementById("alarm");

let map;
let unlocked = false;

// 🔊 VOICE (iPhone safe)
function speak(text){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// 🌈 UV ICONS
function uvIcon(u){
  if(u <= 2) return "☁️";
  if(u <= 5) return "⛅";
  if(u <= 7) return "🌤️";
  return "☀️🔥";
}

// ☀️ UV TEXT
function uvText(u){
  if(u <= 2) return "Low UV";
  if(u <= 5) return "Moderate UV";
  if(u <= 7) return "High UV";
  return "Extreme UV";
}

// 🔊 ALARM
function playAlarm(uv){
  if(uv >= 6.5 && unlocked){
    alarm.currentTime = 0;
    alarm.play().catch(()=>{});
  }
}

// 🗺️ FIX MAP (NO GRAY SCREEN BUG)
function loadMap(lat,lon){

  setTimeout(()=>{

    if(map){
      map.remove();
      map = null;
    }

    map = L.map("map").setView([lat,lon], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:"© OpenStreetMap"
    }).addTo(map);

    L.marker([lat,lon]).addTo(map);

    setTimeout(()=>map.invalidateSize(true),500);

  },300);
}

// 🌍 WEATHER API
async function getWeather(lat,lon){

  const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,uv_index,wind_speed_10m,relative_humidity_2m&timezone=auto`;

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

  return {
    temp: data.hourly.temperature_2m[i],
    uv: data.hourly.uv_index[i],
    wind: data.hourly.wind_speed_10m[i],
    hum: data.hourly.relative_humidity_2m[i]
  };
}

// 🚀 START BUTTON (FIXED)
startBtn.onclick = () => {

  unlocked = true;
  status.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(async pos => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    loadMap(lat,lon);

    const w = await getWeather(lat,lon);

    card.classList.remove("hidden");
    status.style.display = "none";

    tempBox.innerHTML = `🌡️ Temp: <b>${w.temp}°C</b>`;
    uvBox.innerHTML = `${uvIcon(w.uv)} UV: <b>${w.uv}</b>`;
    windBox.innerHTML = `💨 Wind: <b>${w.wind} km/h</b>`;
    humBox.innerHTML = `💧 Humidity: <b>${w.hum}%</b>`;

    msg.textContent = uvText(w.uv);

    speak(`Temperature is ${w.temp} degrees. UV is ${w.uv}`);

    playAlarm(w.uv);

  },
  err => {
    status.textContent = "Location blocked or unavailable";
  });

};
