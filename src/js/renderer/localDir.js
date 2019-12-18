const fs = require('fs');
const { ipcRenderer } = require('electron');
const util = require('util');
const cons = require('./js/renderer/console.js');

function displayLocalDirListing(path){
  ipcRenderer.send('change_local_dir', path);
  fs.readdir(path, (error, files) => {
    if(error){
      cons.writeToConsole(error);
    }
    let numElements = document.getElementById('local_dir_display').children.length;
    for(let i = 0; i < numElements; i++){
      document.getElementById('local_dir_display').children[0].remove();
    }
    if(path != '/'){
      let row = document.createElement('tr');
      let name = document.createElement('td');
      name.addEventListener('dblclick', () => {
        let oldPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
        displayLocalDirListing(oldPath);
      });
      name.appendChild(document.createTextNode('..'));
      let dir = document.createElement('img');
      dir.src = 'img/enter.png';
      dir.style = 'float: right; width: 18px; height: 18px;';
      dir.addEventListener('click', () => {
        let oldPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
        displayLocalDirListing(oldPath);
      });
      name.appendChild(dir);
      row.appendChild(name);
      document.getElementById('local_dir_display').appendChild(row);
    }
    for(let i = 0; i < files.length; i++){
      let row = document.createElement('tr');
      let name = document.createElement('td');
      let nameText = files[i];
      if(nameText.length > 65){
        nameText = nameText.substring(0, 62) + '...';
      }
      name.appendChild(document.createTextNode(nameText));
      fs.stat(path + files[i], (error, stats) => {
        if(error){
          cons.writeToConsole(error);
          return;
        }
        if(stats.isDirectory()){
          let dir = document.createElement('img');
          dir.src = 'img/enter.png';
          dir.style = 'float: right; width: 18px; height: 18px;';
          dir.addEventListener('click', () => {
            displayLocalDirListing(path + files[i] + '/');
          });
          name.addEventListener('dblclick', () => {
            displayLocalDirListing(path + files[i] + '/');
          });
          name.appendChild(dir);
        }
      });
      let details = document.createElement('img');
      details.src = 'img/view_details.png';
      details.style = 'float: right; width: 18px; height: 18px; margin-left: 3px; margin-right: 3px';
      details.addEventListener('click', () => {
        displayLocalFileProperties(files[i], path + files[i]);
      });
      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style = 'float: right; margin-top: 3px';
      checkbox.value = path + files[i];
      name.appendChild(checkbox);
      name.appendChild(details);
      row.appendChild(name);
      document.getElementById('local_dir_display').appendChild(row);
    }
    if(path.length > 55){
      let shortPath = path.substring(path.length - 59);
      shortPath = '...' + shortPath;
      document.getElementById('local_cur_dir').innerHTML = 'Current directory: ' + shortPath;
    }else{
      document.getElementById('local_cur_dir').innerHTML = 'Current directory: ' + path;
    }
  });
}

function displayLocalFileProperties(fileName, path){
  fs.stat(path, (error, stats) => {
    if(error){
      cons.writeToConsole(error);
      return;
    }
    let args = [];
    args.push(fileName);
    args.push(util.inspect(stats).substring(8, util.inspect(stats).length - 2));
    ipcRenderer.send('display_file_properties', args);
  });
}
