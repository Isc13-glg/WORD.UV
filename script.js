body {
  margin: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  color: white;
  overflow-x: hidden;
}

/* 🌈 BACKGROUND */
#bg {
  position: fixed;
  inset: 0;
  z-index: -2;
  transition: background 1.2s ease;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: -1;
}

/* 🌟 SCREEN */
.screen {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.screen.show {
  opacity: 1;
  transform: translateY(0);
}

/* 🌟 WELCOME */
#welcome {
  position: fixed;
  inset: 0;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeOut 1s ease forwards;
  animation-delay: 1.5s;
}

.welcomeCard {
  text-align: center;
  animation: pop 1s ease;
}

@keyframes pop {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes fadeOut {
  to { opacity: 0; visibility: hidden; }
}

/* APP */
.app {
  padding: 20px;
  text-align: center;
}

/* 🌟 BIG WOW BUTTONS */
.bigBtn {
  width: 90%;
  max-width: 320px;
  padding: 18px;
  margin: 10px auto;
  font-size: 18px;
  font-weight: 700;
  border-radius: 18px;
  border: none;
  color: white;
  background: linear-gradient(135deg,#4facfe,#00f2fe);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: block;
}

.bigBtn.secondary {
  background: linear-gradient(135deg,#667eea,#764ba2);
}

.bigBtn:active {
  transform: scale(0.96);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* GLASS */
.glass {
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(22px);
  border-radius: 28px;
  padding: 22px;
  margin: 16px 0;
}

/* HERO */
#bigTemp {
  font-size: 72px;
  font-weight: 700;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.card {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(18px);
  border-radius: 18px;
  padding: 14px;
}

/* MAP */
#map {
  height: 220px;
  border-radius: 16px;
}

/* SELECT */
select {
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.12);
  color: white;
  border: none;
}

/* LOADER */
#loader {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(255,255,255,0.2);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hidden { display:none; }
