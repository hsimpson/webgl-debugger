import { ISharedConfiguration } from '../../shared/ISharedConfiguration';
import { webContents } from 'electron';

// this file needs to be a module otherwise 'declare global' does not work
export {};

declare global {
  // tslint:disable-next-line: interface-name
  interface Window {
    require(string): any;
  }
}

// nodeIntegration: true is needed in the main process, to have window.require available
const electron = window.require('electron');
const path = window.require('path');
const sharedConfiguration = electron.remote.getGlobal('sharedConfiguration') as ISharedConfiguration;
let webGLWindow;

document.addEventListener('DOMContentLoaded', () => {
  const urlInputEl = document.getElementById('urlinput') as HTMLInputElement;
  const traceCheckBoxEl = document.getElementById('traceWebGLFunctions') as HTMLInputElement;
  const debugInfoEl = document.getElementById('debuginfo');

  if (urlInputEl) {
    urlInputEl.value = 'https://mdn.github.io/webgl-examples/tutorial/sample7/';
    urlInputEl.addEventListener('keyup', async (ev: KeyboardEvent) => {
      if (ev.code === 'Enter' || ev.code === 'NumpadEnter') {
        const url = urlInputEl.value;
        //const preloadPath = `${path.join(path.dirname(__filename), 'app/preload/preload.js')}`;
        // FIXME: this looks like it must be absoulute file path
        //const appPath = path.dirname(electron.remote.app.getAppPath());
        const preloadPath = `G:\\src\\webapps\\webgl-debugger\\dist\\app\\preload\\preload.js`;
        //const preloadPath = path.join(appPath, '../app/preload/preload.js');
        console.log(`preloadPath: ${preloadPath}`);
        webGLWindow = new electron.remote.BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            preload: preloadPath
          }
        });

        webGLWindow.maximize();
        webGLWindow.webContents.openDevTools();
        await webGLWindow.loadURL(url);

        if (debugInfoEl) {
          const thisPid = electron.remote.getCurrentWebContents().getOSProcessId();
          const webGLWindowPid = webGLWindow.webContents.getOSProcessId();
          debugInfoEl.innerHTML = `Main Window PID: ${thisPid}<br>WebGL Window PID: ${webGLWindowPid}`;
        }
        console.log(url);
      }
    });
  }

  if (traceCheckBoxEl) {
    traceCheckBoxEl.checked = sharedConfiguration.traceWebGLFunctions;
    traceCheckBoxEl.addEventListener('change', (ev: Event) => {
      sharedConfiguration.traceWebGLFunctions = traceCheckBoxEl.checked;
    });
  }

  electron.ipcRenderer.on('webgl-func', (event, arg) => {
    console.log(arg);
  });
});
