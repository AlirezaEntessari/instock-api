const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

router.get('/', async (req, res) => {
	try {
		const data = await knex('inventories')
			.join('warehouses', 'warehouses.id', 'inventories.warehouse_id')
			.select('inventories.id', 'warehouses.warehouse_name', 'item_name', 'description', 'category', 'status', 'quantity');
		res.json(data);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
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

router.put('/:id', async (req, res) => {
	const inventoryId = req.params.id;
	const {
		warehouse_id,
		item_name,
		description,
		category,
		status,
		quantity,
	} = req.body;

	if (
		!warehouse_id ||
		!item_name ||
		!description ||
		!category ||
		!status ||
		!quantity
	) {
		return res.status(400).json({ error: 'All fields are required.' });
	}

	if (isNaN(quantity)) {
		return res.status(400).json({ error: 'Quantity must be a number.' });
	}

	try {
		const existingInventory = await knex('inventories')
			.where({ id: inventoryId })
			.first();

		if (!existingInventory) {
			return res.status(404).json({ error: 'Inventory item not found.' });
		}

		const existingWarehouse = await knex('warehouses')
			.where({ id: warehouse_id })
			.first();

		if (!existingWarehouse) {
			return res.status(400).json({ error: 'Invalid warehouse_id.' });
		}

		await knex('inventories')
			.where({ id: inventoryId })
			.update({
				warehouse_id,
				item_name,
				description,
				category,
				status,
				quantity,
			});

		const updatedInventory = await knex('inventories')
			.where({ id: inventoryId })
			.first();

		return res.status(200).json(updatedInventory);
	} catch (error) {
		console.error('Error updating inventory item:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
});
router.delete('/:id', async (req, res) => {
    const warehouseId = req.params.id;

    try {
        const existingWarehouse = await knex('warehouses').where({ id: warehouseId }).first();

        if (!existingWarehouse) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }

        await knex.transaction(async (trx) => {
            await trx('inventory').where({ warehouse_id: warehouseId }).del();
            await trx('warehouses').where({ id: warehouseId }).del();
        });

        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
