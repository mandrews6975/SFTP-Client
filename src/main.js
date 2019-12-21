const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const { Client, SFTPStream } = require('ssh2');
const PromisePool = require('es6-promise-pool');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createMainWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    width: 1280,
    height: 900,
    minWidth: 1280,
    minHeight: 900,
    maxWidth: 1280,
    maxHeight: 900,
    darkmode: true,
    icon: __dirname + '/img/icon.png',
    show: false,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/mainWindow.html`);

  // Only show mainWindow once all page contents are prepared
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow();
  }
});

// Display file properties dialog
ipcMain.on('display_file_properties', (event, args) => {
  dialog.showMessageBox({
    type: 'info',
    buttons: ['Close',],
    title: 'Properties: ' + args[0],
    message: args[1],
    icon: __dirname + '/img/icon.png',
  });
});

// Store current local directory
let curLocalDir;

ipcMain.on('change_local_dir', (event, args) => {
  curLocalDir = args;
});

ipcMain.on('get_cur_local_dir', (event, args) => {
  event.sender.send('cur_local_dir', curLocalDir);
});

// Store current remote directory
let curRemoteDir;

ipcMain.on('get_cur_remote_dir', (event, args) => {
  event.sender.send('cur_remote_dir', curRemoteDir);
});

let counter = 0;

// Get remote directory list
ipcMain.on('get_remote_dir_list', (event, args) => {
  curRemoteDir = args[1];
  let conn = new Client();
  conn.on('ready', () => {
    conn.sftp((error, sftp) => {
      sftp.readdir(args[1], (error, list) => {
        newArgs = [];
        newArgs.push(list);
        let statsList = [];
        for(let i = 0; i < list.length; i++){
          statsList.push(list[i].attrs.isDirectory());
        }
        newArgs.push(statsList);
        event.sender.send('remote_dir_list', newArgs);
        conn.end();
      });
    });
  }).connect(args[0]);
});

// Download remote file from server
ipcMain.on('download_remote_files', (event, args) => {
  let conn = new Client();
  conn.on('ready', () => {
    let pool = new PromisePool(downloadFileProducer(conn, args[1]), 10);
    pool.start().then(() => {
      conn.end();
      counter = 0;
      let tempArgs = [];
      tempArgs.push(curLocalDir);
      tempArgs.push(curRemoteDir);
      tempArgs.push(args[1].length);
      event.sender.send('remote_download_complete', tempArgs);
    });
  }).connect(args[0]);
});

// Producer used in promise pool to download files
function *downloadFileProducer(conn, files){
  for(const file of files){
    yield downloadFile(conn, file);
  }
}

// Function used to download files in promise pool
function downloadFile(conn, file){
  return new Promise((resolve, reject) => {
    conn.sftp((error, sftp) => {
      return sftp.fastGet(file, curLocalDir + file.substring(file.lastIndexOf('/') + 1), {}, () => {
        resolve(file);
      });
    });
  });
}

// Upload local file to server
ipcMain.on('upload_local_files', (event, args) => {
  let conn = new Client();
  conn.on('ready', () => {
    let pool = new PromisePool(uploadFileProducer(conn, args[1]), 10);
    pool.start().then(() => {
      conn.end();
      counter = 0;
      let tempArgs = [];
      tempArgs.push(curLocalDir);
      tempArgs.push(curRemoteDir);
      tempArgs.push(args[1].length);
      event.sender.send('local_upload_complete', tempArgs);
    });
  }).connect(args[0]);
});

// Producer used in promise pool to upload files
function *uploadFileProducer(conn, files){
  for(const file of files){
    yield uploadFile(conn, file);
  }
}

// Function used to upload files in promise pool
function uploadFile(conn, file){
  return new Promise((resolve, reject) => {
    conn.sftp((error, sftp) => {
      return sftp.fastPut(file, curRemoteDir + file.substring(file.lastIndexOf('/') + 1), {}, (error) => {
        resolve(file);
      });
    });
  });
}

// Make local directory
ipcMain.on('make_local_dir', (event, args) => {
  fs.mkdir(curLocalDir + args[0], () => {
    let tempArgs = [];
    tempArgs.push(curLocalDir);
    tempArgs.push(curRemoteDir);
    tempArgs.push(args[1]);
    event.sender.send('local_dir_made', tempArgs);
  });
});

// Make remote directory
ipcMain.on('make_remote_dir', (event, args) => {
  let conn = new Client();
  conn.on('ready', () => {
    conn.sftp((error, sftp) => {
      sftp.mkdir(curRemoteDir + args[1], (error) => {
        let tempArgs = [];
        tempArgs.push(curLocalDir);
        tempArgs.push(curRemoteDir);
        tempArgs.push(args[1]);
        event.sender.send('remote_dir_made', tempArgs);
        conn.end();
      });
    });
  }).connect(args[0]);
});
