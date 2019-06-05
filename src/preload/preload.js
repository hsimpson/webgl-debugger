/* eslint-disable no-console */
'use stric';
const { ipcRenderer, remote } = require('electron');

console.log('this is the preload script');

const sharedObject = remote.getGlobal('sharedConfiguration');

function proxyFunc(funcName, args) {
  //console.log(`WebGL function called: ${funcName}`);
  if (sharedObject.traceWebGLFunctions) {
    ipcRenderer.send('webgl-func', {
      funcName,
      args
    });
  }
}

function createWebGLProxy(obj, contextId) {
  let propNames;
  if (contextId === 'webgl' || contextId === 'experimental-webgl') {
    propNames = Object.getOwnPropertyNames(WebGLRenderingContext.prototype);
  } else if (contextId === 'webgl2') {
    propNames = Object.getOwnPropertyNames(WebGL2RenderingContext.prototype);
  }
  for (const propName of propNames) {
    const prop = obj[propName];
    if (Object.prototype.toString.call(prop) === '[object Function]') {
      obj[propName] = (function(fname) {
        return function() {
          const returnValue = prop.apply(this, arguments);
          proxyFunc.call(this, fname, arguments, returnValue);
          return returnValue;
        };
      })(propName);
    }
  }
}

// save original getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;

function injected_getConext(contextId, contextAttributes) {
  console.log(`contextId: ${contextId}`);
  console.log(`contextAttributes: ${contextAttributes}`);

  // create original context
  const context = originalGetContext.call(this, contextId, contextAttributes);

  createWebGLProxy(context, contextId);

  return context;
}

// replace the original getContext
HTMLCanvasElement.prototype.getContext = injected_getConext;
