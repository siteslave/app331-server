var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var Patient = require('../models/patient');
var Service = require('../models/service');
var GCM = require('../models/gcm');

var fse = require('fs-extra');
var path = require('path');
var fs = require("fs");
var crypto = require('crypto');
var moment = require('moment');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

/* GET home page. */
router.post('/gcm', function(req, res, next) {
  console.log(req.body);
  res.send({
    ok: true
  });
});

router.post('/register_gcm', function(req, res, next) {
  var db = req.db;
  var username = req.body.username;
  var register_id = req.body.register_id;
  var device_model = req.body.model;
  var device_platform = req.body.platform;
  var key = req.body.key;

  Users.checkApiKey(key)
    .then(function() {
      // update register id
      Users.registerGcm(db, username, register_id, device_model, device_platform)
      .then(function () {
        res.send({ok: true})
      }, function (err) {
        res.send({ok: false, msg: err})
      })
    })
});

router.post('/login', function(req, res, next) {
  var key = req.body.key;
  var username = req.body.username;
  var password = req.body.password;

  var db = req.db;

  // check api key
  Users.checkApiKey(key)
    .then(function() {
      // do login
      var _password = crypto.createHash('md5').update(password).digest('hex');
      Users.doLogin(db, username, _password)
        .then(function(user) {
          if (user) {
            console.log(user);
            res.send({
              ok: true,
              user: user
            })
          } else {
            res.send({
              ok: false,
              msg: 'Authen failed'
            })
          }
        }, function(err) {
          console.log(err)
          res.send({
            ok: false,
            msg: err
          })
        })
    }, function(err) {
      console.log(err);
      res.send({
        ok: false,
        msg: 'Invalid key'
      })
    })
});

router.post('/save-report', function(req, res, next) {
  var key = req.body.key;
  var db = req.db;
  var service = req.body.service;

  Users.checkApiKey(key)
    .then(function () {
      // create folder yyyy mmn
      var file_name = service.office + '-' + moment().format('x') + '.jpg';
      var dirYear = moment().get('year');
      var dirMonth = moment().get('month') + 1;
      var yearMonthPath = dirYear + '/' + dirMonth;

      var destPath = './public/images/' + yearMonthPath;
      fse.ensureDirSync(destPath);

      var imgPath = path.join(destPath, file_name);

      fs.writeFile(imgPath, service.img_data, 'base64', function(err) {
        var resFilePath = yearMonthPath + '/' + file_name;
        if (err) {
          res.send({ok: false, msg: 'Can\'t create image file'})
        } else {
          service.img = resFilePath;
          Service.save(db, service)
          .then(function () {
            // get device list
            return Service.getDeviceToken(db, service.office);
          })
          .then(function (deviceIds) {
            var ids = []
            deviceIds.forEach(function (v) {
              ids.push(v.register_id);
            })
            console.log(ids);
            return GCM.sendPush(ids);
          })
          .then(function () {
            res.send({ok: true});
          }, function (err) {
            console.log(err);
            res.send({ok: false, msg: err})
          });
        }
      });
    }, function (err) {
      console.log(err);
      res.send({ok: false, msg: err})
    })
});

router.post('/list', function (req, res, next) {
  var key = req.body.key;
  var db = req.db;
  Users.checkApiKey(key)
    .then(function() {
      return Service.list(db)
    })
    .then(function (rows) {
      console.log(rows);
      res.send({ok: true, rows: rows})
    }, function (err) {
      res.send({ok: false, msg: err})
    })
});

router.post('/office-list', function (req, res, next) {
  var key = req.body.key;
  var db = req.db;
  var amp = req.body.amp;

  Users.checkApiKey(key)
    .then(function() {
      return Service.getOfficeList(db, amp)
    })
    .then(function (rows) {
      res.send({ok: true, rows: rows})
    }, function (err) {
      res.send({ok: false, msg: err})
    })
});

router.post('/search', function (req, res, next) {
  var key = req.body.key;
  var db = req.db;
  var office = req.body.office;
  var date_serv = req.body.date_serv;

  Users.checkApiKey(key)
    .then(function() {
      return Service.search(db, office, date_serv)
    })
    .then(function (rows) {
      var services = [];
      rows.forEach(function (v) {
        var obj = {};
        obj.date_serv = moment(v.date_serv).format('DD/MM/YYYY');
        obj.date_report = moment(v.report_date_0).format('DD/MM/YYYY HH:mm:ss');
        obj.img_report_0 = v.img_report_0;
        obj.id = v.id;
        services.push(obj);
      });
      res.send({ok: true, rows: services})
    }, function (err) {
      res.send({ok: false, msg: err})
    })
});

router.post('/update-report', function(req, res, next) {
  var key = req.body.key;
  var db = req.db;
  var service = req.body.service;
  var patient = req.body.patient;

  //console.log(req.body);

  Users.checkApiKey(key)
    .then(function() {
      return Patient.update(db, patient)
    })
    .then(function() {
      // save image
      var file_name = moment().format('x') + '.jpg';
      var destPath = './public/images';
      fse.ensureDirSync(destPath);

      var imgPath = path.join(destPath, file_name);

      fs.writeFile(imgPath, service.img_data, 'base64', function(err) {
        if (err) {
          res.send({ok: false, msg: 'Can\'t create image file'})
        } else {
          service.img = file_name;
          service.cid = patient.cid;
          return Service.update(db, service);
        }
      });

    })
    .then(function() {
      res.send({
        ok: true
      });
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      })
    })
});

router.post('/detail', function (req, res, next) {
  var key = req.body.key;
  var id = req.body.id;
  var db = req.db;
  Users.checkApiKey(key)
    .then(function() {
      return Service.detail(db, id)
    })
    .then(function (rows) {
      res.send({ok: true, rows: rows})
    }, function (err) {
      res.send({ok: false, msg: err})
    })
});

router.post('/patient/remove', function (req, res, next) {
  var key = req.body.key;
  var id = req.body.id;
  var db = req.db;

  Users.checkApiKey(key)
    .then(function() {
      return Service.remove(db, id)
    })
    .then(function () {
      res.send({ok: true})
    }, function (err) {
      res.send({ok: false, msg: err})
    })
})

module.exports = router;
