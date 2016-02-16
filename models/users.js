var Q = require('q');

module.exports = {
    doLogin: function (db, username, password) {
      var q = Q.defer();
      db('users')
      .select('username', 'fullname', 'user_mode', 'off_id')
      .where('username', username)
      .where('password', password)
      .then(function (rows) {
        q.resolve(rows[0])
      })
      .catch(function (err) {
        q.reject(err)
      });

      return q.promise;
    },

    registerGcm: function (db, username, register_id, device_model, device_platform) {
      var q = Q.defer();
      db('users')
      .update({
        register_id: register_id,
        device_model: device_model,
        device_platform: device_platform
      })
      .where('username', username)
      .then(function () {
        q.resolve()
      })
      .catch(function (err) {
        q.reject(err)
      });

      return q.promise;
    },

    checkApiKey: function (key) {
      var q = Q.defer();
      if (key == '123456') q.resolve();
      else q.reject('Invalid Key');

      return q.promise;
    },

}
