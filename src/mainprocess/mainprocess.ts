import * as fs from 'fs';
import * as path from 'path';
import { BrowserWindow, Menu, app, dialog, globalShortcut } from 'electron';
import { ISharedConfiguration } from '../shared/ISharedConfiguration';
import windowStateKeeper = require('electron-window-state');

//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const basePath: string = fs.realpathSync(path.join(app.getAppPath()));
const appBundlePath: string = path.join(basePath, 'dist/app');

const mainPath: string = fs.realpathSync(path.join(appBundlePath));
const rendererPath: string = fs.realpathSync(path.join(appBundlePath, '..'));

const debug: boolean = process.env.DEBUG !== undefined;

let mainWindow: BrowserWindow;

const createWindow = (): Promise<void> => {
  return new Promise((resolved, rejected) => {
    if (!mainWindow) {
      const mainWindowState = windowStateKeeper({
        file: 'webgl-debuggerwindow.json',
        defaultWidth: 800,
        defaultHeight: 600,
      });

      mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        show: false, // do not show during creation
        webPreferences: {
          defaultEncoding: 'UTF-8',
          //devTools: debug,
          nodeIntegration: true,
          nodeIntegrationInSubFrames: true,
          nodeIntegrationInWorker: true,
          preload: fs.realpathSync(path.join(mainPath, '/preloadapp.js')),
        },
      });

      // Let us register listeners on the window, so we can update the state
      // automatically (the listeners will be removed when the window is closed)
      // and restore the maximized or full screen state
      mainWindowState.manage(mainWindow);

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

      if (debug) {
        globalShortcut.register('F5', () => {
          mainWindow.reload();
        });
      }

      const sharedConfiguration: ISharedConfiguration = {
        traceWebGLFunctions: true,
        appWindowId: mainWindow.id,
        appBundlePath,
      };

      global['sharedConfiguration'] = sharedConfiguration;

      mainWindow.setMenuBarVisibility(false);
      mainWindow
        .loadFile(fs.realpathSync(path.join(rendererPath, '/index.html')))
        .then(() => {
          if (debug) {
            mainWindow.webContents.openDevTools();
          }

          mainWindow.on('closed', () => {
            mainWindow = null;
          });

          mainWindow.show();

          resolved();
        })
        .catch((reason: any): void => {
          dialog.showErrorBox('Error', JSON.stringify(reason));
          rejected();
        });
    }
  });
};

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

app.on('ready', createWindow);

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

export default app;
