import './shader.scss';
import React from 'react';
import { WGLProgram } from '../../services/webglobjects/wglProgram';
import { WGLShader } from '../../services/webglobjects/wglShader';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import { glslTokenProvider } from '../../services/glslTokenProvider';
import { getCurrentTheme } from '../../themes';
import Button from '@material-ui/core/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons/faCopy';
import { faUndo } from '@fortawesome/free-solid-svg-icons/faUndo';
import { faSpellCheck } from '@fortawesome/free-solid-svg-icons/faSpellCheck';
import { faFileUpload } from '@fortawesome/free-solid-svg-icons/faFileUpload';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import { ipcRenderer } from 'electron';
import { IPCChannel, IShaderValidationMessage, IShaderValidationCode, IShaderUpdate } from '../../../shared/IPC';

export interface IShaderProp {
  program: WGLProgram;
  shader: WGLShader;
}

interface IShaderState {
  theme: 'webglDebugger-dark' | 'webglDebugger-light';
  newShaderCode: string;
  editorOptions: monaco.editor.IEditorConstructionOptions;
  validationMessages: IShaderValidationMessage[];
}

export class Shader extends React.Component<IShaderProp, IShaderState> {
  private _editorRef = React.createRef<MonacoEditor>();

  public readonly state: IShaderState = {
    theme: getCurrentTheme() === 'dark' ? 'webglDebugger-dark' : 'webglDebugger-light',
    newShaderCode: '',
    editorOptions: {
      selectOnLineNumbers: true,
      roundedSelection: true,
      readOnly: false,
      cursorStyle: 'line',
      automaticLayout: true,
      // folding: true,
      // showFoldingControls: 'always',
      // selectionHighlight: false,
      minimap: {
        enabled: false,
      },
    },
    validationMessages: [],
  };

  private editorWillMount = (monaco: typeof monacoEditor): void => {
    monaco.editor.defineTheme('webglDebugger-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {},
    });

    monaco.editor.defineTheme('webglDebugger-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {},
    });

    monaco.languages.register({ id: 'glsl' });
    monaco.languages.setMonarchTokensProvider('glsl', glslTokenProvider);
  };

  public componentDidUpdate(prevProps: IShaderProp /*, prevState: IShaderState*/): void {
    if (this.props.shader !== prevProps.shader) {
      const newShaderCode = this.props.shader.source;
      this.setState({
        newShaderCode,
        validationMessages: [],
      });
    }
  }

  private _handleSourceChange = (newShaderCode: string): void => {
    this.setState({ newShaderCode });
  };

  private _handleResetSource = (): void => {
    const newShaderCode = this.props.shader.source;
    this.setState({
      newShaderCode,
      validationMessages: [],
    });
  };

  private async validate(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const codeObj: IShaderValidationCode = {
        code: this.state.newShaderCode,
        stage: this.props.shader.glslangValidatorStage,
      };

      ipcRenderer
        .invoke(IPCChannel.ValidateShaderRequest, codeObj)
        .then((validationMessages: IShaderValidationMessage[]) => {
          //console.log(validationMessages);
          this.setState({ validationMessages });
          //this._editorRef.current.editor.layout();
          if (validationMessages.length) {
            reject();
          }
          resolve();
        });
    });
  }

  private _handleValidateSource = (): void => {
    this.validate();
  };

  private _handleApplySource = (): void => {
    this.validate().then(() => {
      // get the other shader to probably recreate it
      let otherShader: WGLShader;
      for (const shader of this.props.program.getShaders()) {
        if (shader.id !== this.props.shader.id) {
          otherShader = shader;
        }
      }

      const shaderUpdate: IShaderUpdate = {
        source: this.state.newShaderCode,
        shaderId: this.props.shader.id,
        programId: this.props.shader.programId,
        type: this.props.shader.type,
        otherShader: {
          source: otherShader.source,
          type: otherShader.type,
        },
      };

      ipcRenderer.send(IPCChannel.UpdateShader, shaderUpdate);
    });
  };

  private _handleCopySource = (): void => {
    navigator.clipboard.writeText(this.state.newShaderCode);
  };

  public render(): React.ReactNode {
    if (this.props.shader) {
      /*
      const testSrc = `
        function foo(bar) {
          console.log('Hello ' + bar);
        }
      `;
      */

      return (
        <div className="Shader">
          <div className="EditorContainer">
            <MonacoEditor
              ref={this._editorRef}
              editorWillMount={this.editorWillMount}
              language="glsl"
              value={this.state.newShaderCode}
              options={this.state.editorOptions}
              theme={this.state.theme}
              onChange={this._handleSourceChange}
            />
          </div>
          <div className="ProblemsPanel">
            {this.state.validationMessages.map((message, idx) => {
              return (
                <div key={idx} className={`MessageEntry ${message.severity}`}>
                  {message.severity === 'ERROR' ? (
                    <FontAwesomeIcon icon={faTimesCircle} color={'#f48771'}></FontAwesomeIcon>
                  ) : (
                    <FontAwesomeIcon icon={faExclamationCircle} color={'#cca700'}></FontAwesomeIcon>
                  )}
                  <span className="Message">
                    {`${message.severity}: ${message.message} [${message.lineNumber}, 1]`}
                  </span>
                </div>
              );
            })}
          </div>
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
