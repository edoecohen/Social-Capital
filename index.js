var app = require('./server/server.js')

var port = process.env.PORT || 3000;

app.listen(port);
console.log("Now listening on port", port);

// start mongo db:  mongod --dbpath ./data/db/