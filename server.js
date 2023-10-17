const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
const isUrl = require("is-valid-http-url");
const shortid = require('shortid');

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

const uri = CLINT_URI;

mongoose = require("mongoose");

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.on("error", console.error.bind(console, "connection error:"));
connection.once("open", () => {
  console.log("Connected Successfully");
});

const shortenURLSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});

const URL = mongoose.model("URL", shortenURLSchema);

app.get("/api/shorturl/:short_url", async function(req, res) {
  try {
    const urlParam = await URL.findOne({
      short_url: req.params.short_url,
    });
    if (urlParam) {
      return res.redirect(urlParam.original_url);
    } else {
      return res.status(404).json("No URL found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Server Error");
  }
});

app.post("/api/shorturl", async function(req, res) {
  const url = req.body.url;
  const urlCode = shortid.generate();
  console.log(url)
  if (!isUrl(url)) {
    res.json({
      error: "invalid url"
    })
  } else {
    try {
      let finOne = await URL.findOne({
        original_url: url,
      });
      if (finOne) {
        res.json({
          original_url: finOne.original_url,
          short_url: finOne.short_url,
        });
      } else {
        finOne = new URL({
          original_url: url,
          short_url: urlCode,
        });
        await finOne.save();
        res.json({
          original_url: finOne.original_url,
          short_url: finOne.short_url,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json("Server Error");
    }
  }
});

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
