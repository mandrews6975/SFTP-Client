exports.displayRemoteDirListing = function(path){
  displayRemoteDirListing(path);
}

function displayRemoteDirListing(path){
  let args = [];
  args.push(getConnectionSettings());
  args.push(path);
  ipcRenderer.send('get_remote_dir_list', args);
  ipcRenderer.on('remote_dir_list', (event, args) => {
    ipcRenderer.on('sftp_message', (event, args) => {
      cons.writeToConsole(args);
    });
    let numElements = document.getElementById('remote_dir_display').children.length;
    for(let i = 0; i < numElements; i++){
      document.getElementById('remote_dir_display').children[0].remove();
    }
    if(path != '/'){
      let row = document.createElement('tr');
      let name = document.createElement('td');
      name.addEventListener('dblclick', () => {
        let oldPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
        displayRemoteDirListing(oldPath);
      });
      name.appendChild(document.createTextNode('..'));
      let dir = document.createElement('img');
      dir.src = 'img/enter.png';
      dir.style = 'float: right; width: 18px; height: 18px;';
      dir.addEventListener('click', () => {
        let oldPath = path.substring(0, path.lastIndexOf('/', path.length - 2) + 1);
        displayRemoteDirListing(oldPath);
      });
      name.appendChild(dir);
      row.appendChild(name);
      document.getElementById('remote_dir_display').appendChild(row);
    }
    for(let i = 0; i < args[0].length; i++){
      let row = document.createElement('tr');
      let name = document.createElement('td');
      let nameText = args[0][i].filename;
      if(nameText.length > 65){
        nameText = nameText.substring(0, 62) + '...';
      }
      name.appendChild(document.createTextNode(nameText));
      let details = document.createElement('img');
      details.src = 'img/view_details.png';
      details.style = 'float: right; width: 18px; height: 18px; margin-left: 3px; margin-right: 3px';
      details.addEventListener('click', () => {
        let props = 'mode: ' + args[0][i].attrs.mode + '\n' + 'uid: ' + args[0][i].attrs.uid + '\n' +'gid: ' + args[0][i].attrs.gid + '\n' +'size: ' + args[0][i].attrs.size + '\n' +'atime: ' + args[0][i].attrs.atime + '\n' +'mtime: ' + args[0][i].attrs.mtime;
        displayRemoteFileProperties(args[0][i].filename, props);
      });
      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style = 'float: right; margin-top: 3px';
      checkbox.value = path + args[0][i].filename;
      name.appendChild(checkbox);
      name.appendChild(details);

      if(args[1][i]){
        let dir = document.createElement('img');
        dir.src = 'img/enter.png';
        dir.style = 'float: right; width: 18px; height: 18px;';
        dir.addEventListener('click', () => {
          displayRemoteDirListing(path + args[0][i].filename + '/');
        });
        name.addEventListener('dblclick', () => {
          displayRemoteDirListing(path + args[0][i].filename + '/');
        });
        name.appendChild(dir);
      }

      row.appendChild(name);
      document.getElementById('remote_dir_display').appendChild(row);
    }
    if(path.length > 55){
      let shortPath = path.substring(path.length - 59);
      shortPath = '...' + shortPath;
      document.getElementById('remote_cur_dir').innerHTML = 'Current directory: ' + shortPath;
    }else{
      document.getElementById('remote_cur_dir').innerHTML = 'Current directory: ' + path;
    }
  });
  ipcRenderer.on('sftp_message', (event, args) => {
    cons.writeToConsole(args);
  });
}

function displayRemoteFileProperties(fileName, stats){
  let args = [];
  args.push(fileName);
  args.push(stats);
  ipcRenderer.send('display_file_properties', args);
}
