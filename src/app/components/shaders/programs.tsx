import React from 'react';
import { WebGLObjectsManagerSingleton } from '../../services/webglobjects/webglObjectsManager';
import { WGLProgram } from '../../services/webglobjects/wglProgram';
import { WGLShader } from '../../services/webglobjects/wglShader';
import { WebGLObjectType } from '../../../shared/IPC';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Shader } from './shader';
import './programs.scss';

interface IProgramsState {
  selectedShader: WGLShader;
}

export class Programs extends React.Component<{}, IProgramsState> {
  public readonly state: IProgramsState = {
    selectedShader: undefined,
  };

  private _handleShaderClick = (selectedShader: WGLShader): void => {
    this.setState({ selectedShader });
  };

  public render(): React.ReactNode {
    const programs: WGLProgram[] = WebGLObjectsManagerSingleton.getByType(
      WebGLObjectType.WebGLProgram,
      true
    ) as WGLProgram[];
    return (
      <div className="Programs">
        <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
          {programs.map((program: WGLProgram) => {
            const shaders: WGLShader[] = program.getShaders();
            return (
              <TreeItem key={program.id} nodeId={`${program.id}`} label={`Program #${program.id}`}>
                {shaders.map((shader: WGLShader) => {
                  return (
                    <TreeItem
                      key={shader.id}
                      nodeId={`${shader.id}`}
                      label={`${shader.typeString} shader #${shader.id}`}
                      onClick={() => this._handleShaderClick(shader)}></TreeItem>
                  );
                })}
              </TreeItem>
            );
          })}
        </TreeView>
        <Shader shader={this.state.selectedShader}></Shader>
      </div>
    );
  }
}
