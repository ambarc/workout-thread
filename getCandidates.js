var fs = require('fs')
var workoutParser = require('./parse-workout-thread');

console.log('Using thread data in ' + process.argv[2]);

fs.readFile(process.argv[2], 'utf8', function (err, htmlData) {
  if (err) {
    return console.log(err);
  }
  var candidates = workoutParser.getWorkoutCandidates(htmlData);
  var toWrite = JSON.stringify(candidates, null, 4);
  fs.writeFile(process.argv[3], toWrite, function(data) {
    if (err) throw err;
    console.log('written candidates');
  });
});

