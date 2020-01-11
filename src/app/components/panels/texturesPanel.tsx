import './texturesPanel.scss';
import React from 'react';
import { WGLTexture } from '../../services/webglobjects/WGLTexture';
import { PanelTitle } from './panelTitle';
import { TextureList } from '../textures/textureList';
import { TextureView } from '../textures/textureView';

interface ITexturesPanelState {
  selectedTexture: WGLTexture;
}

export class TexturesPanel extends React.Component<{}, ITexturesPanelState> {
  public readonly state: ITexturesPanelState = {
    selectedTexture: undefined,
  };

  private handleSelectTexture = (selectedTexture: WGLTexture): void => {
    this.setState({ selectedTexture });
  };

  public render(): React.ReactNode {
    if (this.state.selectedTexture) {
      return (
        <div className="TexturesPanel">
          <PanelTitle title="Textures"></PanelTitle>
          <div className="panelContainer">
            <TextureList onSelectTexture={this.handleSelectTexture}></TextureList>
            <TextureView texture={this.state.selectedTexture}></TextureView>
          </div>
        </div>
      );
    } else {
      return (
        <div className="TexturesPanel">
          <PanelTitle title="Textures"></PanelTitle>
          <div className="panelContainer">
            <TextureList onSelectTexture={this.handleSelectTexture}></TextureList>
            <div>no shader selected</div>
          </div>
        </div>
      );
    }
  }
}
