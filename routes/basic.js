var express = require('express');
var router = express.Router();

var Basic = require('../models/basic');
var Users = require('../models/users')

/* GET users listing. */
router.post('/amp', function(req, res, next) {
  var db = req.db;
  var key = req.body.key;

  Users.checkApiKey(key)
    .then(function() {
      return Basic.getAmp(db);
    })
    .then(function (rows) {
      res.send({ok: true, rows: rows})
    }, function (err) {
      res.send({ok: false, msg: err})
    });
});

router.post('/tambol', function(req, res, next) {
  var db = req.db;
  var key = req.body.key;
  var amp = req.body.amp;

  console.log(req.body);

  Users.checkApiKey(key)
    .then(function() {
      return Basic.getTambol(db, amp);
    })
    .then(function (rows) {
      res.send({ok: true, rows: rows})
    }, function (err) {
      res.send({ok: false, msg: err})
    });
});

router.post('/office', function(req, res, next) {
  var db = req.db;
  var key = req.body.key;
  var tambol = req.body.tambol;

  Users.checkApiKey(key)
    .then(function() {
      return Basic.getOffice(db, tambol);
    })
    .then(function (rows) {
      res.send({ok: true, rows: rows})
    }, function (err) {
      res.send({ok: false, msg: err})
    });
});

router.post('/office-amp', function(req, res, next) {
  var db = req.db;
  var key = req.body.key;
  var amp = req.body.amp;

  Users.checkApiKey(key)
    .then(function() {
      return Basic.getOfficeFromAmp(db, amp);
    })
    .then(function (rows) {
      res.send({ok: true, rows: rows})
    }, function (err) {
      res.send({ok: false, msg: err})
    });
});

module.exports = router;
