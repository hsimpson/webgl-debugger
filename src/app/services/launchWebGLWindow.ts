import * as path from 'path';
import { ipcRenderer, remote } from 'electron';
import { IPCChannel, IWebGLFunc } from '../../shared/IPC';
import { WebGLObjectsManagerSingleton } from './webglobjects/webglObjectsManager';
import { WebGLFunctionBufferSingleton } from './webglfunctions/webglFunctionBuffer';
import {
  WGLObject,
  WGLCreateFunctions,
  WGLProgramFunctions,
  WGLShaderFunctions,
  WGLBufferFunctions,
} from './webglobjects/wglObject';
import windowStateKeeper = require('electron-window-state');

export async function launchWebGLWindow(
  url: string,
  onClose: (event: Event) => void
  //onClosed: Function
): Promise<void> {
  WebGLObjectsManagerSingleton.clear();
  WebGLObjectsManagerSingleton.clear();

  const appPath = path.resolve(remote.app.getAppPath());

  const preloadPath = path.join(appPath, 'preloadwebglwindow.js');
  console.log(`preloadPath: ${preloadPath}`);

  // Load the previous state with fallback to defaults
  const mainWindowState = windowStateKeeper({
    file: 'webglwindow.json',
    defaultWidth: 640,
    defaultHeight: 480,
  });

  const webGLWindow = new remote.BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      preload: preloadPath,
    },
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(webGLWindow);

  webGLWindow.on('close', onClose);
  //webGLWindow.on('closed', onClosed);

  //webGLWindow.maximize();
  //webGLWindow.webContents.openDevTools();
  //console.log(url);

  return webGLWindow.loadURL(url);
}

ipcRenderer.on(IPCChannel.WebGLFunc, (_event, webGLFunc: IWebGLFunc) => {
  //console.log(`WebGL call #${webGLFunc.id}: ${webGLFunc.name}`, webGLFunc.args);

  WebGLFunctionBufferSingleton.add(webGLFunc, (func: IWebGLFunc) => {
    /*
      if (func.id < 100) {
      }
      */

    const WGLObjectFunctions = [...WGLProgramFunctions, ...WGLShaderFunctions];
    if (func.tag && WGLCreateFunctions.includes(func.name)) {
      WebGLObjectsManagerSingleton.create(func);
    } else if (WGLObjectFunctions.includes(func.name)) {
      const id = func?.args[0]?.tag?.id;
      const wglObj: WGLObject = WebGLObjectsManagerSingleton.getById(id);
      if (wglObj) {
        const wglObjectFunc = wglObj[func.name] as Function;
        if (wglObjectFunc && wglObjectFunc instanceof Function) {
          wglObjectFunc.apply(wglObj, func.args);
        } else {
          console.error(`WebGL function: ${func.name} not implemented in ${wglObj.name}`);
        }
      } else {
        console.error(`there is no WebGLObject with id: ${id}`);
      }
    } else if (WGLBufferFunctions.includes(func.name)) {
      if (func.name === 'bindBuffer') {
        WebGLObjectsManagerSingleton.bindBuffer(func);
      } else {
        // get the bound buffer and call the function on it
        const buffer = WebGLObjectsManagerSingleton.getBoundBuffer();
        if (buffer) {
          const wglObjectFunc = buffer[func.name] as Function;
          if (wglObjectFunc && wglObjectFunc instanceof Function) {
            wglObjectFunc.apply(buffer, [func]);
          } else {
            console.error(`WebGL function: ${func.name} not implemented in ${buffer.name}`);
          }
        } else {
          console.error('there is no bound WebGLBuffer');
        }
      }
    }
  });
});
