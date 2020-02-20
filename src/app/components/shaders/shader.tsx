import './shader.scss';
import React from 'react';
import { WGLShader } from '../../services/webglobjects/wglShader';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
//import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { glslTokenProvider } from '../../services/glslTokenProvider';
import { getCurrentTheme } from '../../themes';
import Button from '@material-ui/core/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons/faCopy';
import { faUndo } from '@fortawesome/free-solid-svg-icons/faUndo';
import { faSpellCheck } from '@fortawesome/free-solid-svg-icons/faSpellCheck';
import { faFileUpload } from '@fortawesome/free-solid-svg-icons/faFileUpload';

export interface IShaderProp {
  shader: WGLShader;
}

interface IShaderState {
  theme: 'webglDebugger-dark' | 'webglDebugger-light';
  newShaderCode: string;
}

export class Shader extends React.Component<IShaderProp, IShaderState> {
  public readonly state: IShaderState = {
    theme: getCurrentTheme() === 'dark' ? 'webglDebugger-dark' : 'webglDebugger-light',
    newShaderCode: '',
  };

  private editorWillMount = (m: typeof monaco): void => {
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
    m.languages.setMonarchTokensProvider('glsl', glslTokenProvider);
  };

  public componentDidUpdate(prevProps: IShaderProp /*, prevState: IShaderState*/): void {
    if (this.props.shader !== prevProps.shader) {
      const newShaderCode = this.props.shader.source;
      this.setState({ newShaderCode });
    }
  }

  private _handleSourceChange = (newShaderCode: string): void => {
    this.setState({ newShaderCode });
  };

  private _handleResetSource = (): void => {
    const newShaderCode = this.props.shader.source;
    this.setState({ newShaderCode });
  };

  private _handleValidateSource = (): void => {
    //
  };

  private _handleApplySource = (): void => {
    //
  };

  private _handleCopySource = (): void => {
    navigator.clipboard.writeText(this.state.newShaderCode);
  };

  public render(): React.ReactNode {
    if (this.props.shader) {
      const options: monaco.editor.IEditorConstructionOptions = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        // folding: true,
        // showFoldingControls: 'always',
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
            value={this.state.newShaderCode}
            options={options}
            theme={this.state.theme}
            onChange={this._handleSourceChange}
          />
          <div className="ShaderButtons">
            <Button
              variant="contained"
              color="primary"
              onClick={this._handleValidateSource}
              startIcon={<FontAwesomeIcon icon={faSpellCheck}></FontAwesomeIcon>}>
              Validate
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this._handleResetSource}
              startIcon={<FontAwesomeIcon icon={faUndo}></FontAwesomeIcon>}>
              Reset
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this._handleApplySource}
              startIcon={<FontAwesomeIcon icon={faFileUpload}></FontAwesomeIcon>}>
              Apply
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this._handleCopySource}
              startIcon={<FontAwesomeIcon icon={faCopy}></FontAwesomeIcon>}>
              Copy source
            </Button>
          </div>
        </div>
      );
    } else {
      return <div className="Shader">no shader selected</div>;
    }
  }
}
