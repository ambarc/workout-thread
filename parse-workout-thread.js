var htmlParser = require('htmlparser');
var sys = require('sys');
var underscore = require('underscore');
var moment = require('moment');

var workoutRegex = new RegExp(/[1-9][0-9]*\/[1-9][0-9]*(\.|\ )/);

var months = {
  '1': 'January',
  '2': 'February',
  '3': 'March',
  '4': 'April',
  '5': 'May',
  '6': 'June',
  '7': 'July',
  '8': 'August',
  '9': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

var _hasWorkoutLog = function (message) {
  console.log('dunno yet');
}

var getWorkoutCandidates = function(data) {
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
  var messagesData = handler.dom[0]['children'];

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
        };
      };
      var meta = messageHeader.children[1].children[0].raw;

      var actualMessage = messagesData[counter + 1];
      if (actualMessage.children) {
        var messageText = actualMessage.children[0].raw;
        var workoutRegex = new RegExp(/[1-9][0-9]*\/[1-9][0-9]*(\.|\ )/);
        var res = workoutRegex.test(messageText);
        if (res) {
          users[user].workouts.push({
            message: messageText,
            time: meta,
          });
        }
      }

      counter += 2;
    } else {
      console.log('error parsing message format');
      break;
    }
  }

  return users;
};

var extractProgressCount = function(workoutLine) {
  var match = workoutRegex.exec(workoutLine);
  var toReturn = null;

  if (match) {
    var made = parseInt(match[0].substring(0, match[0].indexOf('/')));
    var committed = parseInt(match[0].substring(match[0].indexOf('/') + 1));
    toReturn = [made, committed];
  }
  return toReturn;
}

var parseThread = function(users) {
  var toReturn = {};
  for (user in users) {
    var workouts = users[user].workouts;

    users[user]['pledges'] = {};
    users[user]['made'] = {};
    for (index in workouts) {
      var workout = workouts[index];
      var progress = extractProgressCount(workout.message);
      if (progress) {
        var made = progress[0];
        var committed = progress[1];

        if (committed) {

          var meta = workout.time;

          var dateString = meta.substring(meta.indexOf(',') + 2, meta.indexOf(' at ')).trim();
          var timeString = meta.substring(meta.indexOf('at') + 2).trim();
          var combined = dateString + " " + timeString;
          var timed = moment(dateString, 'MMMM D, YYYY');

          var actualMonth = timed.month() + 1;
          if (!users[user]['pledges'][actualMonth] ||
              users[user]['pledges'][actualMonth] < committed) {
            users[user]['pledges'][actualMonth] = committed;
            if (!users[user]['made'][actualMonth] || made < users[user]['made'][actualMonth]) {
              users[user]['made'][actualMonth] = made;
            } 
          }
        }
      }
    }
    toReturn[user] = underscore.pick(users[user], ['pledges', 'made']);
  }
  return toReturn;
};

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
          made: {},
          overall: {},
        };
      };
      var meta = messageHeader.children[1].children[0].raw;
      var dateString = meta.substring(meta.indexOf(',') + 2, meta.indexOf(' at ')).trim();
      var timeString = meta.substring(meta.indexOf('at') + 2).trim();
      var combined = dateString + " " + timeString;
      var timed = moment(dateString);
      var actualMonth = timed.month() + 1;
      //console.log(dateString);
      //console.log(timeString);
      //console.log(dateString + " " + timeString);
      //console.log(moment(dateString).isValid());

      // Get pledge per user per month.

      //console.log(user);
      //console.log(meta);

      var actualMessage = messagesData[counter + 1];
      if (actualMessage.children) {
        var messageText = actualMessage.children[0].raw;
        //console.log(messageText);
        var res = workoutRegex.test(messageText);
        if (res) {

          if (committed) {
            if (!users[user]['pledges'][actualMonth] ||
                users[user]['pledges'][actualMonth] < committed) {
              users[user]['overall'][actualMonth] = [made, committed, messageText, meta, dateString]
              users[user]['pledges'][actualMonth] = committed;
              if (!users[user]['made'][actualMonth] || made < users[user]['made'][actualMonth]) {
                users[user]['made'][actualMonth] = made;
              } 
            }
          }

          console.log(dateString, user,  made + '/' + committed);
          if (!users[user]['made'][actualMonth] || users[user]['made'][actualMonth] < made) {
            //users[user]['made'][actualMonth] = made;
          }

          //console.log(user + ": " + messageText);
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
    var months = underscore.keys(users[name]['pledges']);
    //console.log(users);
    //console.log(users[name]['made']);
    //console.log(users[name]['pledges']);
  }

  console.log(users['Ambar Choudhury']['workouts'].length);

  // Total made.
  // Pledged vs made.
};

module.exports = {
  getWorkoutCandidates: getWorkoutCandidates,
  parseCandidates: parseThread,
}
