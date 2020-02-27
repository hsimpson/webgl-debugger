import { WGLObject, Constants } from './wglObject';
import { IWebGLFunc } from '../../../shared/IPC';

export type TextureTarget =
  | Constants.TEXTURE_2D
  | Constants.TEXTURE_CUBE_MAP
  | Constants.TEXTURE_CUBE_MAP_POSITIVE_X
  | Constants.TEXTURE_CUBE_MAP_NEGATIVE_X
  | Constants.TEXTURE_CUBE_MAP_POSITIVE_Y
  | Constants.TEXTURE_CUBE_MAP_NEGATIVE_Y
  | Constants.TEXTURE_CUBE_MAP_POSITIVE_Z
  | Constants.TEXTURE_CUBE_MAP_NEGATIVE_Z;

export type TextureFormat =
  | Constants.ALPHA
  | Constants.LUMINANCE
  | Constants.LUMINANCE_ALPHA
  | Constants.RGB
  | Constants.RGBA;

export type TextureType =
  | Constants.UNSIGNED_BYTE
  | Constants.UNSIGNED_SHORT_5_6_5
  | Constants.UNSIGNED_SHORT_4_4_4_4
  | Constants.UNSIGNED_SHORT_5_5_5_1;

export class WGLTexture extends WGLObject {
  private _target: TextureTarget;
  private _format: TextureFormat;
  private _type: TextureType;
  private _level: number;
  private _width: number;
  private _height: number;
  private _border: number;
  private _data: ArrayBuffer;
  private _internalFormat: TextureFormat;

  public get data(): Uint8ClampedArray {
    /*
    if (this._data.constructor.name !== 'Uint8ClampedArray') {
      return new Uint8ClampedArray(this._data.buffer);
    }
    */
    return new Uint8ClampedArray(this._data);
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get internalFormat(): TextureFormat {
    return this._internalFormat;
  }

  public get internalFormatString(): string {
    switch (this._internalFormat) {
      case Constants.ALPHA:
        return 'ALPHA';
      case Constants.LUMINANCE:
        return 'LUMINANCE';
      case Constants.LUMINANCE_ALPHA:
        return 'LUMINANCE_ALPHA';
      case Constants.RGB:
        return 'RGB';
      case Constants.RGBA:
        return 'RGBA';
      default:
        return 'unknown';
    }
  }

  public texImage2D(func: IWebGLFunc): void {
    this._target = func.args[0];
    this._level = func.args[1];
    this._internalFormat = func.args[2];
    this._format = func.args[3];

    //console.log(`WebGL call #${func.id}: ${func.name}`, func.args);
    if (func.args.length === 6) {
      //console.log(`Byte length: ${func.args[5].data.length}`);
      this._data = func.args[5].data.buffer;
      this._width = func.args[5].width;
      this._height = func.args[5].height;
    } else {
      // must be 9 arguments
      this._width = func.args[3];
      this._height = func.args[4];
      this._border = func.args[5];
      this._format = func.args[6];
      this._type = func.args[7];
      this._data = func.args[8]?.buffer;
    }
  }
}
