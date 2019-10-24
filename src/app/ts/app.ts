import '../scss/app.scss';
import * as path from 'path';
import { IPCChannel, IWebGLFunc } from '../../shared/IPC';
import { ipcRenderer, remote } from 'electron';
import { ISharedConfiguration } from '../../shared/ISharedConfiguration';

const sharedConfiguration = remote.getGlobal('sharedConfiguration') as ISharedConfiguration;
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
        const appPath = path.resolve(remote.app.getAppPath());
        const preloadPath = path.join(appPath, 'preload.js');
        console.log(`preloadPath: ${preloadPath}`);
        webGLWindow = new remote.BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            preload: preloadPath,
          },
        });

        webGLWindow.maximize();
        webGLWindow.webContents.openDevTools();
        await webGLWindow.loadURL(url);

        if (debugInfoEl) {
          const thisPid = remote.getCurrentWebContents().getOSProcessId();
          const webGLWindowPid = webGLWindow.webContents.getOSProcessId();
          debugInfoEl.innerHTML = `Main Window PID: ${thisPid}<br>WebGL Window PID: ${webGLWindowPid}`;
        }
        console.log(url);
      }
    });
  }

  if (traceCheckBoxEl) {
    traceCheckBoxEl.checked = sharedConfiguration.traceWebGLFunctions;
    traceCheckBoxEl.addEventListener('change', (/*ev: Event*/) => {
      sharedConfiguration.traceWebGLFunctions = traceCheckBoxEl.checked;
    });
  }

  ipcRenderer.on(IPCChannel.WebGLFunc, (event, arg: IWebGLFunc) => {
    console.log(arg);
  });
});
