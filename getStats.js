var fs = require('fs')
var workoutParser = require('./parse-workout-thread');

console.log('Using thread data in ' + process.argv[2]);

fs.readFile(process.argv[2], 'utf8', function (err, parsedData) {
  if (err) {
    return console.log(err);
  }
  var parsed = workoutParser.getStats(JSON.parse(parsedData));
  var toWrite = JSON.stringify(parsed, null, 4);
  
  fs.writeFile(process.argv[3], toWrite,function(data) {
    if (err) throw err;
    console.log('written parsed info');
  });
});

