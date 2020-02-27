import { ipcRenderer, remote } from 'electron';
import { IPCChannel, IWebGLFunc, OpaqueWebGLObjects } from '../shared/IPC';
import { ISharedConfiguration } from '../shared/ISharedConfiguration';
import { getImageDataFromHTMLImage, getImageDataFromCanvas } from '../shared/imageTools';
import { registerDevToolsShortCutWeb } from '../shared/toggleDevTools';

const sharedObject = remote.getGlobal('sharedConfiguration') as ISharedConfiguration;

console.log('Hello from the preload script of the webgl window');
console.log(`Id of the electron appclication window: ${sharedObject.appWindowId}`);

let funcId = 0;
let tagId = 0;

registerDevToolsShortCutWeb();

function proxyFunc(funcName, args, returnValue): void {
  //console.log(`WebGL function called: ${funcName}`);
  if (sharedObject.traceWebGLFunctions) {
    const funcObject: IWebGLFunc = {
      name: funcName,
      args,
      id: funcId++,
    };

    if (returnValue && returnValue instanceof Object) {
      // check if it has already a tag
      funcObject.tag = {
        name: returnValue[Symbol.toStringTag],
        id: tagId++,
      };

      // augment the WebGLObject
      returnValue.tag = funcObject.tag;
    }

    // only send the first GL calls
    if (funcObject.id < 2000) {
      //console.log(`WebGL call #${funcObject.id}: ${funcObject.name}`, funcObject.args);

      // special handling for textures
      if (funcObject.name === 'texImage2D') {
        console.log(`WebGL call #${funcObject.id}: ${funcObject.name}`, funcObject.args);
        if (args[5].constructor.name === 'HTMLImageElement') {
          console.log(args[5]);
          const imgData = getImageDataFromHTMLImage(args[5]);
          console.log(imgData.data.byteLength);
          args[5] = {
            data: imgData.data,
            width: imgData.width,
            height: imgData.height,
          };
          console.log(args[5]);
        } else if (args[5].constructor.name === 'HTMLCanvasElement') {
          console.log(args[5]);
          const imgData = getImageDataFromCanvas(args[5]);
          console.log(imgData.data.byteLength);
          args[5] = {
            data: imgData.data,
            width: imgData.width,
            height: imgData.height,
          };
          console.log(args[5]);
        }
      }

      // check if args is a opaque webgl object
      const newArgs = [];
      for (const arg of args) {
        if (arg && typeof arg === 'object' && OpaqueWebGLObjects.includes(arg.constructor.name)) {
          newArgs.push({
            tag: arg.tag,
          });
        } else {
          newArgs.push(arg);
        }
      }

      funcObject.args = newArgs;

      try {
        ipcRenderer.sendTo(sharedObject.appWindowId, IPCChannel.WebGLFunc, funcObject);
      } catch (error) {
        console.error(error);
      }
    }
  }
}

function createWebGLProxy(obj, contextId: string): void {
  let propNames;
  if (contextId === 'webgl' || contextId === 'experimental-webgl') {
    propNames = Object.getOwnPropertyNames(WebGLRenderingContext.prototype);
  } else if (contextId === 'webgl2') {
    propNames = Object.getOwnPropertyNames(WebGL2RenderingContext.prototype);
  } else {
    return;
  }
  for (const propName of propNames) {
    const prop = obj[propName];
    if (Object.prototype.toString.call(prop) === '[object Function]') {
      obj[propName] = (function(funcName) {
        return function(...args) {
          const returnValue = prop.apply(this, args);
          proxyFunc.call(this, funcName, args, returnValue);
          return returnValue;
        };
      })(propName);
    }
  }
}

// save original getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function injectedGetConext(contextId: string, contextAttributes): any {
  console.log(`contextId: ${contextId}`);
  console.log(`contextAttributes: ${contextAttributes}`);

  // create original context
  const context = originalGetContext.call(this, contextId, contextAttributes);

  createWebGLProxy(context, contextId);

  return context;
}

// replace the original getContext
HTMLCanvasElement.prototype.getContext = injectedGetConext;
