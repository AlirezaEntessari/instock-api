require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const knex = require('knex')(require('./knexfile.js'));

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));

const warehousesRoute = require('./routes/warehouses.js');
app.use('/api/warehouses', warehousesRoute);

const inventoriesRoute = require('./routes/inventories.js');
app.use('/api/inventories', inventoriesRoute);

app.get('/api', (req, res) => {
  res.send(`API is running`);
});

app.listen(PORT, () => {
  console.log(`running at http://localhost:${PORT}`);
});
