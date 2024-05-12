const http = require('http');
// const config = require('./config');
const socket = require('./lib/socket');



const server = http.createServer();


socket(server);


// server.listen(config.PORT, () => {
//   // socket(server)
//   console.log('Server is listening at :', config.PORT);
// });
