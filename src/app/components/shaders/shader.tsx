import './shader.scss';
import React from 'react';
import { WGLShader } from '../../services/webglobjects/wglShader';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
//import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { glslTokenProvider } from '../../services/glslTokenProvider';
import { getCurrentTheme } from '../../themes';

export interface IShaderProp {
  shader: WGLShader;
}

interface IShaderState {
  theme: 'webglDebugger-dark' | 'webglDebugger-light';
}

export class Shader extends React.Component<IShaderProp, IShaderState> {
  public readonly state: IShaderState = {
    theme: getCurrentTheme() === 'dark' ? 'webglDebugger-dark' : 'webglDebugger-light',
  };

  private editorWillMount(m: typeof monaco): void {
    m.editor.defineTheme('webglDebugger-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {},
    });

    m.editor.defineTheme('webglDebugger-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {},
    });

    m.languages.register({ id: 'glsl' });
    m.languages.setMonarchTokensProvider('glsl', glslTokenProvider as any);
  }

  public render(): React.ReactNode {
    if (this.props.shader) {
      const options: monaco.editor.IEditorConstructionOptions = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        minimap: {
          enabled: false,
        },
      };

      /*
      const testSrc = `
        function foo(bar) {
          console.log('Hello ' + bar);
        }
      `;
      */

      return (
        <div className="Shader">
          <MonacoEditor
            editorWillMount={this.editorWillMount}
            language="glsl"
            value={this.props.shader.source}
            options={options}
            theme={this.state.theme}
          />
        </div>
      );
    } else {
      return <div className="Shader">no shader selected</div>;
    }
  }
}
