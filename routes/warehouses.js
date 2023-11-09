// warehouses.js

const express = require("express");
const router = express.Router();
const knex = require('../db'); // Asume que tienes tu configuración de Knex en un archivo separado

// Ruta para eliminar un almacén por ID
router.delete('/api/warehouses/:id', async (req, res) => {
    const warehouseId = req.params.id;

    try {
        // Verificar si el almacén existe
        const existingWarehouse = await knex('warehouses').where({ id: warehouseId }).first();

        if (!existingWarehouse) {
            return res.status(404).json({ error: 'Warehouse not found' });
        }

        // Eliminar el almacén y los elementos del inventario asociados
        await knex.transaction(async (trx) => {
            await trx('inventory').where({ warehouse_id: warehouseId }).del();
            await trx('warehouses').where({ id: warehouseId }).del();
        });

        // Éxito - no hay contenido para enviar
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
