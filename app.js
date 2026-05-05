const express = require("express");
const app = express();

app.use(express.json());

let events = [];

app.get("/", (req, res) => {
  res.send(`
    <h2>⚖️ Hukuk Hatırlatıcı Aktif</h2>
    <p>Sistem çalışıyor</p>
  `);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Çalışıyor");
});
