const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile"));

router.get('/', async (req, res) => {
	const data = await knex('inventories');
	console.log(data);
	res.json(data);
})

module.exports = router;