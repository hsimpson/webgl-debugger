import React from 'react';
import './textureList.scss';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { WGLTexture } from '../../services/webglobjects/WGLTexture';
import { WebGLObjectsManagerSingleton } from '../../services/webglobjects/webglObjectsManager';
import { WebGLObjectType } from '../../../shared/IPC';

export interface ITextureListProps {
  selectedTexture?: WGLTexture;
  onSelectTexture: (selectedTexture: WGLTexture) => void;
}

interface ITextureListState {
  selectedTexture: WGLTexture;
}

export class TextureList extends React.Component<ITextureListProps, ITextureListState> {
  public readonly state: ITextureListState = {
    selectedTexture: this.props.selectedTexture,
  };

  private _handleTextureClick = (selectedTexture: WGLTexture): void => {
    this.setState({ selectedTexture });
    this.props.onSelectTexture(selectedTexture);
  };

  public render(): React.ReactNode {
    const textures: WGLTexture[] = WebGLObjectsManagerSingleton.getByType(
      WebGLObjectType.WebGLTexture,
      true
    ) as WGLTexture[];

    return (
      <div className="TextureList">
        <List component="nav">
          {textures.map((texture: WGLTexture) => {
            return (
              <ListItem
                key={texture.id}
                button
                selected={this.state.selectedTexture?.id === texture.id}
                onClick={() => this._handleTextureClick(texture)}>
                <ListItemText primary={`Texture #${texture.id}`}></ListItemText>
              </ListItem>
            );
          })}
        </List>
      </div>
    );
  }
}
