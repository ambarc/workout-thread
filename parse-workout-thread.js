var htmlParser = require('htmlparser');
var sys = require('sys');
var underscore = require('underscore');

var parseWorkoutThread = function(data) {
  var handler = new htmlParser.DefaultHandler(function (error, dom) {
    if (error) {
      console.log('error parsing html ' + error);
    } else {
      console.log('parsing done');
    }
  });

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
      var meta = messageHeader.children[1].children[0].raw;

  //    console.log(user);
    //  console.log(meta);

      var actualMessage = messagesData[counter + 1];
      if (actualMessage.children) {
        var messageText = actualMessage.children[0].raw;
        console.log(messageText);
      }

      counter += 2;
    } else {
      console.log('error parsing message format');
      break;
    }
  }
}


module.exports = {
  parseWorkoutThread: parseWorkoutThread,
}
