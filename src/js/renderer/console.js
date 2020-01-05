exports.writeToConsole = function(message){
  document.getElementById('console_output').innerHTML += ('<br>' + '> ' + message);
  document.getElementById('console_output').scrollTop = document.getElementById('console_output').scrollHeight;
}

function writeToConsole(message){
  document.getElementById('console_output').innerHTML += ('<br>' + '> ' + message);
  document.getElementById('console_output').scrollTop = document.getElementById('console_output').scrollHeight;
}
