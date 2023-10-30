const express = require("express");
const MultipleCrawler = require("./crawler");
var cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/linkscrawler", async function (req, res) {
  if (
    req.body.browsers != null &&
    req.body.keywords != null &&
    req.body.exceptions != null
  ) {
    const links = await MultipleCrawler(
      req.body.browsers,
      req.body.keywords,
      req.body.exceptions,
      req.body.maxtime
    );

    return res.json({
      links: links,
    });
  }

  res.sendStatus(200);
});

app.listen(5900, () => {
  console.log("listening on 5900");
});
