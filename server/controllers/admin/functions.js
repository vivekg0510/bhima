/**
* Function Controller
*
* This controller exposes an API to the client for reading and writing Function

*/
var db = require('../../lib/db');

// GET /Function
function lookupFunction(id, codes) {
  'use strict';

  var sql =
    'SELECT id, fonction_txt FROM fonction ' +
    'WHERE fonction.id = ? ';

  return db.exec(sql, [id])
  .then(function (rows) {

    if (rows.length === 0) {
      throw new codes.ERR_NOT_FOUND();
    }

    return rows[0];
  });
}


// Lists the functions of hospital employees
function list(req, res, next) {
  'use strict';

  var sql;
  
  sql =
    'SELECT id, fonction_txt FROM fonction ;';

  db.exec(sql)
  .then(function (rows) {

    res.status(200).json(rows);
  })
  .catch(next)
  .done();
}

/**
* GET /Function/:ID
*
* Returns the detail of a single Function
*/
function detail(req, res, next) {
  'use strict';

  var id = req.params.id;

  lookupFunction(id, req.codes)
  .then(function (record) {
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}


// POST /Function
function create(req, res, next) {
  'use strict';

  var sql,
      data = req.body;
   
  sql =
    'INSERT INTO fonction SET ? ';

  db.exec(sql, [data])
  .then(function (row) {
    res.status(201).json({ id : row.insertId });
  })
  .catch(next)
  .done();
}


// PUT /Function /:id
function update(req, res, next) {
  'use strict';

  var sql;

  sql =
    'UPDATE fonction SET ? WHERE id = ?;';

  db.exec(sql, [req.body, req.params.id])
  .then(function () {
    return lookupFunction(req.params.id, req.codes);
  })
  .then(function (record) {
    // all updates completed successfull, return full object to client
    res.status(200).json(record);
  })
  .catch(next)
  .done();
}

// DELETE /function/:id
function del(req, res, next) {
  'use strict';

  var sql =
    'DELETE FROM fonction WHERE id = ?;';

  db.exec(sql, [req.params.id])
  .then(function (row) {

    // if nothing happened, let the client know via a 404 error
    if (row.affectedRows === 0) {
      throw new req.codes.ERR_NOT_FOUND();
    }

    res.status(204).json();
  })
  .catch(next)
  .done();
}


// get list of function
exports.list = list;

// get details of a function
exports.detail = detail;

// create a new function
exports.create = create;

// update function informations
exports.update = update;

// Delete a function
exports.delete = del;