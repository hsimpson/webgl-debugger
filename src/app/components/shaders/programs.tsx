import React from 'react';
import { WebGLObjectsManager } from '../../services/webglobjects/webglObjectsManager';
import { WGLProgram } from '../../services/webglobjects/wglProgram';
import { WGLShader } from '../../services/webglobjects/WGLShader';
import { WebGLObjectType } from '../../../shared/IPC';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import './programs.scss';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Shader } from './shader';

interface IProgramsState {
  currentShader: WGLShader;
}

export class Programs extends React.Component<{}, IProgramsState> {
  public readonly state: IProgramsState = {
    currentShader: undefined,
  };

  private handleShaderClick = (shader: WGLShader): void => {
    this.setState({ currentShader: shader });
  };

  public render(): React.ReactNode {
    const programs: WGLProgram[] = WebGLObjectsManager.getInstance().getByType(
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
                      onClick={() => this.handleShaderClick(shader)}></TreeItem>
                  );
                })}
              </TreeItem>
            );
          })}
        </TreeView>
        <Shader shader={this.state.currentShader}></Shader>
      </div>
    );
  }
}
