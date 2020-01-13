import * as fs from 'fs';
import * as path from 'path';
import { BrowserWindow, Menu, app, dialog, globalShortcut } from 'electron';
import { ISharedConfiguration } from '../shared/ISharedConfiguration';
//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const basePath: string = fs.realpathSync(path.join(app.getAppPath()));
const appPath: string = fs.realpathSync(path.join(basePath, 'dist/app'));

const mainPath: string = fs.realpathSync(path.join(appPath));
const rendererPath: string = fs.realpathSync(path.join(appPath, ".."));

const debug: boolean = process.env.DEBUG !== undefined;

let mainWindow: BrowserWindow;

const createWindow = () => {
  return new Promise((resolved, rejected) => {

    if (!mainWindow) {
      mainWindow = new BrowserWindow({
        webPreferences: {
          defaultEncoding: 'UTF-8',
          devTools: debug,
          nodeIntegration: true,
          nodeIntegrationInSubFrames: true,
          nodeIntegrationInWorker: true,
          preload: fs.realpathSync(path.join(mainPath, '/preloadapp.js')),
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

      mainWindow.hide();
      mainWindow.setMenuBarVisibility(false);
      mainWindow.loadFile(fs.realpathSync(path.join(rendererPath, '/index.html')))
        .then(() => {
          if (debug) {
            mainWindow.webContents.openDevTools({
              mode: 'right',
            });
          }

          mainWindow.on('closed', () => {
            mainWindow = null;
          });

          mainWindow.maximize();
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
