const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile"));

router.get('/', async (req, res) => {
	const data = await knex('inventories')
		.join('warehouses', 'warehouses.id', 'inventories.warehouse_id')
		.select('inventories.id', 'warehouses.warehouse_name', 'item_name', 'description', 'category', 'status', 'quantity');
	res.json(data);
})

module.exports = router;