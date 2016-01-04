var htmlParser = require('htmlparser');
var sys = require('sys');
var underscore = require('underscore');
var moment = require('moment');

var _hasWorkoutLog = function (message) {
  console.log('dunno yet');
}

var parseWorkoutThread = function(data) {
  var handler = new htmlParser.DefaultHandler(function (error, dom) {
    if (error) {
      console.log('error parsing html ' + error);
    } else {
      console.log('parsing done');
    }
  });

  var users = {};


  console.log('parsing thread');
  var parser = new htmlParser.Parser(handler);
  parser.parseComplete(data);
 // console.log(sys.inspect(handler.dom, false, null));

  //var parsed = handler.dom[1];
  var messagesData = handler.dom[0]['children'];
  //console.log(messagesData);

  var totalChildren = messagesData.length;
  var counter = 1;
  while (counter < totalChildren) {
    var current = messagesData[counter];
    if (current.attribs && current.attribs.class === 'message') {
      
      var messageHeader = current.children[0];
      var user = messageHeader.children[0].children[0].raw;
      if (!users[user]) {
        users[user] = {
          workouts: [],
          pledges: {},
        };
      };
      var meta = messageHeader.children[1].children[0].raw;
      var dateString = meta.substring(meta.indexOf(',') + 2, meta.indexOf(' at ')).trim();
      var timeString = meta.substring(meta.indexOf('at') + 2).trim();
      var combined = dateString + " " + timeString;
      var timed = moment(dateString);
      //console.log(dateString);
      //console.log(timeString);
      console.log(dateString + " " + timeString);
      console.log(moment(dateString).isValid());

      // Get pledge per user per month.



      // console.log(user);
      //console.log(meta);

      var actualMessage = messagesData[counter + 1];
      if (actualMessage.children) {
        var messageText = actualMessage.children[0].raw;
        //console.log(messageText);
        var workoutRegex = new RegExp(/[1-9][0-9]*\/[1-9][0-9]*/);
        var res = workoutRegex.test(messageText);
        if (res) {
          var match = workoutRegex.exec(messageText);
          var committed = parseInt(match[0].substring(match[0].indexOf('/') + 1));

          if (committed) {
            if (!users[user]['pledges'][timed.month()] ||
                users[user]['pledges'][timed.month()] < committed) {
              users[user]['pledges'][timed.month()] = [committed, messageText, meta, dateString]
            }
          }

          console.log(user + ": " + messageText);
          users[user].workouts.push({
            message: messageText,
            time: meta,
          });
        } else {

        }
      }

      counter += 2;
    } else {
      console.log('error parsing message format');
      break;
    }
  }


  //console.log(sys.inspect(users, false, null));
  var keys = underscore.keys(users);
  for (key in keys) {
    var name = keys[key];
    console.log(name  + ": " + users[name].workouts.length);
    console.log(users[name]['pledges']);
  }

}


module.exports = {
  parseWorkoutThread: parseWorkoutThread,
}
