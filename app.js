const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.get("/url", function(req, res, next) {
  res.json("test successful");
});

app.post("/url", (req, res, next) => {
  res.json({
    uname: req.body.uname,
    pword: req.body.pword
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
