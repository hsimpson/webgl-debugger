/*
import './scss/app.scss';
import * as path from 'path';
import { BrowserWindow, ipcRenderer, remote } from 'electron';
import { IPCChannel, IWebGLFunc } from '../shared/IPC';
import { ISharedConfiguration } from '../shared/ISharedConfiguration';
*/

import './index.scss';
import React from 'react';
import ReactDOM from 'react-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCogs, faRocket } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

import { Main } from './components/main/main';

// this is used to add all from FA
library.add(faCogs, faRocket, faQuestionCircle);

window.__setTheme = () => {
  const theme = window.localStorage.userTheme ?? window.localStorage.osTheme ?? 'dark';
  if (theme === 'dark') {
    document.body.classList.remove('theme--light');
    document.body.classList.add('theme--dark');
  } else {
    document.body.classList.remove('theme--dark');
    document.body.classList.add('theme--light');
  }
  ReactDOM.render(<Main theme={theme} />, document.getElementById('root'));
};
window.__setTheme();

/*
const sharedConfiguration = remote.getGlobal('sharedConfiguration') as ISharedConfiguration;
let webGLWindow: BrowserWindow;

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
        const preloadPath = path.join(appPath, 'preloadwebglwindow.js');
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
        console.log(url);

        // just wait a bit ;-)
        //syncWait(3000);
        await webGLWindow.loadURL(url);

        if (debugInfoEl) {
          const thisPid = remote.getCurrentWebContents().getOSProcessId();
          const webGLWindowPid = webGLWindow.webContents.getOSProcessId();
          debugInfoEl.innerHTML = `Main Window PID: ${thisPid}<br>WebGL Window PID: ${webGLWindowPid}`;
        }
      }
    });
  }

  if (traceCheckBoxEl) {
    traceCheckBoxEl.checked = sharedConfiguration.traceWebGLFunctions;
    traceCheckBoxEl.addEventListener('change', () => {
      sharedConfiguration.traceWebGLFunctions = traceCheckBoxEl.checked;
    });
  }

  ipcRenderer.on(IPCChannel.WebGLFunc, (event, arg: IWebGLFunc) => {
    if (arg.count < 100) {
      console.log(arg);
    }
  });
});
*/
