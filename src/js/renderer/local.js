exports.getCheckedLocalPaths = function(){
  return getCheckedLocalPaths();
}

function getCheckedLocalPaths(){
  let arr = [];
  let numElements = document.getElementById('local_dir_display').children.length;
  for(let i = 0; i < numElements; i++){
    if(document.getElementById('local_dir_display').children[i].children[0].children[0].checked){
      arr.push(document.getElementById('local_dir_display').children[i].children[0].children[0].value);
    }
  }
  return arr;
}

function makeLocalDir(){
  let tempArgs = [];
  tempArgs.push(document.getElementById('input_new_local_dir').value);
  document.getElementById('input_new_local_dir').value = '';
  ipcRenderer.send('make_local_dir', tempArgs);
  ipcRenderer.on('local_dir_made', (event, args) => {
    displayLocalDirListing(args[0]);
    displayRemoteDirListing(args[1]);
    cons.writeToConsole('Local directory ' + args[2] + ' made.')
  });
}
