import './launchPanel.scss';
import React from 'react';
import { UrlBar } from '../urlbar/urlbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@material-ui/core';
import { launchWebGLWindow } from '../../services/launchWebGLWindow';
import { PanelTitle } from './panelTitle';

interface ILaunchPanelState {
  launchUrl: string;
  launchDisabled: boolean;
}

export class LaunchPanel extends React.Component<{}, ILaunchPanelState> {
  public readonly state: ILaunchPanelState = {
    launchUrl: 'https://mdn.github.io/webgl-examples/tutorial/sample7/',
    launchDisabled: false,
  };

  private handleUrlChange = (launchUrl: string): void => {
    this.setState({ launchUrl });
  };

  private handleLaunch = (): void => {
    console.log(`try to open url: ${this.state.launchUrl}`);

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
            startIcon={<FontAwesomeIcon icon="rocket"></FontAwesomeIcon>}
            onClick={this.handleLaunch}>
            Launch
          </Button>
        </div>
      </div>
    );
  }
}
