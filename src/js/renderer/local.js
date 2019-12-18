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
