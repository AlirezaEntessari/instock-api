require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 8080;

//use json middleware
app.use(express.json());

//use CORS
app.use(cors({
	origin: 'http://localhost:3000'
}))

// use the warehouses route
const warehousesRoute = require('./routes/warehouses.js');
app.use('/api/warehouses', warehousesRoute);
// use the inventories route
const inventoriesRoute = require('./routes/inventories.js');
app.use('/api/inventories', inventoriesRoute);

// basic home route
app.get('/api', (req, res) => {
  res.send(`API is running`);
});

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});


