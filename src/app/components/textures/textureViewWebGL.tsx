import './textureViewWebGL.scss';
import React from 'react';
import { WGLTexture } from '../../services/webglobjects/wglTexture';
import { useResizeObserver } from '../../hooks/useResizeObserver';
import * as THREE from 'three';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-regular-svg-icons/faArrowAltCircleLeft';
import { faArrowAltCircleRight } from '@fortawesome/free-regular-svg-icons/faArrowAltCircleRight';
import { Constants } from '../../services/webglobjects/wglObject';
import { ColorView } from '../color/colorView';
import { Color } from '../../services/color';

export interface ITextureViewWebGLProp {
  texture: WGLTexture;
}

enum HDRFormat {
  RGBE,
  //RGBM,
  //RGBD,
  EXR,
}

enum HDRToneMapping {
  None,
  Linear,
  Reinhard,
}

enum Direction {
  Left,
  Right,
}

interface CanvasState {
  width: number;
  height: number;
}

interface HDRState {
  isHDRTexture: boolean;
  exposure: number;
  format: HDRFormat;
  toneMapping: HDRToneMapping;
}

interface PixelInfoState {
  textureX: number;
  textureY: number;
  cursorColor: Color;
}

export const TextureViewWebGL = (props: ITextureViewWebGLProp): React.ReactElement => {
  const [canvasState, setCanvasState] = React.useState<CanvasState>({
    width: 100,
    height: 100,
  });

  const [hdrState, setHdrState] = React.useState<HDRState>({
    isHDRTexture: false,
    exposure: 1.0,
    format: HDRFormat.RGBE,
    toneMapping: HDRToneMapping.Reinhard,
  });

  const [pixelInfoState, setPixelInfoState] = React.useState<PixelInfoState>({
    textureX: 0,
    textureY: 0,
    cursorColor: new Color(),
  });

  const canvasEl = React.useRef<HTMLCanvasElement>(undefined);
  const scene = React.useRef<THREE.Scene>(undefined);
  const camera = React.useRef<THREE.OrthographicCamera>(undefined);
  const renderer = React.useRef<THREE.WebGLRenderer>(undefined);
  const texture = React.useRef<THREE.Texture>(undefined);
  const material = React.useRef<THREE.MeshBasicMaterial>(undefined);
  const textureQuad = React.useRef<THREE.Mesh>(undefined);
  const raycaster = React.useRef<THREE.Raycaster>(undefined);
  const mouseNDC = React.useRef<THREE.Vector2>(new THREE.Vector2());
  const glContext = React.useRef<WebGL2RenderingContext>(undefined);

  // resize handling of canvas element
  useResizeObserver(canvasEl, (rect: DOMRectReadOnly) => {
    setCanvasState({
      width: rect.width * window.devicePixelRatio,
      height: rect.height * window.devicePixelRatio,
    });

    if (camera.current && renderer.current) {
      const aspect = rect.width / rect.height;
      const frustumHeight = camera.current.top - camera.current.bottom;

      camera.current.left = (-frustumHeight * aspect) / 2;
      camera.current.right = (frustumHeight * aspect) / 2;
      camera.current.updateProjectionMatrix();

      renderer.current.setSize(rect.width, rect.height, false);
    }
  });

  const animate = (): void => {
    requestAnimationFrame(animate);

    renderer.current.clear();
    renderer.current.render(scene.current, camera.current);
  };

  const initThreeJS: React.EffectCallback = (): void => {
    scene.current = new THREE.Scene();
    const aspect = canvasState.width / canvasState.height;
    camera.current = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0, 1000);

    glContext.current = canvasEl.current.getContext('webgl2', {
      alpha: true,
      preserveDrawingBuffer: true,
    });

    renderer.current = new THREE.WebGLRenderer({
      canvas: canvasEl.current,
      context: glContext.current as WebGLRenderingContext,
      alpha: true,
    });
    renderer.current.setClearColor(0x000000, 0.0);

    renderer.current.setSize(canvasState.width, canvasState.height, false);

    raycaster.current = new THREE.Raycaster();

    const quad = new THREE.PlaneBufferGeometry((1.5 * props.texture.width) / props.texture.height, 1.5);
    texture.current = new THREE.DataTexture(
      props.texture.data,
      props.texture.width,
      props.texture.height,
      THREE.RGBAFormat
    );

    texture.current.flipY = true;
    texture.current.minFilter = THREE.NearestFilter;
    texture.current.magFilter = THREE.NearestFilter;

    material.current = new THREE.MeshBasicMaterial({ map: texture.current });
    textureQuad.current = new THREE.Mesh(quad, material.current);
    scene.current.add(textureQuad.current);

    animate();
  };

  const getPixelColorFromTexture = (x: number, y: number): Color => {
    const pickedPixelArray = new Uint8ClampedArray(4);
    const isRGBA = props.texture.internalFormat === Constants.RGBA;

    x -= 1;
    y -= 1;
    // calc array offset
    let dataOffset = props.texture.width * y + x;
    if (isRGBA) {
      dataOffset *= 4;
    } else {
      dataOffset *= 3;
    }

    pickedPixelArray[0] = props.texture.data[dataOffset];
    pickedPixelArray[1] = props.texture.data[++dataOffset];
    pickedPixelArray[2] = props.texture.data[++dataOffset];
    if (isRGBA) {
      pickedPixelArray[3] = props.texture.data[++dataOffset];
    } else {
      pickedPixelArray[3] = 255;
    }
    const color = new Color();
    color.setFromArray(pickedPixelArray);
    return color;
  };

  const calcHDRPixel = (pixel: Uint8ClampedArray | Float32Array): Uint8ClampedArray => {
    let convertToLinear = false;
    const output = new Uint8ClampedArray(4);
    if (pixel.constructor.name.startsWith('Uint8')) {
      convertToLinear = true;
    }

    let r = pixel[0];
    let g = pixel[1];
    let b = pixel[2];
    let a = pixel[3];

    if (convertToLinear) {
      r /= 255;
      g /= 255;
      b /= 255;
      a /= 255;
    }

    if (hdrState.format === HDRFormat.RGBE) {
      const exp = Math.pow(2, a * 255 - 128.0);
      r = r * exp;
      g = g * exp;
      b = b * exp;
    } else if (hdrState.format === HDRFormat.EXR) {
      // do nothing here ;-)
    }

    if (hdrState.toneMapping === HDRToneMapping.Linear) {
      r = hdrState.exposure * r;
      g = hdrState.exposure * g;
      b = hdrState.exposure * b;
    } else if (hdrState.toneMapping === HDRToneMapping.Reinhard) {
      r = hdrState.exposure * r;
      g = hdrState.exposure * g;
      b = hdrState.exposure * b;

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
    output[0] = r * 255;
    output[1] = g * 255;
    output[2] = b * 255;
    output[3] = 255; // set alpha to 255

    return output;
  };

  const getPixelColorFromHDRTexture = (x: number, y: number): Color => {
    x -= 1;

    let pickedPixelArray;
    if (hdrState.format === HDRFormat.EXR) {
      pickedPixelArray = new Float32Array(4);
      y = props.texture.height - y; // EXR is flipped on y
      //x = props.texture.height - x; // EXR is flipped on y
    } else {
      pickedPixelArray = new Uint8ClampedArray(4);
      y -= 1;
    }

    // calc array offset
    let dataOffset = props.texture.width * y + x;
    dataOffset *= 4;

    pickedPixelArray[0] = props.texture.data[dataOffset];
    pickedPixelArray[1] = props.texture.data[++dataOffset];
    pickedPixelArray[2] = props.texture.data[++dataOffset];
    pickedPixelArray[3] = props.texture.data[++dataOffset];

    const color = new Color();
    color.setFromArray(calcHDRPixel(pickedPixelArray));
    return color;
  };

  const handleHDRChanges: React.EffectCallback = (): void => {
    //console.log('useEffect [hdrState]');

    if (hdrState.isHDRTexture) {
      renderer.current.toneMappingExposure = hdrState.exposure;
      renderer.current.outputEncoding = THREE.sRGBEncoding;

      switch (hdrState.format) {
        case HDRFormat.RGBE:
          texture.current.encoding = THREE.RGBEEncoding;
          break;
        case HDRFormat.EXR:
          texture.current.flipY = false;
          texture.current.type = THREE.FloatType;
          texture.current.encoding = THREE.LinearEncoding;
          texture.current.generateMipmaps = false;
          break;
      }

      // set the tone mapping
      switch (hdrState.toneMapping) {
        case HDRToneMapping.Linear:
          renderer.current.toneMapping = THREE.LinearToneMapping;
          break;
        case HDRToneMapping.Reinhard:
          renderer.current.toneMapping = THREE.ReinhardToneMapping;
          break;

        default:
          renderer.current.toneMapping = THREE.NoToneMapping;
          break;
      }
    } else {
      // set back to default
      texture.current.flipY = true;
      texture.current.type = THREE.UnsignedByteType;
      texture.current.encoding = THREE.LinearEncoding;
      renderer.current.toneMapping = THREE.LinearToneMapping;
      renderer.current.toneMappingExposure = 1.0;
      renderer.current.outputEncoding = THREE.LinearEncoding;
    }
    texture.current.needsUpdate = true;
    material.current.needsUpdate = true;
  };

  const handleIsHDRChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const isHDRTexture = event.target.checked;
    const newState = { ...hdrState };
    newState.isHDRTexture = isHDRTexture;
    setHdrState(newState);
  };

  const handleHDRFormatChange = (event: React.ChangeEvent<{ value: number }>): void => {
    const format = event.target.value as HDRFormat;
    const newState = { ...hdrState };
    newState.format = format;
    setHdrState(newState);
  };

  const handleHDRToneMappingChange = (event: React.ChangeEvent<{ value: number }>): void => {
    const toneMapping = event.target.value as HDRToneMapping;
    const newState = { ...hdrState };
    newState.toneMapping = toneMapping;
    setHdrState(newState);
  };

  const handleExposureChange = (_event: React.ChangeEvent<{}>, newValue: number | number[]): void => {
    const newState = { ...hdrState };
    newState.exposure = newValue as number;
    setHdrState(newState);
  };

  const handleCanvasZoom = (event: React.WheelEvent<HTMLCanvasElement>): void => {
    if (camera.current) {
      const mouseEvent = event.nativeEvent;
      const x = (mouseEvent.offsetX / canvasState.width) * 2 - 1;
      const y = -(mouseEvent.offsetY / canvasState.height) * 2 + 1;

      let zoomFactor = 1.5;

      if (event.deltaY > 0) {
        zoomFactor = 1 / zoomFactor;
      }
      camera.current.zoom *= zoomFactor;
      camera.current.updateProjectionMatrix();

      if (event.deltaY < 0) {
        const moveFactor = Math.max(camera.current.zoom * zoomFactor, 1);
        const pos = camera.current.position;
        pos.x += x / moveFactor;
        pos.y += y / moveFactor;

        camera.current.position.set(pos.x, pos.y, pos.z);
      }
    }
  };

  const handleCanvasDoubleClick = (): void => {
    if (camera.current) {
      // primary button
      camera.current.zoom = 1;
      camera.current.position.set(0, 0, 0);
      camera.current.updateProjectionMatrix();
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    if (event.buttons === 4) {
      // middle/wheel button
      if (camera.current) {
        const panningFactor = 0.0023 / camera.current.zoom;
        const pos = camera.current.position;
        pos.x -= event.movementX * panningFactor;
        pos.y += event.movementY * panningFactor;
        camera.current.position.set(pos.x, pos.y, pos.z);
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const mouseEvent = event.nativeEvent;
    mouseNDC.current.x = (mouseEvent.offsetX / canvasState.width) * 2 - 1;
    mouseNDC.current.y = -(mouseEvent.offsetY / canvasState.height) * 2 + 1;

    if (raycaster.current) {
      // update the picking ray with the camera and mouse position
      raycaster.current.setFromCamera(mouseNDC.current, camera.current);

      const intersects = raycaster.current.intersectObjects(scene.current.children);

      if (intersects.length) {
        const intersect = intersects[0];

        // calc pixel position
        const textureX = Math.floor(intersect.uv.x * props.texture.width) + 1;
        const textureY = Math.floor(props.texture.height - intersect.uv.y * props.texture.height) + 1;

        let cursorColor: Color;
        if (hdrState.isHDRTexture) {
          cursorColor = getPixelColorFromHDRTexture(textureX, textureY);
        } else {
          cursorColor = getPixelColorFromTexture(textureX, textureY);
        }

        setPixelInfoState({
          textureX,
          textureY,
          cursorColor,
        });
      }
    }
  };

  const handleRotate = (direction: Direction): void => {
    if (camera.current) {
      let rotationAngel = 90;
      if (direction === Direction.Right) {
        rotationAngel = -90;
      }
      rotationAngel = THREE.MathUtils.degToRad(rotationAngel);
      //camera.current.applyMatrix4(new THREE.Matrix4().makeRotationZ(rotationAngel));
      textureQuad.current.rotateZ(rotationAngel);
    }
  };

  // connecting hooks
  React.useEffect(initThreeJS, []); // empty array means no deps for useEffect -> called only one time
  React.useEffect(handleHDRChanges, [hdrState]);

  return (
    <div className="TextureViewWebGL">
      <div className="TextureViewWebGLControls">
        <FormControlLabel
          control={<Checkbox checked={hdrState.isHDRTexture} onChange={handleIsHDRChange} color="primary"></Checkbox>}
          label="HDR?"
        />
        {hdrState.isHDRTexture && (
          <React.Fragment>
            <InputLabel id="hdrformat-select-label">HDR format</InputLabel>
            <Select labelId="hdrformat-select-label" value={hdrState.format} onChange={handleHDRFormatChange}>
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
              value={hdrState.toneMapping}
              onChange={handleHDRToneMappingChange}>
              <MenuItem value={HDRToneMapping.None}>None</MenuItem>
              <MenuItem value={HDRToneMapping.Linear}>Linear</MenuItem>
              <MenuItem value={HDRToneMapping.Reinhard}>Reinhard</MenuItem>
            </Select>
            {hdrState.toneMapping !== HDRToneMapping.None && (
              <div className="TextureViewWebGLControlsExposureSlider">
                <Typography id="exposure-slider-label">Exposure</Typography>

                <Slider
                  aria-labelledby="exposure-slider-label"
                  value={hdrState.exposure}
                  min={0}
                  max={10}
                  step={0.1}
                  onChange={handleExposureChange}
                  valueLabelDisplay={'auto'}></Slider>
              </div>
            )}
          </React.Fragment>
        )}
        <Tooltip title={'Rotate left'}>
          <IconButton onClick={() => handleRotate(Direction.Left)}>
            <FontAwesomeIcon icon={faArrowAltCircleLeft}></FontAwesomeIcon>
          </IconButton>
        </Tooltip>
        <Tooltip title={'Rotate right'}>
          <IconButton onClick={() => handleRotate(Direction.Right)}>
            <FontAwesomeIcon icon={faArrowAltCircleRight}></FontAwesomeIcon>
          </IconButton>
        </Tooltip>
      </div>
      <div className="TextureViewWebGLInfoContainer">
        <span className="TextureViewWebGLPixelPos">{`Pixel position: (${pixelInfoState.textureX},${pixelInfoState.textureY})`}</span>
        <ColorView color={pixelInfoState.cursorColor}></ColorView>
      </div>
      <div className="TextureViewWebGLCanvasContainer">
        <canvas
          ref={canvasEl}
          onWheel={handleCanvasZoom}
          onMouseMove={handleCanvasMouseMove}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
          className="TextureViewWebGLCanvas"
          width={canvasState.width}
          height={canvasState.height}></canvas>
      </div>
    </div>
  );
};
