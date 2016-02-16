var Q = require('q');
var moment = require('moment');

module.exports = {
  save: function (db, service) {
    var q = Q.defer();
    db('services')
    .insert({
      date_serv: service.date_serv,
      img_report_0: service.img,
      report_date_0: moment().format('YYYY-MM-DD HH:mm:ss'),
      sex: service.sex,
      amp: service.amp,
      tmb: service.tmb,
      office: service.office
    })
    .then(function () {
      q.resolve()
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;
  },

  list: function (db) {
    var q = Q.defer();
    var sql = 'select a.name, a.code, count(*) as total ' +
        ' from services as s ' +
        ' inner join ampall as a on a.code=s.amp ' +
        ' group by s.amp ' +
        ' order by a.name';

    db.raw(sql, [])
    .then(function (rows) {
      q.resolve(rows[0])
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;

  },

  search: function (db, office, date_serv) {
    var q = Q.defer();

    var sql = 'select id, date_serv, report_date_0, img_report_0 from services where office=? and date_serv=?';

    db.raw(sql, [office, date_serv])
    .then(function (rows) {
      q.resolve(rows[0])
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;

  },

  getOfficeList: function (db, amp) {
    var q = Q.defer();
    var sql = 'select s.office, o.off_name, count(s.id) as total '+
              ' from services as s '+
              ' inner join co_office as o on o.off_id=s.office  '+
              ' where s.amp=?' +
              ' group by s.office '+
              ' order by o.off_name';

    db.raw(sql, [amp])
    .then(function (rows) {
      q.resolve(rows[0])
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;

  },

  detail: function (db, id) {
    var q = Q.defer();
    var sql = 'select c.off_name, s.* from services as s left join co_office as c on c.off_id=s.office where s.id=? limit 1';
    db.raw(sql, [id])
    .then(function (rows) {
      q.resolve(rows[0])
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;

  },

  remove: function (db, id) {
    var q = Q.defer();
    db('services')
    .del()
    .where('id', id)
    .then(function (rows) {
      q.resolve()
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;

  },

  getDeviceToken: function (db, off_id) {
    var q = Q.defer();
    db('users')
    .select('register_id')
    .where('off_id', off_id)
    .then(function (rows) {
      q.resolve(rows)
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;

  }
}
