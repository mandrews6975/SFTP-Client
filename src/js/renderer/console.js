exports.writeToConsole = function(message){
  document.getElementById('console_output').innerHTML += ('<br>' + '> ' + message);
}

function writeToConsole(message){
  document.getElementById('console_output').innerHTML += ('<br>' + '> ' + message);
}
