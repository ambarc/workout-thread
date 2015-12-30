var fs = require('fs')
var workoutParser = require('./parse-workout-thread');

console.log('Using thread data in ' + process.argv[2]);

fs.readFile(process.argv[2], 'utf8', function (err, htmlData) {
  if (err) {
    return console.log(err);
  }
  workoutParser.parseWorkoutThread(htmlData);
});

