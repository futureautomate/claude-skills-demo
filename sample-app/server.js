const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(morgan("tiny"));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ service: "sgu-demo-api", status: "ok" });
});

app.get("/health", (req, res) => res.json({ healthy: true }));

app.listen(port, () => console.log(`sgu-demo-api listening on ${port}`));
