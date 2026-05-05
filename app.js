const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.urlencoded({ extended: true }));

const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.get("/", async (req, res) => {

  const snapshot = await db.collection("events").get();

  let list = "";

  snapshot.forEach(doc => {
    const d = doc.data();
    list += `<li>${d.title} → Son gün: ${d.deadline}</li>`;
  });

  res.send(`
    <h1>⚖️ Hukuk Takip Sistemi</h1>

    <form method="POST" action="/add">
      <input name="title" placeholder="Başlık" required />
      <input name="days" placeholder="Gün" required />
      <button type="submit">Ekle</button>
    </form>

    <h3>Kayıtlar</h3>
    <ul>${list}</ul>
  `);
});

app.post("/add", async (req, res) => {
  const { title, days } = req.body;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + parseInt(days));

  await db.collection("events").add({
    title,
    days,
    deadline: deadline.toISOString().slice(0,10)
  });

  res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server çalışıyor");
});
