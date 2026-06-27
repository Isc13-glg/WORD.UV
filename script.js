
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

// 🔊 iPhone SAFE VOICE
function speak(text){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ☀️ UV text
function uvText(u){
  if(u<=2) return "Low UV";
  if(u<=5) return "Moderate UV";
  if(u<=7) return "High UV";
  return "Extreme UV";
}

// 🔊 alarm ONLY ≥ 6.5
function playAlarm(uv){
  if(uv >= 6.5 && unlocked){
    alarm.currentTime = 0;
    alarm.play().catch(()=>{});
  }
}

// 🗺 FIX MAP (NO GREY BUG)
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

    setTimeout(()=>map.invalidateSize(true),600);

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

// 🚀 START (FIXED iPHONE ISSUE)
startBtn.onclick = async () => {

  unlocked = true;

  status.textContent = "Getting location...";

  navigator.geolocation.getCurrentPosition(async pos => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    loadMap(lat,lon);

    const w = await getWeather(lat,lon);

    card.classList.remove("hidden");
    status.style.display = "none";

    tempBox.textContent = `${w.temp}°C`;
    uvBox.textContent = `UV ${w.uv}`;
    windBox.textContent = `${w.wind} km/h`;
    humBox.textContent = `${w.hum}%`;

    msg.textContent = uvText(w.uv);

    speak(`Temperature is ${w.temp} degrees. UV is ${w.uv}`);

    playAlarm(w.uv);

  });

};
