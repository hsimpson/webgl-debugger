import { ipcRenderer, remote } from 'electron';
import { IWebGLFunc } from '../shared/IPC';

console.log('this is the preload script transpiled from TS');

const sharedObject = remote.getGlobal('sharedConfiguration');
let count = 0;

let tagcount = 0;

function proxyFunc(funcName, args, returnValue): void {
  //console.log(`WebGL function called: ${funcName}`);
  if (sharedObject.traceWebGLFunctions) {
    const funcObject: IWebGLFunc = {
      name: funcName,
      args,
      returnValue,
      count: count++,
    };

    if (returnValue && returnValue instanceof Object) {
      // check if it has already a tag
      funcObject.tag = {
        name: returnValue[Symbol.toStringTag],
        id: tagcount++, // TODO: handle WebGLObject resource ID's
      };

      // augment the WebGLObject
      returnValue.tag = funcObject.tag;
    }

    ipcRenderer.send('WebGLFunc', funcObject);
  }
}

function createWebGLProxy(obj, contextId): void {
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
function injectedGetConext(contextId, contextAttributes): any {
  console.log(`contextId: ${contextId}`);
  console.log(`contextAttributes: ${contextAttributes}`);

  // create original context
  const context = originalGetContext.call(this, contextId, contextAttributes);

  createWebGLProxy(context, contextId);

  return context;
}

// replace the original getContext
HTMLCanvasElement.prototype.getContext = injectedGetConext;
