console.log("SkyNow restored script loaded");

/* =========================
   ELEMENTS (YOUR ORIGINAL UI)
========================= */

const intro = document.getElementById("intro");
const modeScreen = document.getElementById("modeScreen");

const useLocation = document.getElementById("useLocation");
const manualSelect = document.getElementById("manualSelect");
const mapPick = document.getElementById("mapPick");

const viewingText = document.getElementById("viewingText");

const temp = document.getElementById("temp");
const feels = document.getElementById("feels");
const uv = document.getElementById("uv");
const wind = document.getElementById("wind");
const hum = document.getElementById("hum");
const vis = document.getElementById("vis");

let map;

/* =========================
   🚀 INTRO (FIXED ONLY)
========================= */

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (intro) intro.style.display = "none";
    if (modeScreen) modeScreen.style.display = "flex";
  }, 1200);
});

/* =========================
   🗺️ MAP (UNCHANGED LOGIC)
========================= */

function initMap(lat, lon) {
  if (map) map.remove();

  map = L.map("map").setView([lat, lon], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  map.on("click", (e) => {
    loadWeather(e.latlng.lat, e.latlng.lng, "Map Selection");
  });
}

/* =========================
   🌦️ WEATHER (SAFE FIX ONLY)
========================= */

async function getWeather(lat, lon) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&hourly=temperature_2m,uv_index,wind_speed_10m,relative_humidity_2m,visibility,apparent_temperature" +
      "&timezone=auto";

    const res = await fetch(url);
    const data = await res.json();

    let i = 0;
    let best = Infinity;
    const now = new Date();

    for (let x = 0; x < data.hourly.time.length; x++) {
      const d = Math.abs(new Date(data.hourly.time[x]) - now);
      if (d < best) {
        best = d;
        i = x;
      }
    }

    return {
      temp: data.hourly.temperature_2m[i],
      feels: data.hourly.apparent_temperature[i],
      uv: data.hourly.uv_index[i],
      wind: data.hourly.wind_speed_10m[i],
      hum: data.hourly.relative_humidity_2m[i],
      vis: data.hourly.visibility[i]
    };

  } catch (e) {
    console.error("Weather error", e);
    return {
      temp: "--",
      feels: "--",
      uv: "--",
      wind: "--",
      hum: "--",
      vis: "--"
    };
  }
}

/* =========================
   🌍 LOAD WEATHER (UI SAME)
========================= */

async function loadWeather(lat, lon, name) {

  if (viewingText)
    viewingText.textContent = "🌍 Viewing: " + name;

  if (modeScreen)
    modeScreen.style.display = "none";

  if (!map) initMap(lat, lon);
  else map.setView([lat, lon], 6);

  const w = await getWeather(lat, lon);

  if (temp) temp.textContent = w.temp;
  if (feels) feels.textContent = w.feels;
  if (uv) uv.textContent = w.uv;
  if (wind) wind.textContent = w.wind;
  if (hum) hum.textContent = w.hum;
  if (vis) vis.textContent = w.vis;
}

/* =========================
   📍 BUTTONS (NOW ALL WORK)
========================= */

useLocation?.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      loadWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
    },
    () => alert("Location blocked")
  );
});

/* 🌍 MANUAL BACK (SIMPLE PROMPT — NO UI BREAK) */
manualSelect?.addEventListener("click", () => {
  const lat = prompt("Latitude:");
  const lon = prompt("Longitude:");
  const name = prompt("Name:");

  if (!lat || !lon) return;

  loadWeather(parseFloat(lat), parseFloat(lon), name || "Manual Location");
});

/* 🗺️ MAP MODE */
mapPick?.addEventListener("click", () => {
  modeScreen.style.display = "none";

  loadWeather(35.1856, 33.3823, "Map Mode");
});
