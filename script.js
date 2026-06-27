
const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const card = document.getElementById("card");

const tempBox = document.getElementById("tempBox");
const uvBox = document.getElementById("uvBox");
const windBox = document.getElementById("windBox");
const humidBox = document.getElementById("humidBox");
const message = document.getElementById("message");

const alarm = document.getElementById("alarm");

let map;
let unlocked = false;

// 🔊 voice
function speak(text){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ☀️ UV message
function uvMsg(u){
  if(u <= 2) return "Low UV";
  if(u <= 5) return "Moderate UV";
  if(u <= 7) return "High UV";
  return "Extreme UV";
}

// 🔊 alarm
function playAlarm(uv){
  if(uv >= 6.5 && unlocked){
    alarm.currentTime = 0;
    alarm.play().catch(()=>{});
  }
}

// 🗺️ FIXED MAP (NO GREY BUG)
function loadMap(lat,lon){

  setTimeout(() => {

    if(map){
      map.remove();
      map = null;
    }

    map = L.map("map").setView([lat,lon], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:"© OpenStreetMap"
    }).addTo(map);

    L.marker([lat,lon]).addTo(map);

    setTimeout(() => map.invalidateSize(true), 600);

  }, 300);
}

// 🌍 REAL WEATHER API
async function getWeather(lat,lon){

  const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,uv_index,relative_humidity_2m,wind_speed_10m&timezone=auto`;

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

// 🚀 START
startBtn.onclick = () => {

  unlocked = true;

  navigator.geolocation.getCurrentPosition(async pos => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    status.textContent = "Loading weather...";

    loadMap(lat,lon);

    const w = await getWeather(lat,lon);

    card.classList.remove("hidden");
    status.style.display = "none";

    tempBox.textContent = `🌡️ ${w.temp}°C`;
    uvBox.textContent = `☀️ UV ${w.uv}`;
    windBox.textContent = `💨 ${w.wind} km/h`;
    humidBox.textContent = `💧 ${w.hum}%`;

    message.textContent = uvMsg(w.uv);

    speak(`Temperature is ${w.temp} degrees. UV index is ${w.uv}`);

    playAlarm(w.uv);

  });

};
