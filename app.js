const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.urlencoded({ extended: true }));

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* =========================
   ⏳ COUNTDOWN MOTOR
========================= */
function getRemainingDays(deadline) {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/* =========================
   📅 MODERN TAKVİM (AY GEÇİŞLİ)
========================= */
function generateCalendar(monthOffset = 0, events = []) {
  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `
  <div style="margin:10px 0;">
    <a href="?m=${monthOffset - 1}">⬅ Önceki</a>
    <b style="margin:0 20px;">${month + 1}/${year}</b>
    <a href="?m=${monthOffset + 1}">Sonraki ➡</a>
  </div>

  <style>
    table { border-collapse: collapse; width:100%; }
    td, th { border:1px solid #ddd; text-align:center; padding:8px; }
    .today { background:#ffe082; }
    .court { background:#b9f6ca; border-radius:50%; }
    .event { background:#ffcdd2; width:8px; height:8px; border-radius:50%; display:inline-block; }
  </style>

  <table><tr>
  `;

  const days = ["Pzt","Sal","Çar","Per","Cum","Cts","Paz"];
  days.forEach(d => html += `<th>${d}</th>`);
  html += "</tr><tr>";

  let offset = (firstDay === 0) ? 6 : firstDay - 1;

  for (let i = 0; i < offset; i++) html += "<td></td>";

  for (let day = 1; day <= daysInMonth; day++) {

    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    const court = events.find(e => e.courtDate === dateStr);
    const hasEvent = events.find(e => e.deadline === dateStr);

    html += `<td class="${court ? 'court' : ''}">
      ${day}
      ${hasEvent ? '<div class="event"></div>' : ''}
    </td>`;

    if ((day + offset) % 7 === 0) html += "</tr><tr>";
  }

  html += "</tr></table>";

  return html;
}

/* =========================
   🏠 ANA SAYFA
========================= */
app.get("/", async (req, res) => {

  const monthOffset = parseInt(req.query.m || 0);

  const snapshot = await db.collection("events").get();

  let events = [];
  let list = "";

  snapshot.forEach(doc => {
    const d = doc.data();

    const remaining = getRemainingDays(d.deadline);

    events.push(d);

    list += `
      <li>
        <span style="${d.done ? 'text-decoration:line-through' : ''}">
          ${d.title} → ${d.deadline} (${remaining} gün)
        </span>

        ${!d.done ? `<a href="/done?id=${doc.id}">✔</a>` : ""}

        <a href="/delete?id=${doc.id}">🗑</a>
      </li>
    `;
  });

  res.send(`
    <h1>⚖️ Hukuk Paneli v3</h1>

    <form method="POST" action="/add">
      <input name="title" placeholder="Dosya" required />

      <div>
        <button name="days" value="1">1</button>
        <button name="days" value="3">3</button>
        <button name="days" value="5">5</button>
        <button name="days" value="7">7</button>
        <button name="days" value="14">14</button>
        <button name="days" value="30">1 Ay</button>
      </div>

      <input name="courtDate" placeholder="Duruşma (YYYY-MM-DD)" />

      <button>Kaydet</button>
    </form>

    <h3>📌 İşlemler</h3>
    <ul>${list}</ul>

    <h3>📅 Takvim</h3>
    ${generateCalendar(monthOffset, events)}
  `);
});

/* =========================
   ➕ EKLE
========================= */
app.post("/add", async (req, res) => {

  const { title, days, courtDate } = req.body;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + parseInt(days));

  await db.collection("events").add({
    title,
    days,
    deadline: deadline.toISOString().slice(0,10),
    courtDate: courtDate || null,
    done: false,
    createdAt: new Date()
  });

  res.redirect("/");
});

/* =========================
   ✔ TAMAMLANDI
========================= */
app.get("/done", async (req, res) => {

  await db.collection("events").doc(req.query.id).update({
    done: true
  });

  res.redirect("/");
});

/* =========================
   🗑 SİL
========================= */
app.get("/delete", async (req, res) => {

  await db.collection("events").doc(req.query.id).delete();

  res.redirect("/");
});

/* =========================
   🚀 SERVER
========================= */
app.listen(process.env.PORT || 3000, () => {
  console.log("v3 çalışıyor");
});