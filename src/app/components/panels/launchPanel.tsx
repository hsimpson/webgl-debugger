import './launchPanel.scss';
import React from 'react';
import { UrlBar } from '../urlbar/urlbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '@material-ui/core/Button';
import { launchWebGLWindow } from '../../services/launchWebGLWindow';
import { PanelTitle } from './panelTitle';
import { faRocket } from '@fortawesome/free-solid-svg-icons/faRocket';

interface ILaunchPanelState {
  launchUrl: string;
  launchDisabled: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class LaunchPanel extends React.Component<{}, ILaunchPanelState> {
  public readonly state: ILaunchPanelState = {
    launchUrl: 'https://mdn.github.io/webgl-examples/tutorial/sample7/',
    //launchUrl: 'http://127.0.0.1:8080/tutorial/sample6/',
    //launchUrl: 'https://jmswrnr.com/',
    //launchUrl: 'https://threejs.org/examples/webgl_loader_texture_hdr.html',
    //launchUrl: 'https://threejs.org/examples/webgl_loader_texture_rgbm.html',
    //launchUrl: 'https://threejs.org/examples/webgl_loader_texture_exr.html',
    launchDisabled: false,
  };

  private handleUrlChange = (launchUrl: string): void => {
    this.setState({ launchUrl });
  };

  private handleLaunch = (): void => {
    //console.log(`try to open url: ${this.state.launchUrl}`);

    (async () => {
      try {
        await launchWebGLWindow(this.state.launchUrl, () => {
          this.setState({ launchDisabled: false });
        });
        this.setState({ launchDisabled: true });
      } catch (error) {
        this.setState({ launchDisabled: false });
      }
    })();
  };

  public render(): React.ReactNode {
    return (
      <div className="LaunchPanel">
        <PanelTitle title="Launch WebGL site"></PanelTitle>
        <div className="panelContainer">
          <UrlBar url={this.state.launchUrl} onChange={this.handleUrlChange} />
          <Button
            variant="contained"
            color="primary"
            disabled={this.state.launchDisabled}
            startIcon={<FontAwesomeIcon icon={faRocket}></FontAwesomeIcon>}
            onClick={this.handleLaunch}>
            Launch
          </Button>
        </div>
      </div>
    );
  }
}
