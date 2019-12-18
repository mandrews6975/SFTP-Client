const remoteDir = require('./js/renderer/remoteDir.js');

function setConnectionSettings(){
  let host = document.getElementById('input_host');
  let port = document.getElementById('input_port');
  let username = document.getElementById('input_username');
  let password = document.getElementById('input_password');
  if(host.readOnly == false){
    host.readOnly = true;
    port.readOnly = true;
    username.readOnly = true;
    password.readOnly = true;
    document.getElementById('button_connect').disabled = true;
    document.getElementById('button_remote_disconnect').disabled = false;
    cons.writeToConsole('Connection settings: ' + username.value + '@' + host.value + ':' + port.value + ' established.');
    remoteDir.displayRemoteDirListing('/');
    ipcRenderer.on('sftp_message', (event, args) => {
      cons.writeToConsole(args[0]);
    });
  }
}

function editConnectionSettings(){
  let host = document.getElementById('input_host');
  let port = document.getElementById('input_port');
  let username = document.getElementById('input_username');
  let password = document.getElementById('input_password');
  if(host.readOnly == true){
    host.readOnly = false;
    port.readOnly = false;
    username.readOnly = false;
    password.readOnly = false;
    document.getElementById('button_connect').disabled = false;
    document.getElementById('button_remote_disconnect').disabled = true;
    cons.writeToConsole('Connection settings now editable.');
    let numElements = document.getElementById('remote_dir_display').children.length;
    for(let i = 0; i < numElements; i++){
      document.getElementById('remote_dir_display').children[0].remove();
    }
    document.getElementById('remote_cur_dir').innerHTML = 'Current directory:';
  }
}

function getConnectionSettings(){
  let connectionSettings = {
    host: document.getElementById('input_host').value,
    port: document.getElementById('input_port').value,
    username: document.getElementById('input_username').value,
    password: document.getElementById('input_password').value,
  }
  return connectionSettings;
}

function getCheckedRemotePaths(){
  let arr = [];
  let numElements = document.getElementById('remote_dir_display').children.length;
  for(let i = 0; i < numElements; i++){
    if(document.getElementById('remote_dir_display').children[i].children[0].children[0].checked){
      arr.push(document.getElementById('remote_dir_display').children[i].children[0].children[0].value);
    }
  }
  return arr;
}

function downloadFromServer(){
  let paths = getCheckedRemotePaths();
  let connectionSettings = getConnectionSettings();
  for(let i = 0; i < paths.length; i++){
    let tempArgs = [];
    tempArgs.push(connectionSettings);
    tempArgs.push(paths[i]);
    cons.writeToConsole('Downloading ' + paths[i].substring(paths[i].lastIndexOf('/') + 1) + '...');
    ipcRenderer.send('download_remote_file', tempArgs);
    ipcRenderer.on('sftp_message', (event, args) => {
      cons.writeToConsole(args[0]);
    });
    ipcRenderer.on('remote_download_complete', (event, args) => {
      displayLocalDirListing(args[0]);
      displayRemoteDirListing(args[1]);
      cons.writeToConsole(paths[i].substring(paths[i].lastIndexOf('/') + 1) + ' downloaded to ' + args[0]);
      return;
    });
  }
}
