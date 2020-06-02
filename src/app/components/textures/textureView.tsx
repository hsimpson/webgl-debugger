import './textureView.scss';
import React, { Fragment } from 'react';
import { WGLTexture } from '../../services/webglobjects/wglTexture';
import ResizeObserver from 'resize-observer-polyfill';
import CanvasBackground from '../../../images/texture_background.png';
import { Constants } from '../../services/webglobjects/wglObject';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

export interface ITextureViewProp {
  texture: WGLTexture;
}

enum DisplayColorFormat {
  Decimal,
  FloatNormalized,
  Percent,
  HexaDecimal,
}

enum HDRFormat {
  RGBE,
  RGBM,
  RGBD,
  EXR,
}

enum HDRToneMapping {
  None,
  Linear,
  Reinhard,
}

interface ITextureViewState {
  canvasWidth: number;
  canvasHeight: number;
  zoomFactor: number;
  imageOffsetX: number;
  imageOffsetY: number;
  canvasCursorX: number;
  canvasCursorY: number;
  cursorR: number;
  cursorG: number;
  cursorB: number;
  cursorA: number;
  cursorColorFormat: DisplayColorFormat;
  isHDRTexture: boolean;
  hdrFormat: HDRFormat;
  hdrExposure: number;
  hdrToneMapping: HDRToneMapping;
}

export class TextureView extends React.Component<ITextureViewProp, ITextureViewState> {
  public readonly state: ITextureViewState = {
    canvasWidth: 100,
    canvasHeight: 100,
    zoomFactor: 1.0,
    imageOffsetX: 0,
    imageOffsetY: 0,
    canvasCursorX: 0,
    canvasCursorY: 0,
    cursorR: 0,
    cursorG: 0,
    cursorB: 0,
    cursorA: 1.0,
    cursorColorFormat: DisplayColorFormat.Decimal,
    isHDRTexture: false,
    hdrFormat: HDRFormat.RGBE,
    hdrExposure: 1.0,
    hdrToneMapping: HDRToneMapping.Reinhard,
  };

  private _canvasRef = React.createRef<HTMLCanvasElement>();
  private _ro: ResizeObserver;
  private _ctx: CanvasRenderingContext2D;
  private _backGroundPattern: CanvasPattern;
  private _imagBitMap: ImageBitmap;
  private _mouseDownX = 0;
  private _mouseDownY = 0;
  private _textureData: Uint8ClampedArray;

