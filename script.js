
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const uvValue = document.getElementById("uvValue");
const message = document.getElementById("message");
const topOfDay = document.getElementById("topOfDay");
const result = document.getElementById("result");
const alarm = document.getElementById("alarm");

let map;
let audioUnlocked = false;

// 🌍 sample countries (you can expand later)
const countries = [
  {name:"Cyprus",lat:35.1856,lon:33.3823},
  {name:"Greece",lat:37.9838,lon:23.7275},
  {name:"France",lat:48.8566,lon:2.3522},
  {name:"Germany",lat:52.52,lon:13.405},
  {name:"United Kingdom",lat:51.5072,lon:-0.1276},
  {name:"United States",lat:38.9072,lon:-77.0369}
];

// ---------------- MESSAGE ----------------
function getMessage(uv){
  if(uv<=2) return "Safe UV";
  if(uv<=5) return "Moderate UV";
  if(uv<=7) return "High UV";
  if(uv<=10) return "Extreme UV";
  return "Danger";
}

// ---------------- VOICE ----------------
function speak(text){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ---------------- ALARM (FIXED) ----------------
function playAlarm(uv){
  if(uv >= 6.5 && audioUnlocked){
    alarm.currentTime = 0;
    alarm.play().catch(()=>{});
  }
}

// ---------------- MAP FIX ----------------
function mapInit(lat,lon){
  setTimeout(()=>{

    if(map){
      map.remove();
      map = null;
    }

    map = L.map("map").setView([lat,lon], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:"© OpenStreetMap"
    }).addTo(map);

    L.marker([lat,lon]).addTo(map);

    setTimeout(()=>map.invalidateSize(),400);

  },200);
}

// ---------------- START ----------------
startBtn.onclick = async () => {

  audioUnlocked = true;

  navigator.geolocation.getCurrentPosition(async pos => {

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    mapInit(lat,lon);

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index,cloud_cover&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    const times = data.hourly.time;
    const uvArr = data.hourly.uv_index;
    const cloudArr = data.hourly.cloud_cover;

    const now = new Date();

    // ---------------- CURRENT UV ----------------
    let idx = 0;
    let best = Infinity;

    for(let i=0;i<times.length;i++){
      const diff = Math.abs(new Date(times[i]) - now);
      if(diff < best){
        best = diff;
        idx = i;
      }
    }

    let currentUV = uvArr[idx];
    const cloud = cloudArr[idx] ?? 0;

    currentUV = currentUV * (1 - (cloud/100)*0.65);
    currentUV = Math.max(0,Math.min(11,currentUV));
    currentUV = Math.round(currentUV*10)/10;

    // ---------------- TOP OF DAY (FIXED MAX) ----------------
    let maxUV = 0;

    for(let i=0;i<uvArr.length;i++){
      let u = uvArr[i];
      const c = cloudArr[i] ?? 0;

      u = u * (1 - (c/100)*0.65);

      if(u > maxUV) maxUV = u;
    }

    maxUV = Math.round(maxUV*10)/10;

    // ---------------- UI ----------------
    statusText.style.display = "none";
    result.classList.remove("hidden");

    uvValue.textContent = `Current UV: ${currentUV}`;
    message.textContent = getMessage(currentUV);

    topOfDay.textContent = `☀️ Today's peak UV: ${maxUV}`;

    // ---------------- ACTIONS ----------------
    speak(`Current UV is ${currentUV}`);
    playAlarm(currentUV);

  });

};
