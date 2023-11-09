const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

router.get('/', async (req, res) => {
	const data = await knex('inventories')
		.join('warehouses', 'warehouses.id', 'inventories.warehouse_id')
		.select('inventories.id', 'warehouses.warehouse_name', 'item_name', 'description', 'category', 'status', 'quantity');
	res.json(data);
});

router.post('/seed', async (req, res) => {
	try {
		await knex.seed.run({ specific: '02_inventories.js' });
		res.status(200).send('Seeding completed successfully.');
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

module.exports = router;
