import * as path from 'path';
import { BrowserWindow, Menu, app, globalShortcut } from 'electron';
import { ISharedConfiguration } from '../shared/ISharedConfiguration';
//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

let mainWindow: Electron.BrowserWindow;

async function createWindow(): Promise<void> {
  /*
  await app.whenReady();
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
  */
  // Create the browser window.
  const appPath = path.resolve(app.getAppPath());
  const preloadPath = path.join(appPath, 'preloadapp.js');
  console.log(`preloadPath: ${preloadPath}`);
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: preloadPath,
    },
  });

  // toggle menu visibility
  // mainWindow.setMenuBarVisibility(false);

  // remove main menu completely
  Menu.setApplicationMenu(null);

  // because we remove the main menu completely, we have to bind the default shortcuts our self
  globalShortcut.register('CommandOrControl+Q', () => {
    const focusedWin = BrowserWindow.getFocusedWindow();
    if (focusedWin && focusedWin !== mainWindow) {
      focusedWin.close();
    } else {
      app.quit();
    }
  });

  const sharedConfiguration: ISharedConfiguration = {
    traceWebGLFunctions: true,
    appWindowId: mainWindow.id,
  };

  global['sharedConfiguration'] = sharedConfiguration;

  // open maximized
  mainWindow.maximize();

  /*
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
  */
  //await installExtension(REACT_DEVELOPER_TOOLS);

  /*
  BrowserWindow.addDevToolsExtension(
    'C:\\Users\\daniel\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\fmkadmapgofadopljbjfkapdkoienihi\\4.2.0_0'
  );
  */

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // and load the index.html of the app.
  return mainWindow.loadFile(path.join(app.getAppPath(), '../index.html'));
}

app.removeAllListeners('ready'); // workaround for https://github.com/electron/electron/issues/19468
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/*
ipcMain.on(IPCChannel.WebGLFunc, (event, arg: IWebGLFunc) => {
  //setTimeout(() => {
  //mainWindow.webContents.send(IPCChannel.WebGLFunc, arg);
  //}, Math.ceil(Math.random() * 200));
  console.log(`WebGL call #${arg.id}: ${arg.name}`);
  mainWindow.webContents.send(IPCChannel.WebGLFunc, arg);
});
*/
