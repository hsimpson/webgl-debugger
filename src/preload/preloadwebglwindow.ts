import { ipcRenderer, remote, contentTracing } from 'electron';
import { IPCChannel, IWebGLFunc, OpaqueWebGLObjects, IShaderUpdate } from '../shared/IPC';
import { ISharedConfiguration } from '../shared/ISharedConfiguration';
import { getImageDataFromHTMLImage, getImageDataFromCanvas } from '../shared/imageTools';
import { registerDevToolsShortCutWeb } from '../shared/toggleDevTools';
import {
  WebGLProgramWithTag,
  WebGLUniformLocationWithTag,
  WebGLShaderWithTag,
} from '../app/services/webglobjects/wglObject';

const sharedObject = remote.getGlobal('sharedConfiguration') as ISharedConfiguration;

console.log('Hello from the preload script of the webgl window');
console.log(`Id of the electron appclication window: ${sharedObject.appWindowId}`);

let funcId = 0;
let tagId = 0;

// map from shader id to WebGLShader
const shaderMap = new Map<number, WebGLShader>();

// map from program id to WebGLProgram
const programMap = new Map<number, WebGLProgram>();

// map from program id to a map of uniform location string to uniform location id
const uniformLocationMap = new Map<number, Map<string, number>>();

// map from old WebGLUniformLocation id to the new WebGLUniformLocation
const newUniformLocationMap = new Map<number, WebGLUniformLocation>();

