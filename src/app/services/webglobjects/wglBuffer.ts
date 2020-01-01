import { WGLObject, Constants } from './wglObject';
import { IWebGLFunc } from '../../../shared/IPC';

type BufferUsage = Constants.STATIC_DRAW | Constants.DYNAMIC_DRAW | Constants.STREAM_DRAW;

type BufferType =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export class WGLBuffer extends WGLObject {
  private _usage: BufferUsage;
  private _buffer: BufferType;

  public get usage(): BufferUsage {
    return this._usage;
  }

  public get buffer(): BufferType {
    return this._buffer;
  }

  /*
  public bufferData(target: BufferTarget, size: number, usage: BufferUsage): void {}
  public bufferData(target: BufferTarget, data: ArrayBuffer | null, usage: BufferUsage): void {}
  */

  public bufferData(func: IWebGLFunc): void {
    this._usage = func.args[2];

    const bufferConstructor = window[func.bufferType];
    //console.log(`buffer #${this.id}: ${func.bufferType}`);

    if (bufferConstructor) {
      this._buffer = new bufferConstructor(func.args[1].buffer);
    }
  }
}
