const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.urlencoded({ extended: true }));

// 🔐 Firebase (Render ENV: FIREBASE_KEY)
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 📅 Basit ay takvimi (bugünün ayı)
function generateCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = "<table border='1' cellpadding='5'><tr>";

  const weekDays = ["P", "P", "S", "Ç", "P", "C", "C"];
  weekDays.forEach(d => html += `<th>${d}</th>`);
  html += "</tr><tr>";

  for (let i = 0; i < firstDay; i++) {
    html += "<td></td>";
  }

  for (let day = 1; day <= daysInMonth; day++) {
    html += `<td>${day}</td>`;
    if ((day + firstDay) % 7 === 0) html += "</tr><tr>";
  }

  html += "</tr></table>";
  return html;
}

// 🏠 ANA SAYFA
app.get("/", async (req, res) => {
  const snapshot = await db.collection("events").get();

  let list = "";

  snapshot.forEach(doc => {
    const d = doc.data();
    list += `<li>${d.title} → Son gün: ${d.deadline}</li>`;
  });

  res.send(`
    <h1>⚖️ Hukuk Takip Sistemi</h1>

    <h3>➕ Yeni Kayıt</h3>

    <form method="POST" action="/add">
      <input name="title" placeholder="Başlık" required />

      <div>
        <button name="days" value="1">1 Gün</button>
        <button name="days" value="3">3 Gün</button>
        <button name="days" value="5">5 Gün</button>
        <button name="days" value="7">7 Gün</button>
        <button name="days" value="14">14 Gün</button>
        <button name="days" value="30">1 Ay</button>
      </div>

      <br>

      <input name="courtDate" placeholder="Duruşma Günü (YYYY-MM-DD)" />

      <button type="submit">Kaydet</button>
    </form>

    <h3>📌 Kayıtlar</h3>
    <ul>${list}</ul>

    <h3>📅 Takvim</h3>
    ${generateCalendar()}
  `);
});

// ➕ EKLE
app.post("/add", async (req, res) => {
  const { title, days, courtDate } = req.body;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + parseInt(days));

  await db.collection("events").add({
    title,
    days,
    deadline: deadline.toISOString().slice(0, 10),
    courtDate: courtDate || null,
    createdAt: new Date()
  });

  res.redirect("/");
});

// 🚀 SERVER
app.listen(process.env.PORT || 3000, () => {
  console.log("Hukuk sistemi çalışıyor");
});