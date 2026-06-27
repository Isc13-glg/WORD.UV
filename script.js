console.log("SkyNow script loaded");

/* =========================
   ELEMENT SAFETY (NO CRASHES)
========================= */

function $(id) {
  return document.getElementById(id);
}

/* Intro + screens */
const intro = $("intro");
const modeScreen = $("modeScreen");

/* Buttons */
const useLocation = $("useLocation");
const manualSelect = $("manualSelect");
const mapPick = $("mapPick");

/* UI */
const viewingText = $("viewingText");

/* Weather fields */
const temp = $("temp");
const feels = $("feels");
const uv = $("uv");
const wind = $("wind");
const hum = $("hum");
const vis = $("vis");

/* Map */
let map;

/* =========================
   🔥 SAFE START (FIXES STUCK LOADING)
========================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready");

  // Safety check
  if (!intro || !modeScreen) {
    console.error("Missing intro or modeScreen in HTML");
    return;
  }

  setTimeout(() => {
    intro.style.display = "none";
    modeScreen.classList.remove("hidden");
  }, 1200);
});

/* =========================
   🗺️ MAP INIT
========================= */

function initMap(lat, lon) {
  if (map) map.remove();

  map = L.map("map").setView([lat, lon], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: ""
  }).addTo(map);

  map.on("click", (e) => {
    loadWeather(e.latlng.lat, e.latlng.lng, "Map Location");
  });
}

/* =========================
   🌦️ WEATHER FETCH (SAFE)
========================= */

async function getWeather(lat, lon) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      "&hourly=temperature_2m,uv_index,wind_speed_10m,relative_humidity_2m,visibility,apparent_temperature" +
      "&timezone=auto";

    const res = await fetch(url);
    const data = await res.json();

    if (!data.hourly) {
      throw new Error("No hourly data returned");
    }

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

  } catch (err) {
    console.error("Weather fetch error:", err);

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
   🌍 LOAD WEATHER
========================= */

async function loadWeather(lat, lon, name) {

  if (viewingText) {
    viewingText.textContent = "🌍 Viewing: " + name;
  }

  modeScreen?.classList.add("hidden");

  if (!map) {
    initMap(lat, lon);
  } else {
    map.setView([lat, lon], 6);
  }

  const w = await getWeather(lat, lon);

  if (temp) temp.textContent = w.temp;
  if (feels) feels.textContent = w.feels;
  if (uv) uv.textContent = w.uv;
  if (wind) wind.textContent = w.wind;
  if (hum) hum.textContent = w.hum;
  if (vis) vis.textContent = w.vis;
}

/* =========================
   📍 BUTTONS (FIXED)
========================= */

useLocation?.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      loadWeather(
        pos.coords.latitude,
        pos.coords.longitude,
        "Your Location"
      );
    },
    (err) => {
      alert("Location failed. Please enable permissions.");
      console.error(err);
    }
  );
});

manualSelect?.addEventListener("click", () => {
  alert("Manual mode not connected yet (your list UI goes here)");
});

mapPick?.addEventListener("click", () => {
  modeScreen.classList.add("hidden");

  const defaultLat = 35.1856;
  const defaultLon = 33.3823;

  loadWeather(defaultLat, defaultLon, "Map Mode");
});
