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

export type BufferTarget = Constants.ARRAY_BUFFER | Constants.ELEMENT_ARRAY_BUFFER;

export class WGLBuffer extends WGLObject {
  private _target: BufferTarget;
  private _usage: BufferUsage;
  private _buffer: BufferType;

  public get target(): BufferTarget {
    return this._target;
  }

  public get targetString(): string {
    switch (this._target) {
      case Constants.ARRAY_BUFFER:
        return 'ARRAY_BUFFER';
      case Constants.ELEMENT_ARRAY_BUFFER:
        return 'ELEMENT_ARRAY_BUFFER';
      default:
        return 'unknown';
    }
  }

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
    this._target = func.args[0];
    this._buffer = func.args[1];
    this._usage = func.args[2];
  }
}