registerDevToolsShortCutWeb();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function proxyFuncBefore(funcName: string, args: any): void {
  // if it is a uniform* function (e.g. 'uniformMatrix4fv')
  if (funcName.startsWith('uniform')) {
    // check if there is a new location for the given one
    const newLoc = newUniformLocationMap.get((args[0] as WebGLUniformLocationWithTag).tag.id);
    if (newLoc) {
      args[0] = newLoc;
    }
  }

  if (funcName === 'deleteShader') {
    // remove the shader from the map
    const id = (args[0] as WebGLShaderWithTag).tag.id;
    shaderMap.delete(id);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function proxyFuncAfter(funcName: string, args: any, returnValue: any): void {
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
    if (funcObject.id < 20000) {
      //console.log(`WebGL call #${funcObject.id}: ${funcObject.name}`, funcObject.args);

      // special handling for textures
      if (funcObject.name === 'texImage2D') {
        //console.log(`WebGL call #${funcObject.id}: ${funcObject.name}`, funcObject.args);
        if (args[5].constructor.name === 'HTMLImageElement') {
          //console.log(args[5]);
          const imgData = getImageDataFromHTMLImage(args[5]);
          //console.log(imgData.data.byteLength);
          args[5] = {
            data: imgData.data,
            width: imgData.width,
            height: imgData.height,
          };
          //console.log(args[5]);
        } else if (args[5].constructor.name === 'HTMLCanvasElement') {
          //console.log(args[5]);
          const imgData = getImageDataFromCanvas(args[5]);
          //console.log(imgData.data.byteLength);
          args[5] = {
            data: imgData.data,
            width: imgData.width,
            height: imgData.height,
          };
          //console.log(args[5]);
        }
      } else if (funcObject.name === 'createShader') {
        shaderMap.set(returnValue.tag.id, returnValue);
      } else if (funcObject.name === 'createProgram') {
        programMap.set(returnValue.tag.id, returnValue);
      } else if (funcObject.name === 'getUniformLocation') {
        const programId = (funcObject.args[0] as WebGLProgramWithTag).tag.id;
        const uniformLocationId = (returnValue as WebGLUniformLocationWithTag).tag.id;
        let uniformStringMap = uniformLocationMap.get(programId);

        if (!uniformStringMap) {
          uniformStringMap = new Map<string, number>();
          uniformLocationMap.set(programId, uniformStringMap);
        }
        uniformStringMap.set(funcObject.args[1], uniformLocationId);
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

function updateShader(context: WebGLRenderingContext | WebGL2RenderingContext, shaderUpdate: IShaderUpdate): void {
  console.log(shaderUpdate);

  const program = programMap.get(shaderUpdate.programId);
  let shader = shaderMap.get(shaderUpdate.shaderId);
  let shadersReCreated = false;

  if (!program) {
    console.error(`failed to get mapped program with id: ${shaderUpdate.programId}`);
    return;
  }

  if (!shader) {
    // recreate other shader?
    if (context.getAttachedShaders(program).length === 0) {
      shadersReCreated = true;

      const otherShader = context.createShader(shaderUpdate.otherShader.type);
      context.shaderSource(otherShader, shaderUpdate.otherShader.source);
      context.compileShader(otherShader);
      if (!context.getShaderParameter(otherShader, context.COMPILE_STATUS)) {
        console.error(`failed to compile shader: ${context.getShaderInfoLog(otherShader)}`);
        return;
      }

      context.attachShader(program, otherShader);
    }
    shader = context.createShader(shaderUpdate.type);
    context.attachShader(program, shader);
  }

  context.shaderSource(shader, shaderUpdate.source);
  context.compileShader(shader);

  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    console.error(`failed to compile shader: ${context.getShaderInfoLog(shader)}`);
    return;
  }

  context.linkProgram(program);

  if (shadersReCreated) {
    for (const s of context.getAttachedShaders(program)) {
      context.detachShader(program, s);
      context.deleteShader(s);
    }
  }

  if (!context.getProgramParameter(program, context.LINK_STATUS)) {
    console.error(`failed to link program: ${context.getProgramInfoLog(program)}`);
    return;
  }

  //window['newProgram'] = program;

  // requery all uniform and attribute location bindings
  const uniformStringLocationMap = uniformLocationMap.get(shaderUpdate.programId);
  if (uniformStringLocationMap) {
    context.useProgram(program);
    for (const [locString, locId] of uniformStringLocationMap) {
      //(locationBinding as any).tag.update = 1;
      newUniformLocationMap.set(locId, context.getUniformLocation(program, locString));
    }

    console.log('unform bindings updated');

    /*
    const loc = context.getUniformLocation(program, 'uProjectionMatrix');
    context.uniformMatrix4fv(loc, false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    */
  }
}

function createWebGLProxy(context: WebGLRenderingContext | WebGL2RenderingContext, contextId: string): void {
  let propNames;
  if (contextId === 'webgl' || contextId === 'experimental-webgl') {
    propNames = Object.getOwnPropertyNames(WebGLRenderingContext.prototype);
  } else if (contextId === 'webgl2') {
    propNames = Object.getOwnPropertyNames(WebGL2RenderingContext.prototype);
  } else {
    return;
  }

  ipcRenderer.on(IPCChannel.UpdateShader, (_event, shaderUpdate: IShaderUpdate) => {
    updateShader(context, shaderUpdate);
  });

  for (const propName of propNames) {
    const prop = context[propName];
    if (Object.prototype.toString.call(prop) === '[object Function]') {
      context[propName] = (function(funcName) {
        return function(...args) {
          proxyFuncBefore.call(this, funcName, args);
          const returnValue = prop.apply(this, args);
          proxyFuncAfter.call(this, funcName, args, returnValue);
          return returnValue;
        };
      })(propName);
    }
  }
}

// save original getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function injectedGetContext(contextId: string, contextAttributes): any {
  console.log(`contextId: ${contextId}`);
  console.log(`contextAttributes: ${contextAttributes}`);

  // create original context
  const context = originalGetContext.call(this, contextId, contextAttributes);

  createWebGLProxy(context, contextId);

  return context;
}
HTMLCanvasElement.prototype.getContext = injectedGetContext;

/*
const originalGetContextOffscreen = OffscreenCanvas.prototype.getContext;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function injectedGetContextOffscreen(contextId: string, contextAttributes): any {
  console.log(`contextId: ${contextId}`);
  console.log(`contextAttributes: ${contextAttributes}`);

  // create original context
  const context = originalGetContextOffscreen.call(this, contextId, contextAttributes);

  //createWebGLProxy(context, contextId);

  return context;
}

// replace the original getContext
OffscreenCanvas.prototype.getContext = injectedGetContextOffscreen;
*/

/*
// override the worker constructor
const originalWorkerConstructor = window.Worker;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window['Worker'] as any) = function(stringUrl: string | URL, options?: WorkerOptions): Worker {
  console.log(`create worker with url: ${stringUrl}`);
  return new originalWorkerConstructor(stringUrl, options);
};
*/
