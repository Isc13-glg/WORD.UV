
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");
const result = document.getElementById("result");
const uvValue = document.getElementById("uvValue");
const message = document.getElementById("message");
const alarm = document.getElementById("alarm");

const countrySearch = document.getElementById("countrySearch");
const countryList = document.getElementById("countryList");

let map;
let audioUnlocked = false;

// 🌍 COUNTRIES
const countries = [
  {name:"Afghanistan",lat:34.5553,lon:69.2075},
  {name:"Albania",lat:41.3275,lon:19.8187},
  {name:"Algeria",lat:36.7538,lon:3.0588},
  {name:"Argentina",lat:-34.6037,lon:-58.3816},
  {name:"Australia",lat:-35.2809,lon:149.13},
  {name:"Austria",lat:48.2082,lon:16.3738},
  {name:"Belgium",lat:50.8503,lon:4.3517},
  {name:"Brazil",lat:-15.8267,lon:-47.9218},
  {name:"Bulgaria",lat:42.6977,lon:23.3219},
  {name:"Canada",lat:45.4215,lon:-75.6972},
  {name:"China",lat:39.9042,lon:116.4074},
  {name:"Cyprus",lat:35.1856,lon:33.3823},
  {name:"Czech Republic",lat:50.0755,lon:14.4378},
  {name:"Denmark",lat:55.6761,lon:12.5683},
  {name:"Egypt",lat:30.0444,lon:31.2357},
  {name:"Finland",lat:60.1699,lon:24.9384},
  {name:"France",lat:48.8566,lon:2.3522},
  {name:"Germany",lat:52.52,lon:13.405},
  {name:"Greece",lat:37.9838,lon:23.7275},
  {name:"India",lat:28.6139,lon:77.2090},
  {name:"Italy",lat:41.9028,lon:12.4964},
  {name:"Japan",lat:35.6762,lon:139.6503},
  {name:"Mexico",lat:19.4326,lon:-99.1332},
  {name:"Netherlands",lat:52.3676,lon:4.9041},
  {name:"Norway",lat:59.9139,lon:10.7522},
  {name:"Poland",lat:52.2297,lon:21.0122},
  {name:"Portugal",lat:38.7223,lon:-9.1393},
  {name:"Russia",lat:55.7558,lon:37.6173},
  {name:"Saudi Arabia",lat:24.7136,lon:46.6753},
  {name:"South Africa",lat:-25.7479,lon:28.2293},
  {name:"Spain",lat:40.4168,lon:-3.7038},
  {name:"Sweden",lat:59.3293,lon:18.0686},
  {name:"Switzerland",lat:46.9480,lon:7.4474},
  {name:"Turkey",lat:39.9334,lon:32.8597},
  {name:"United Kingdom",lat:51.5072,lon:-0.1276},
  {name:"United States",lat:38.9072,lon:-77.0369}
];

// ---------------- UI LIST ----------------
function render(list){
  countryList.innerHTML="";
  list.forEach(c=>{
    const li=document.createElement("li");
    li.textContent=c.name;
    li.onclick=()=>getUV(c);
    countryList.appendChild(li);
  });
}
render(countries);

// search
countrySearch.addEventListener("input",(e)=>{
  const filtered=countries.filter(c=>
    c.name.toLowerCase().includes(e.target.value.toLowerCase())
  );
  render(filtered);
});

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
  const u=new SpeechSynthesisUtterance(text);
  u.lang="en-US";
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ---------------- ALARM FIX ----------------
function playAlarm(uv){
  if(uv >= 6.5 && audioUnlocked){
    alarm.currentTime=0;
    alarm.play().catch(()=>{});
  }
}

// ---------------- MAP FIX ----------------
function mapInit(lat,lon){
  if(map) map.remove();

  map=L.map("map").setView([lat,lon],5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:"© OpenStreetMap"
  }).addTo(map);

  L.marker([lat,lon]).addTo(map);

  setTimeout(()=>map.invalidateSize(),400);
}

// ---------------- COUNTRY UV ----------------
async function getUV(country){

  const url=
    `https://api.open-meteo.com/v1/forecast?latitude=${country.lat}&longitude=${country.lon}&hourly=uv_index,cloud_cover&timezone=auto`;

  const res=await fetch(url);
  const data=await res.json();

  const now=new Date();
  const times=data.hourly.time;

  let i=0,best=999999;

  for(let x=0;x<times.length;x++){
    const diff=Math.abs(new Date(times[x]) - now);
    if(diff<best){
      best=diff;
      i=x;
    }
  }

  let uv=data.hourly.uv_index[i];
  const cloud=data.hourly.cloud_cover[i]||0;

  uv=uv*(1-(cloud/100)*0.65);
  uv=Math.max(0,Math.min(11,uv));
  uv=Math.round(uv*10)/10;

  alert(`${country.name} UV: ${uv}`);

  speak(`UV in ${country.name} is ${uv}`);

  playAlarm(uv);
}

// ---------------- START LOCATION ----------------
startBtn.onclick=()=>{

  audioUnlocked=true;

  navigator.geolocation.getCurrentPosition(async pos=>{

    const lat=pos.coords.latitude;
    const lon=pos.coords.longitude;

    mapInit(lat,lon);

    const url=
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index,cloud_cover&timezone=auto`;

    const res=await fetch(url);
    const data=await res.json();

    const times=data.hourly.time;

    let i=0,best=999999;

    for(let x=0;x<times.length;x++){
      const diff=Math.abs(new Date(times[x]) - new Date());
      if(diff<best){
        best=diff;
        i=x;
      }
    }

    let uv=data.hourly.uv_index[i];
    const cloud=data.hourly.cloud_cover[i]||0;

    uv=uv*(1-(cloud/100)*0.65);
    uv=Math.max(0,Math.min(11,uv));
    uv=Math.round(uv*10)/10;

    statusText.style.display="none";
    result.classList.remove("hidden");

    uvValue.textContent=`Current UV: ${uv}`;
    message.textContent=getMessage(uv);

    speak(`Current UV is ${uv}`);
    playAlarm(uv);

  });

};
