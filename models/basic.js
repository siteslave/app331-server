var Q = require('q');

module.exports = {
  getAmp: function (db) {
    var q = Q.defer();
    db('ampall')
    .where('code', 'like', '36%')
    .then(function (rows) {
      return q.resolve(rows)
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;
  },

  getOfficeFromAmp: function (db, amp) {
    var q = Q.defer();
    db('co_office')
    .where('distid', amp)
    .then(function (rows) {
      return q.resolve(rows)
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;
  },

  getTambol: function (db, amp) {
    var q = Q.defer();
    var reg = amp + '%'
    db('tambolall')
    .where('code', 'like', reg)
    .then(function (rows) {
      return q.resolve(rows)
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;
  },

  getOffice: function (db, tambol) {
    var q = Q.defer();
    db('co_office')
    .where('subdistid', tambol)
    .whereIn('off_type', ['03', '07', '13', '20'])
    .then(function (rows) {
      return q.resolve(rows)
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;
  }
}
