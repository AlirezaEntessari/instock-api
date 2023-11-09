const express = require("express");
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

router.get('/', async (req, res) => {

    try {
        const warehouses = await knex('warehouses').select('*');

        return res.status(200).json(warehouses);
    } catch (error) {
        console.error(error);
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