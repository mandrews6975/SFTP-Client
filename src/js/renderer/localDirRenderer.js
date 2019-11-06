const fs = require('fs');
const cons = require('./js/renderer/consoleRenderer.js')

function displayDirListing(path){
  fs.readdir(path, (error, files) => {
    if(error){
      cons.writeToConsole(error);
    }
    let numElements = document.getElementById('local_dir_display').children.length;
    for(let i = 0; i < numElements; i++){
      document.getElementById('local_dir_display').children[i].remove();
    }
    for(let i = 0; i < files.length; i++){
      let row = document.createElement('tr');
      let name = document.createElement('td');
      name.appendChild(document.createTextNode(files[i]));
      row.appendChild(name);
      document.getElementById('local_dir_display').appendChild(row);
    }
    cons.writeToConsole('Current local directory: ' + path);
  });
}
