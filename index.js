// const http = require('http');
// const socket = require('./lib/socket');

// const app = require('express');

// const server = http.createServer(app);


// socket(server);


// // server.listen(config.PORT, () => {
// //   // socket(server)
// //   console.log('Server is listening at :', config.PORT);
// // });


const express = require('express');
const http = require('http');
const socketServer = require('./lib/socket'); // Assuming this is the file containing your socket server setup
const config = require('./config'); // Your server configuration
const cors = require ('cors')
const fs = require('fs'); // Node.js built-in module for file operations
// Create an Express app

const app = express();
app.use(cors())
// Configure any middleware, routes, etc. for your Express app
// For example:
// app.use(express.json());
// app.use('/api', require('./routes/api'));
const privateKey = fs.readFileSync('./certs/create-cert-key.pem', 'utf8');
const certificate = fs.readFileSync('./certs/create-cert.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
};

// Create an HTTPS server using the Express app and SSL/TLS certificates

// Create an HTTP server using the Express app
const server = http.createServer( app);

// Set up the socket server using the HTTP server
socketServer(server);

// Start the server listening on the specified port
server.listen(config.PORT, () => {
  console.log(`Server is listening on port ${config.PORT}`);
});
