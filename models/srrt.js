var Q = require('q');

module.exports = {
  getList: function (db, off_id) {
    var q = Q.defer();

    db('services')
      .select()
      .where('office', off_id)
      .whereNull('report_date_1')
      .orderBy('report_date_0', 'desc')
      .then(function (rows) {
        q.resolve(rows)
      })
      .catch(function (err) {
        q.reject(err)
      });

      return q.promise;
  },
  getListByDate: function (db, off_id,date_serv) {
    var q = Q.defer();

    db('services')
      .select()
      .where('office', off_id)
      .where('date_serv', date_serv)
      .orderBy('report_date_0', 'desc')
      .then(function (rows) {
        q.resolve(rows)
      })
      .catch(function (err) {
        q.reject(err)
      });

      return q.promise;
  },
  saveImage: function (db, id, data) {
    var q = Q.defer();

    db('services')
      .select()
      .where('id', id)
      .update(data)
      .then(function () {
        q.resolve()
      })
      .catch(function (err) {
        q.reject(err)
      });

      return q.promise;
  }
}
