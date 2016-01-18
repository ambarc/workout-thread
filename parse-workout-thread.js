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
};

var getMakePercentageByMonth = function(users) {
  var toReturn = {};
  for (user in users) {
    toReturn[user] = {};
    var madeString = "";
    var pledgeString = "";
    var totalMade = 0;
    var totalPledged = 0;
    var made = users[user]['made'];
    var pledges = users[user]['pledges'];
    for (month in made) {
      madeString += made[month] + " ";
      pledgeString += pledges[month] + " ";
      totalMade += made[month];
      totalPledged += pledges[month];
    }
    console.log(user);
    console.log(madeString);
    console.log(pledgeString);
    toReturn[user]['percent'] = 100 * (totalMade/totalPledged);
    toReturn[user]['totalMade'] = totalMade;
    toReturn[user]['totalPledged'] = totalPledged;
  }
  for (user in toReturn) {
    console.log(user, toReturn[user]['totalMade'], toReturn[user]['totalPledged'], toReturn[user]['percent']);
  }
  return toReturn;
};

var getWeekHistogram = function(users) {
  var toReturn = {};
  for (user in users) {
    var workouts = users[user].workouts;
    for (index in workouts) {
      var workout = workouts[index];
      var time = workout.time;
      var message = workout.message;
      var day = time.substring(0, time.indexOf(','));
      if (!toReturn[day]) {
        toReturn[day] = 0;
      }
      toReturn[day] = toReturn[day] + 1;
    }
  }
  return toReturn;
};

var parseThread = function(users) {
  var toReturn = {};
  for (user in users) {
    var workouts = users[user].workouts;

    users[user]['pledges'] = {};
    users[user]['made'] = {};
    users[user]['makeConfirmation'] = {};
    users[user]['pledgeConfirmation'] = {};
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
            users[user]['pledgeConfirmation'][actualMonth] = [committed, workout.message, meta];
            if (!users[user]['made'][actualMonth] || made < users[user]['made'][actualMonth]) {
              users[user]['made'][actualMonth] = made;
              users[user]['makeConfirmation'][actualMonth] = [made, workout.message, meta];
            } 
          }
        }
      }
    }
    toReturn[user] = users[user];//underscore.pick(users[user], ['pledges', 'made', 'pledgeConfirmation', 'makeConfirmation']);
  }
  console.log(getMakePercentageByMonth(users));
  console.log(getWeekHistogram(users));
  return toReturn;
};


module.exports = {
  getWorkoutCandidates: getWorkoutCandidates,
  parseCandidates: parseThread,
}
