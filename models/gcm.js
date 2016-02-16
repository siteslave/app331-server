var Q = require('q');
var gcm = require('node-gcm');

module.exports = {
  sendPush: function(tokens) {
    var q = Q.defer();
    var message = new gcm.Message();
    message.addData('title', 'ประกาศ');
    message.addData('message', 'ทดสอบการส่ง');
    message.addData('body', 'ทดสอบการส่ง Message');
    message.addData('info', 'super secret info');
    message.addData('content-available', 1);
    // message.addData('notId', 2);
    message.addData('image', 'https://dl.dropboxusercontent.com/u/887989/antshot.png');

    var regTokens = tokens;

    // Set up the sender with you API key
    var sender = new gcm.Sender('AIzaSyD6BEvHuhcPFa_T6hmSSxexojIIsiHkgxo');
    // Now the sender can be used to send messages
    sender.send(message, {
      registrationTokens: regTokens
    }, function(err, response) {
      if (err) q.reject(err);
      else q.resolve();
    });

    return q.promise;

    // Send to a topic, with no retry this time
    // sender.sendNoRetry(message, {
    //   topic: '/topics/global'
    // }, function(err, response) {
    //   if (err) console.error(err);
    //   else console.log(response);
    // });

  }
}
