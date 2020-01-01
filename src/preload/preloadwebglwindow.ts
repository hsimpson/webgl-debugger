import { ipcRenderer, remote } from 'electron';
import { IPCChannel, IWebGLFunc } from '../shared/IPC';
import { ISharedConfiguration } from '../shared/ISharedConfiguration';

const sharedObject = remote.getGlobal('sharedConfiguration') as ISharedConfiguration;

console.log('this is the preload script transpiled from TS');
console.log(`Id of the electron appclication window: ${sharedObject.appWindowId}`);

let funcId = 0;
let tagId = 0;

function proxyFunc(funcName, args, returnValue): void {
  //console.log(`WebGL function called: ${funcName}`);
  if (sharedObject.traceWebGLFunctions) {
    const funcObject: IWebGLFunc = {
      name: funcName,
      args,
      returnValue,
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

    // special handling for buffers
    if (funcObject.name === 'bufferData') {
      funcObject.bufferType = args[1].constructor.name;
    }

    // only send the first GL calls
    if (funcObject.id < 100) {
      //console.log(`WebGL call #${funcObject.id}: ${funcObject.name}`);
      //ipcRenderer.send(IPCChannel.WebGLFunc, funcObject);
      ipcRenderer.sendTo(sharedObject.appWindowId, IPCChannel.WebGLFunc, funcObject);
    }
  }
}

function createWebGLProxy(obj, contextId: string): void {
  let propNames;
  if (contextId === 'webgl' || contextId === 'experimental-webgl') {
    propNames = Object.getOwnPropertyNames(WebGLRenderingContext.prototype);
  } else if (contextId === 'webgl2') {
    propNames = Object.getOwnPropertyNames(WebGL2RenderingContext.prototype);
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
