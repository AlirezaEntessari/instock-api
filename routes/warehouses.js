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

router.get('/:id', async (req, res) => {

    const id = req.params.id;

    try {
        const warehouses = await knex('warehouses').select('id', "warehouse_name",  "address", "city", "country", "contact_name",
        "contact_position", "contact_phone", "contact_email").where({ id: id });

        return res.status(200).json(warehouses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id/inventories', async (req, res) => {
    const id = req.params.id;
    const warehouse = await knex('warehouses').where({id: id}).first();
    if (!warehouse) return res.status(404).json({error: 'Warehouse not found.'});

    const inventories = await knex('inventories')
        .where({warehouse_id : id})
        .select('id', 'item_name', 'category', 'status', 'quantity');
    res.status(200).json(inventories);
});

router.put('/:id', async (req, res) => {
    // https://stackoverflow.com/a/48800
    const validateEmail = (email) => {
        return String(email)
        .toLowerCase()
        .match(
           /^\S+@\S+\.\S+$/ 
        );
    };
    // https://stackoverflow.com/a/4339299
    const validatePhone = (num) => {
        return String(num)
            .match(/\d/g)
            .length >= 10;
    }
    const id = req.params.id;
    const {
        warehouse_name,
        address,
        city,
        country,
        contact_name,
        contact_position,
        contact_phone,
        contact_email,
    } = req.body || {};

    // i cant think of a better way of handling a wrong body in the request
    if (!warehouse_name || !address || !city || !country || !contact_name || !contact_position || !contact_phone || !contact_email) {
        return res.status(400).json({error: 'Your request is invalid'});
    }
    if (!validateEmail(contact_email)) return res.status(400).json({error: 'Your email is not valid.'});
    if (!validatePhone(contact_phone)) return res.status(400).json({error: 'Your phone number is not valid.'});

    try {
        const warehouse = await knex('warehouses').where({id: id}).first();
        if (!warehouse) return res.status(404).json({error: 'Warehouse not found.'});
        const createdAt = warehouse.created_at;
        await knex('warehouses').where({ id: id }).first().del();
        await knex('warehouses').insert([
            {
                id: id,
                warehouse_name: warehouse_name,
                address: address,
                city: city,
                country: country,
                contact_name: contact_name,
                contact_position: contact_position,
                contact_phone: contact_phone,
                contact_email: contact_email,
                created_at: createdAt,
            }
        ])
        const createdWarehouse = await knex('warehouses').where({id: id}).first();
        res.status(200).json(createdWarehouse);
    } catch (e) {
        res.status(500).json({error: 'Internal server error.'});
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