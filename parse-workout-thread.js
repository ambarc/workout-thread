var htmlParser = require('htmlparser');
var sys = require('sys');

var parseWorkoutThread = function(data) {
  var handler = new htmlParser.DefaultHandler(function (error, dom) {
    if (error) {
      console.log('error parsing html ' + error);
    } else {

    }
  });

  console.log('parsing thread');
  var parser = new htmlParser.Parser(handler);
  parser.parseComplete(data);
  sys.puts(sys.inspect(handler.dom, false, null));
}


module.exports = {
  parseWorkoutThread: parseWorkoutThread,
}
