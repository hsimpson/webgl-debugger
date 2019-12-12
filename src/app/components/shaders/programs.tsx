import React from 'react';
import { WebGLObjectsManager } from '../../services/webglobjects/webglObjectsManager';
import { WebGLObjectType } from '../../../shared/IPC';

export class Programs extends React.Component {
  public render(): React.ReactNode {
    const programs = WebGLObjectsManager.getInstance().getByType(WebGLObjectType.WebGLProgram, true);
    return (
      <ul>
        {programs.map((program) => {
          return <li key={program.id}>{`Program #${program.id}`}</li>;
        })}
      </ul>
    );
  }
}
