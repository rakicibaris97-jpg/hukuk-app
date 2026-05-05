const express = require("express");
const app = express();

app.use(express.json());

let events = [];

app.get("/", (req, res) => {
  res.send(`
    <h1>⚖️ Hukuk Hatırlatıcı</h1>

    <form method="POST" action="/add">
      <input name="title" placeholder="Başlık" />
      <input name="days" placeholder="Süre (gün)" />
      <button type="submit">Ekle</button>
    </form>

    <p>Uygulama aktif</p>
  `);
});

app.post("/add", express.urlencoded({ extended: true }), (req, res) => {
  const { title, days } = req.body;

  events.push({ title, days });

  res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server çalışıyor");
});
