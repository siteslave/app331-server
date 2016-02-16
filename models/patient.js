var Q = require('q');

module.exports = {
  save: function (db, patient) {
    var q = Q.defer();
    db('patient')
    .insert(patient)
    .then(function () {
      q.resolve()
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;
  },
  update: function (db, patient) {
    var q = Q.defer();
    db('patient')
    .update({
      fullname: patient.fullname,
      sex: patient.sex,
      birthdate: patient.birthdate,
      amp: patient.amp,
      tmb: patient.tmb,
      moo: patient.moo
    })
    .where('cid', patient.cid)
    .then(function () {
      q.resolve()
    })
    .catch(function (err) {
      q.reject(err)
    });

    return q.promise;
  }
}
