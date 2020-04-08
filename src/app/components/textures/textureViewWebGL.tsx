import './textureViewWebGL.scss';
import React, { ReactElement, useEffect, Fragment } from 'react';
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

export const TextureViewWebGL = (props: ITextureViewWebGLProp): ReactElement => {
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

  const canvasEl = React.useRef<HTMLCanvasElement>(undefined);
  const scene = React.useRef<THREE.Scene>(undefined);
  const camera = React.useRef<THREE.OrthographicCamera>(undefined);
  const renderer = React.useRef<THREE.WebGLRenderer>(undefined);
  const texture = React.useRef<THREE.Texture>(undefined);
  const material = React.useRef<THREE.MeshBasicMaterial>(undefined);

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

  useEffect(() => {
    //console.log('useEffect []');

    scene.current = new THREE.Scene();
    const aspect = canvasState.width / canvasState.height;
    camera.current = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0, 1000);

    const gl = canvasEl.current.getContext('webgl2');

    renderer.current = new THREE.WebGLRenderer({
      canvas: canvasEl.current,
      context: gl as WebGLRenderingContext,
    });
    renderer.current.setClearColor(0x000000, 1.0);

    renderer.current.setSize(canvasState.width, canvasState.height, false);

    const quad = new THREE.PlaneBufferGeometry((1.5 * props.texture.width) / props.texture.height, 1.5);
    texture.current = new THREE.DataTexture(
      props.texture.data,
      props.texture.width,
      props.texture.height,
      THREE.RGBAFormat
    );

    texture.current.flipY = true;

    /*/
    // hdr testing
    // EXR
    texture.current.flipY = false;
    texture.current.type = THREE.FloatType;
    texture.current.encoding = THREE.LinearEncoding;

    // all HDR
    renderer.current.toneMappingExposure = hdrState.exposure;
    renderer.current.outputEncoding = THREE.sRGBEncoding;
    /**/

    material.current = new THREE.MeshBasicMaterial({ map: texture.current });
    const mesh = new THREE.Mesh(quad, material.current);
    scene.current.add(mesh);

    animate();
  }, []); // empty array means no deps for useEffect -> called only one time

  useEffect(() => {
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
          texture.current.minFilter = THREE.LinearFilter;
          texture.current.magFilter = THREE.LinearFilter;
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
  }, [hdrState]);

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

  return (
    <div className="TextureViewWebGL">
      <div className="TextureViewWebGLControls">
        <FormControlLabel
          control={<Checkbox checked={hdrState.isHDRTexture} onChange={handleIsHDRChange} color="primary"></Checkbox>}
          label="HDR?"
        />
        {hdrState.isHDRTexture && (
          <Fragment>
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
          </Fragment>
        )}
      </div>
      <div className="TextureViewWebGLCanvasContainer">
        <canvas
          ref={canvasEl}
          className="TextureViewWebGLCanvas"
          width={canvasState.width}
          height={canvasState.height}></canvas>
      </div>
    </div>
  );
};
