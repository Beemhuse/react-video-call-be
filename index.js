const http = require('http');
const express = require('express');
const cors = require('cors'); // Import the cors middleware
const config = require('./config');
const socket = require('./lib/socket');

const app = express();
app.use(cors()); // Use the cors middleware

app.use(cors({
  origin: '*' // Allow requests only from http://example.com
}));


const server = http.createServer(app);


socket(server);


// app.get('/socket', (req, res) => {
//   // Your API logic here
//   res.json({ message: 'API data' });
// });
server.listen(config.PORT, () => {
  socket(server)
  console.log('Server is listening at :', config.PORT);
});
