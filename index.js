const http = require('http');
const socket = require('./lib/socket');

const app = require('express');

const server = http.createServer(app);


socket(server);


// server.listen(config.PORT, () => {
//   // socket(server)
//   console.log('Server is listening at :', config.PORT);
// });
