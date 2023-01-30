// Routes for companies

const express = require('express');
const ExpressError = require('../expressError')
const router = express.Router();
const db = require('../db');


// GET route to get a list of all companies.
router.get('/', async(req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies`);
        return res.json({ "companies": results.rows })
    } catch (err) {
        return next(err);
    }
});


// GET route to get a single company.
router.get('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const results = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find company with code of ${code}`, 404)
      }
      return res.json({ 'company': results.rows[0] })
    } catch (err) {
      return next(err)
    }
  });


// POST route to add a company.
router.post('/', async(req, res, next) => {
    try {
    const { code, name, description } = req.body;
    const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
    return res.status(201).json({ company: results.rows[0] })
    } catch (err) {
        return next(err)
    }
});


// PATCH route to edit an existing company.
router.patch('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot update company with code of ${code}`, 404)
        }
        return res.send({ company: results.rows[0] })
    } catch(err) {
        return next(err)
    }
});


// DELETE route to delete an existing company.
router.delete('/:code', async (req, res, next) => {
  try {
    const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
    return res.send({ msg: "DELETED!" })
  } catch (err) {
    return next(err)
  }
})


module.exports = router;



