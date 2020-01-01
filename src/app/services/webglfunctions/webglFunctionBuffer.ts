import { IWebGLFunc } from '../../../shared/IPC';

class WebGLFunctionBuffer {
  private _functions: Map<number, IWebGLFunc> = new Map<number, IWebGLFunc>();
  private _currentId = 0;

  public clear(): void {
    this._functions.clear();
    this._currentId = 0;
  }

  public add(func: IWebGLFunc, callback: (func: IWebGLFunc) => void): void {
    // allready created, this should normally not happen ;-)
    if (this._functions.has(func.id)) {
      console.error(`add WebGL function ${func.name} id: ${func.id} already exists`);
      return;
    }

    this._functions.set(func.id, func);
    // check if current function id is available
    let currentFunc = this._functions.get(this._currentId);
    while (currentFunc) {
      callback(currentFunc);
      this._functions.delete(this._currentId);
      this._currentId++;
      currentFunc = this._functions.get(this._currentId);
    }
  }

  public hasFunctions(): boolean {
    return this._functions.size > 0;
  }
}

export const WebGLFunctionBufferSingleton = new WebGLFunctionBuffer();
