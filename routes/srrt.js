var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var SRRT = require('../models/srrt');
var path = require('path');
var fse = require('fs-extra');
var fs = require('fs');
var moment = require('moment');

/* GET users listing. */
router.post('/list', function(req, res, next) {
  var db = req.db;
  var off_id = req.body.off_id;
  var key = req.body.key;
  Users.checkApiKey(key)
    .then(function() {
      return SRRT.getList(db, off_id)
    }).then(function(rows) {
      console.log(rows);
      res.send({
        ok: true,
        rows: rows
      })
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      })
    })
});

/* GET users listing. */
router.post('/list-by-date', function(req, res, next) {
  var db = req.db;
  var off_id = req.body.off_id;
  var date_serv = req.body.date_serv;
  var key = req.body.key;

  Users.checkApiKey(key)
    .then(function() {
      return SRRT.getListByDate(db, off_id, date_serv)
    }).then(function(rows) {
      res.send({
        ok: true,
        rows: rows
      })
    }, function(err) {
      res.send({
        ok: false,
        msg: err
      })
    })
});

router.post('/save-image', function(req, res, next) {
  var db = req.db;
  var id = req.body.id;
  var off_id = req.body.off_id;

  var imageData = req.body.imageData;
  var type = req.body.type;
  var key = req.body.key;

  Users.checkApiKey(key)
    .then(function() {

      var file_name = off_id + '-' + moment().format('x') + '.jpg';
      var dirYear = moment().get('year');
      var dirMonth = moment().get('month') + 1;
      var yearMonthPath = dirYear + '/' + dirMonth;

      var destPath = './public/images/' + yearMonthPath;
      fse.ensureDirSync(destPath);

      var imgPath = path.join(destPath, file_name);

      fs.writeFile(imgPath, imageData, 'base64', function(err) {
        var resFilePath = yearMonthPath + '/' + file_name;
        if (err) {
          res.send({ok: false, msg: 'Can\'t create image file'})
        } else {
          var data = {};
          if (type == 1) {
            data.img_report_1 = resFilePath;
            data.report_date_1 = moment().format('YYYY-MM-DD HH:mm:ss');
          } else if (type == 2) {
            data.img_report_2 = resFilePath;
            data.report_date_2 = moment().format('YYYY-MM-DD HH:mm:ss');
          } else {
            data.img_report_3 = resFilePath;
            data.report_date_3 = moment().format('YYYY-MM-DD HH:mm:ss');
          }

          SRRT.saveImage(db, id, data)
          .then(function () {
            console.log(resFilePath);
            res.send({ok: true, image: resFilePath, date: moment().format('YYYY-MM-DD HH:mm:ss')})
          }, function (err) {
            console.log(err);
            res.send({ok: false, msg: err})
          });
        }
      });

    }, function (err) {
      res.send({ok: false, msg: err})
    });
});

module.exports = router;
