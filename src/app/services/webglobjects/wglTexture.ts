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

export type TextureInternalFormat =
  | Constants.ALPHA
  | Constants.LUMINANCE
  | Constants.LUMINANCE_ALPHA
  | Constants.RGB
  | Constants.RGBA;

export class WGLTexture extends WGLObject {
  private _target: TextureTarget;
  private _level: number;
  private _width: number;
  private _height: number;
  private _data: Uint8ClampedArray;
  private _internalFormat: TextureInternalFormat;

  public get data(): Uint8ClampedArray {
    return this._data;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get internalFormat(): TextureInternalFormat {
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
    console.log(`WebGL call #${func.id}: ${func.name}`, func.args);
    if (func.args.length === 6) {
      console.log(`Byte length: ${func.args[5].data.length}`);
      this._data = func.args[5].data;
      this._width = func.args[5].width;
      this._height = func.args[5].height;
    }
  }
}
