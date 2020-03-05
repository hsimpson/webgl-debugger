import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { BrowserWindow, Menu, app, dialog, globalShortcut, ipcMain } from 'electron';
import { ISharedConfiguration } from '../shared/ISharedConfiguration';
import windowStateKeeper = require('electron-window-state');
import { IPCChannel, IShaderValidationMessage, IShaderValidationCode, glslValidatorFailCodes } from '../shared/IPC';

//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const basePath: string = fs.realpathSync(path.join(app.getAppPath()));
//console.log(`+++ basePath: ${app.getAppPath()}`);
let appBundlePath = basePath;
const match = basePath.match(/dist(\\|\/)app$/);
//console.log(`+++ match: ${match}`);
if (match === null) {
  appBundlePath = path.join(basePath, 'dist/app');
}
//console.log(`+++ appBundlePath: ${appBundlePath}`);

const mainPath: string = fs.realpathSync(path.join(appBundlePath));
const rendererPath: string = fs.realpathSync(path.join(appBundlePath, '..'));

const debug: boolean = process.env.DEBUG !== undefined;

let mainWindow: BrowserWindow;

const createWindow = (): Promise<void> => {
  return new Promise((resolved, rejected) => {
    /*
    protocol.interceptStringProtocol('https', (request: Electron.Request, callback): void => {
      console.log(request.headers);
    });
    */

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
          enableRemoteModule: true,
        },
      });

      /* only activate this when https://github.com/electron/electron/issues/19468 is fixed
      if (debug) {
        installExtension(REACT_DEVELOPER_TOOLS)
          .then((name) => console.log(`Added Extension:  ${name}`))
          .catch((err) => console.log('An error occurred: ', err));

        //await installExtension(REACT_DEVELOPER_TOOLS);
      }
      */

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

//app.removeAllListeners('ready'); // workaround for https://github.com/electron/electron/issues/19468
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

ipcMain.handle(
  IPCChannel.ValidateShaderRequest,
  async (
    event: Electron.IpcMainInvokeEvent,
    codeObject: IShaderValidationCode
  ): Promise<IShaderValidationMessage[]> => {
    const resultMessages: IShaderValidationMessage[] = [];

    const validatorPath = path.join(rendererPath, 'glslangValidator', os.platform(), 'glslangValidator');
    const validatorArgs = ['--stdin', '-S', codeObject.stage];

    const childProcess = spawn(validatorPath, validatorArgs);
    childProcess.stdin.write(codeObject.code);
    childProcess.stdin.end();

    let stdOutData = '';
    for await (const chunk of childProcess.stdout) {
      stdOutData += chunk;
    }

    let stdErrorData = '';
    for await (const chunk of childProcess.stderr) {
      stdErrorData += chunk;
    }

    const exitCode = await new Promise<number>((resolve) => {
      childProcess.on('close', resolve);
    });

    if (exitCode === glslValidatorFailCodes.EFailUsage) {
      resultMessages.push({
        message: `Wrong parameters when starting glslangValidator.
      Arguments:
      ${validatorArgs.join('\n')}
      stderr:
      ${stdErrorData}
      `,
        lineNumber: 0,
        severity: 'ERROR',
      });
    } else if (exitCode !== glslValidatorFailCodes.ESuccess) {
      const lines = stdOutData.toString().split(/(?:\r\n|\r|\n)/g);
      for (const line of lines) {
        if (line !== '' && line !== 'stdin') {
          const matches = line.match(/WARNING:|ERROR:\s.+?(?=:(\d)+):(\d*): (\W.*)/);
          if (matches && matches.length === 4) {
            resultMessages.push({
              message: matches[3],
              lineNumber: parseInt(matches[2]),
              severity: line.startsWith('ERROR:') ? 'ERROR' : 'WARNING',
            });
            //const errorline = parseInt(matches[2]);
            //let range = new vscode.Range(errorline - 1, 0, errorline - 1, 0);
          }
        }
      }
    }

    return resultMessages;
  }
);

export default app;
