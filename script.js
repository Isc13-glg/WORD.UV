
const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const result = document.getElementById("result");
const uvBox = document.getElementById("uvBox");
const msg = document.getElementById("msg");
const alarm = document.getElementById("alarm");

let map;
let unlocked = false;

// 🌍 SIMPLE COUNTRIES
const countries = [
  {name:"Cyprus",lat:35.1856,lon:33.3823},
  {name:"Greece",lat:37.9838,lon:23.7275},
  {name:"France",lat:48.8566,lon:2.3522},
  {name:"Germany",lat:52.52,lon:13.405},
  {name:"USA",lat:38.9072,lon:-77.0369}
];

// 🔊 alarm
function playAlarm(uv){
  if(uv >= 6.5 && unlocked){
    alarm.currentTime = 0;
    alarm.play().catch(()=>{});
  }
}

// ☀️ UV message
function getMsg(uv){
  if(uv <= 2) return "Safe";
  if(uv <= 5) return "Moderate";
  if(uv <= 7) return "High";
  return "Danger";
}

// 🗺️ FIXED MAP (NO GRAY BUG)
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

    setTimeout(() => map.invalidateSize(true), 600);

  }, 300);
}

// 🌍 UV FETCH
async function getUV(lat,lon){

  const url =
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index,cloud_cover&timezone=auto`;

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

  let uv = data.hourly.uv_index[i];
  const cloud = data.hourly.cloud_cover[i] ?? 0;

  uv = uv * (1 - (cloud/100)*0.65);
  uv = Math.max(0,Math.min(11,uv));
  uv = Math.round(uv*10)/10;

  return uv;
}

// 🚀 START
startBtn.onclick = () => {

  unlocked = true;

  navigator.geolocation.getCurrentPosition(async pos => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    status.textContent = "Loading UV...";

    loadMap(lat,lon);

    const uv = await getUV(lat,lon);

    result.classList.remove("hidden");

    uvBox.textContent = "UV: " + uv;
    msg.textContent = getMsg(uv);

    playAlarm(uv);

    status.style.display = "none";

  });

};