  public componentDidMount(): void {
    this._ctx = this._canvasRef.current.getContext('2d');
    this._ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (entries.length) {
        const rect = entries[0].contentRect;
        this.setState({ canvasWidth: rect.width, canvasHeight: rect.height });
        this._calcFitToViewScale();
        this._draw();
      }
    });
    this._ro.observe(this._canvasRef.current);

    this._canvasRef.current.addEventListener('mousemove', this._onCanvasMouseMove);
    this._canvasRef.current.addEventListener('wheel', this._onCanvasMouseWheel);
    this._canvasRef.current.addEventListener('mousedown', this._onCanvasMouseDown);
    //this._canvasRef.current.addEventListener('mouseup', this._onCanvasMouseUp);
  }

  public componentWillUnmount(): void {
    this._ro.disconnect();
    this._ro = null;
  }

  public componentDidUpdate(prevProps: ITextureViewProp /*, prevState: ITextureViewState*/): void {
    if (this.props.texture !== prevProps.texture) {
      this._imagBitMap = undefined;
      if (this.props.texture.type === Constants.FLOAT) {
        this.setState({
          isHDRTexture: true,
          hdrFormat: HDRFormat.EXR,
        });
      }
      this._calcFitToViewScale();
      this._draw();
    }

    /*
    if (prevState.imageOffsetX !== this.state.imageOffsetX || prevState.imageOffsetY !== this.state.imageOffsetY) {
      //console.log(`imageOffset: ${this.state.imageOffsetX}, ${this.state.imageOffsetY}`);
      this._draw();
    }
    */
  }

  private _getHDRImageData(inputArray: Uint8ClampedArray | Float32Array): Uint8ClampedArray {
    console.time('HDR convert');
    const uint8ClampedArray = new Uint8ClampedArray(inputArray.length);
    let convertToLinear = false;

    if (inputArray.constructor.name.startsWith('Uint8')) {
      convertToLinear = true;
    }

    for (let i = 0; i < inputArray.length; i++) {
      let r: number, g: number, b: number, a: number;

      r = inputArray[i];
      g = inputArray[i + 1];
      b = inputArray[i + 2];
      a = inputArray[i + 3];

      if (convertToLinear) {
        r /= 255;
        g /= 255;
        b /= 255;
        a /= 255;
      }

      if (this.state.hdrFormat === HDRFormat.RGBE) {
        const exp = Math.pow(2, a * 255 - 128.0);
        r = r * exp;
        g = g * exp;
        b = b * exp;
      } else if (this.state.hdrFormat === HDRFormat.RGBM) {
        const rgbm = a * 16.0;
        r = r * rgbm;
        g = g * rgbm;
        b = b * rgbm;
      } else if (this.state.hdrFormat === HDRFormat.RGBD) {
        const rgbd = 256.0 / 255.0 / a;
        r = r * rgbd;
        g = g * rgbd;
        b = b * rgbd;
      } else if (this.state.hdrFormat === HDRFormat.EXR) {
        // do nothing here ;-)
      }

      // tone mapping
      if (this.state.hdrToneMapping === HDRToneMapping.Linear) {
        r = this.state.hdrExposure * r;
        g = this.state.hdrExposure * g;
        b = this.state.hdrExposure * b;
      } else if (this.state.hdrToneMapping === HDRToneMapping.Reinhard) {
        r = this.state.hdrExposure * r;
        g = this.state.hdrExposure * g;
        b = this.state.hdrExposure * b;

        r = r / (1 + r);
        g = g / (1 + g);
        b = b / (1 + b);
      }

      // linear to sRGB
      if (r <= 0.0031308) {
        r = r * 12.92;
      } else {
        r = Math.pow(r, 0.41666) * 1.055 - 0.055;
      }

      if (g <= 0.0031308) {
        g = g * 12.92;
      } else {
        g = Math.pow(g, 0.41666) * 1.055 - 0.055;
      }

      if (b <= 0.0031308) {
        b = b * 12.92;
      } else {
        b = Math.pow(b, 0.41666) * 1.055 - 0.055;
      }

      // sRGB to Uint8Clamped
      uint8ClampedArray[i] = r * 255;
      uint8ClampedArray[++i] = g * 255;
      uint8ClampedArray[++i] = b * 255;
      uint8ClampedArray[++i] = 255; // set alpha to 255
    }

    console.timeEnd('HDR convert');
    return uint8ClampedArray;
  }

  private async _draw(): Promise<void> {
    console.time('draw duration');
    //console.time('draw Background');
    await this._drawBackground();
    //console.timeEnd('draw Background');
    if (this.props.texture) {
      if (!this._imagBitMap) {
        if (this.state.isHDRTexture) {
          this._textureData = this._getHDRImageData(this.props.texture.data);
        } else if (this.props.texture.type === Constants.UNSIGNED_BYTE) {
          this._textureData = this.props.texture.data as Uint8ClampedArray;
        }

        let imgData: ImageData;
        if (this._textureData) {
          imgData = new ImageData(this._textureData, this.props.texture.width, this.props.texture.height);
          this._imagBitMap = await window.createImageBitmap(imgData);
        }
      }

      if (this._imagBitMap) {
        this._ctx.imageSmoothingEnabled = false;
        this._ctx.drawImage(
          this._imagBitMap,
          this.state.imageOffsetX,
          this.state.imageOffsetY,
          this.props.texture.width * this.state.zoomFactor,
          this.props.texture.height * this.state.zoomFactor
        );
      }
      console.timeEnd('draw duration');
    }
  }

  private _calcFitToViewScale(): void {
    let zoomFactor = 1.0;
    let imageOffsetX = 0;
    let imageOffsetY = 0;

    if (this.props.texture) {
      zoomFactor = Math.min(
        this._canvasRef.current.width / this.props.texture.width,
        this._canvasRef.current.height / this.props.texture.height
      );

      // get the top left position of the image
      imageOffsetX = this._canvasRef.current.width / 2 - (this.props.texture.width / 2) * zoomFactor;
      imageOffsetY = this._canvasRef.current.height / 2 - (this.props.texture.height / 2) * zoomFactor;
    }
    this.setState({ zoomFactor, imageOffsetX, imageOffsetY });
  }

  private async _drawBackground(): Promise<void> {
    return new Promise((resolve) => {
      if (this._backGroundPattern) {
        this._ctx.fillStyle = this._backGroundPattern;
        this._ctx.fillRect(0, 0, this._canvasRef.current.width, this._canvasRef.current.height);
        resolve();
      } else {
        const img = new Image();
        img.onload = () => {
          this._backGroundPattern = this._ctx.createPattern(img, 'repeat');
          this._ctx.fillStyle = this._backGroundPattern;
          this._ctx.fillRect(0, 0, this._canvasRef.current.width, this._canvasRef.current.height);
          resolve();
        };
        img.src = CanvasBackground;
      }
    });
  }

  private _onCanvasMouseMove = (event: MouseEvent): void => {
    let imageOffsetX = this.state.imageOffsetX;
    let imageOffsetY = this.state.imageOffsetY;
    let needsRedraw = false;

    if (event.buttons === 4) {
      // middle mouse button pressed
      imageOffsetX += event.offsetX - this._mouseDownX;
      imageOffsetY += event.offsetY - this._mouseDownY;
      this._mouseDownX = event.offsetX;
      this._mouseDownY = event.offsetY;
      needsRedraw = true;
    }

    let canvasCursorX = Math.round((event.offsetX - imageOffsetX) / this.state.zoomFactor);
    let canvasCursorY = Math.round((event.offsetY - imageOffsetY) / this.state.zoomFactor);

    if (this.props.texture) {
      canvasCursorX = Math.max(0, Math.min(canvasCursorX, this.props.texture.width - 1));
      canvasCursorY = Math.max(0, Math.min(canvasCursorY, this.props.texture.height - 1));
    }

    const isRGBA = this.props.texture.internalFormat === Constants.RGBA;

    // calc array offset
    let dataOffset = this.props.texture.width * canvasCursorY + canvasCursorX;
    if (isRGBA) {
      dataOffset *= 4;
    } else {
      dataOffset *= 3;
    }

    const cursorR = this._textureData[dataOffset];
    const cursorG = this._textureData[++dataOffset];
    const cursorB = this._textureData[++dataOffset];
    const cursorA = isRGBA ? this._textureData[++dataOffset] : 1.0;

    this.setState({
      canvasCursorX,
      canvasCursorY,
      imageOffsetX,
      imageOffsetY,
      cursorR,
      cursorG,
      cursorB,
      cursorA,
    });
    if (needsRedraw) {
      this._draw();
    }
  };

  private _onCanvasMouseWheel = (event: WheelEvent): void => {
    let zoomFactor = this.state.zoomFactor;
    const fixZoom = 1.25;
    if (event.deltaY < 0) {
      zoomFactor *= fixZoom;
    } else {
      zoomFactor /= fixZoom;
    }

    this.setState({ zoomFactor });
    this._draw();

    //console.log(`zoomFactor: ${zoomFactor}`);
  };

  private _onCanvasMouseDown = (event: MouseEvent): void => {
    this._mouseDownX = event.offsetX;
    this._mouseDownY = event.offsetY;
  };

  //private _onCanvasMouseUp = (event: MouseEvent): void => {};

  private _handleColorFormatChange = (event: React.ChangeEvent<{ value: number }>): void => {
    const cursorColorFormat = event.target.value as DisplayColorFormat;
    this.setState({ cursorColorFormat });
  };

  private _handleIsHDRChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const isHDRTexture = event.target.checked;
    this.setState({ isHDRTexture });

    // code to handle hdr or ldr
    this._imagBitMap = undefined;
    this._draw();
  };

  private _handleHDRFormatChange = (event: React.ChangeEvent<{ value: number }>): void => {
    const hdrFormat = event.target.value as HDRFormat;
    this.setState({ hdrFormat });

    this._imagBitMap = undefined;
    this._draw();
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  private _handleExposureChange = (_event: React.ChangeEvent<{}>, newValue: number | number[]): void => {
    this.setState({ hdrExposure: newValue as number });

    this._imagBitMap = undefined;
    this._draw();
  };

  private _handleHDRToneMappingChange = (event: React.ChangeEvent<{ value: number }>): void => {
    const hdrToneMapping = event.target.value as HDRToneMapping;
    this.setState({ hdrToneMapping });

    this._imagBitMap = undefined;
    this._draw();
  };

  public render(): React.ReactNode {
    const cursorColorStyle = {
      backgroundColor: `rgba(${this.state.cursorR}, ${this.state.cursorG}, ${this.state.cursorB})`,
    };

    let displayR: number | string = this.state.cursorR;
    let displayB: number | string = this.state.cursorG;
    let displayG: number | string = this.state.cursorB;
    let displayA: number | string = this.state.cursorA;

    if (this.state.cursorColorFormat === DisplayColorFormat.FloatNormalized) {
      displayR = (displayR / 255).toFixed(3);
      displayG = (displayG / 255).toFixed(3);
      displayB = (displayB / 255).toFixed(3);
      displayA = (displayA / 255).toFixed(3);
    } else if (this.state.cursorColorFormat === DisplayColorFormat.Percent) {
      displayR = ((displayR / 255) * 100).toFixed(2) + ' %';
      displayG = ((displayG / 255) * 100).toFixed(2) + ' %';
      displayB = ((displayB / 255) * 100).toFixed(2) + ' %';
      displayA = ((displayA / 255) * 100).toFixed(2) + ' %';
    } else if (this.state.cursorColorFormat === DisplayColorFormat.HexaDecimal) {
      displayR = displayR.toString(16);
      displayG = displayG.toString(16);
      displayB = displayB.toString(16);
      displayA = displayA.toString(16);
    }

    return (
      <div className="TextureView">
        <div className="TextureViewControls">
          <FormControlLabel
            control={
              <Checkbox checked={this.state.isHDRTexture} onChange={this._handleIsHDRChange} color="primary"></Checkbox>
            }
            label="HDR?"
          />
          {this.state.isHDRTexture && (
            <Fragment>
              <InputLabel id="hdrformat-select-label">HDR format</InputLabel>
              <Select
                labelId="hdrformat-select-label"
                value={this.state.hdrFormat}
                onChange={this._handleHDRFormatChange}>
                <MenuItem value={HDRFormat.RGBE}>RGBE</MenuItem>
                {/*
                <MenuItem value={HDRFormat.RGBM}>RGBM</MenuItem>
                <MenuItem value={HDRFormat.RGBD}>RGBD</MenuItem>
                */}
                <MenuItem value={HDRFormat.EXR}>EXR</MenuItem>
              </Select>
              <InputLabel id="hdrtonemapping-select-label">HDR Tonemapping</InputLabel>
              <Select
                labelId="hdrtonemapping-select-label"
                value={this.state.hdrToneMapping}
                onChange={this._handleHDRToneMappingChange}>
                <MenuItem value={HDRToneMapping.None}>None</MenuItem>
                <MenuItem value={HDRToneMapping.Linear}>Linear</MenuItem>
                <MenuItem value={HDRToneMapping.Reinhard}>Reinhard</MenuItem>
              </Select>
              {this.state.hdrToneMapping !== HDRToneMapping.None && (
                <div className="TextureViewControlsExposureSlider">
                  <Typography id="exposure-slider-label">Exposure</Typography>

                  <Slider
                    aria-labelledby="exposure-slider-label"
                    value={this.state.hdrExposure}
                    min={0}
                    max={10}
                    step={0.1}
                    onChange={this._handleExposureChange}
                    valueLabelDisplay={'auto'}></Slider>
                </div>
              )}
            </Fragment>
          )}
        </div>
        <div className="TextureViewInfoContainer">
          <span>{`Texture internal format: ${this.props.texture.internalFormatString}`}</span>
          <span>{`width: ${this.props.texture.width} px`}</span>
          <span>{`height: ${this.props.texture.height} px`}</span>
          <span>{`Cursor position: (${this.state.canvasCursorX},${this.state.canvasCursorY})`}</span>
          <span>{`R: ${displayR}`}</span>
          <span>{`G: ${displayG}`}</span>
          <span>{`B: ${displayB}`}</span>
          <span>{`A: ${displayA}`}</span>
          <InputLabel id="colorformat-select-label">RGB(A) format</InputLabel>
          <Select
            labelId="colorformat-select-label"
            value={this.state.cursorColorFormat}
            onChange={this._handleColorFormatChange}>
            <MenuItem value={DisplayColorFormat.Decimal}>0 - 255</MenuItem>
            <MenuItem value={DisplayColorFormat.FloatNormalized}>0.0 - 1.0</MenuItem>
            <MenuItem value={DisplayColorFormat.Percent}>0% - 100%</MenuItem>
            <MenuItem value={DisplayColorFormat.HexaDecimal}>00-FF</MenuItem>
          </Select>
          <div className="TextureViewCursorColor" style={cursorColorStyle}></div>
        </div>
        <div className="TextureViewCanvasContainer">
          <canvas
            className="TextureViewCanvas"
            ref={this._canvasRef}
            width={this.state.canvasWidth}
            height={this.state.canvasHeight}></canvas>
        </div>
      </div>
    );
  }
}
