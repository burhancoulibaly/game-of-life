const express = require('express'),
      path = require('path'),
      app = express();

app.use(express.static("./dist/game-of-life"));

app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname+'/dist/game-of-life/index.html'));
});

app.listen(process.env.PORT || 8080);