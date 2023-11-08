// import seed data files, arrays of objects
const inventoriesData = require('../seeds-data/02_inventories');
const warehousesData = require('../seeds-data/01_warehouses');

exports.seed = async function(knex) {
  await knex('inventories').del();
  await knex('warehouses').del();
  await knex('inventories').insert(inventoriesData);
  await knex('warehouses').insert(warehousesData);
};
