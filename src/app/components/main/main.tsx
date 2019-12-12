import React from 'react';

import { Themes } from '../../themes';

import { WelcomePanel, LaunchPanel, ShadersPanel, SettingsPanel, HelpPanel } from '../panels';

import { StatusBar } from '../statusBar/statusBar';
import { VerticalMenu } from '../verticalMenu/verticalMenu';

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import './main.scss';

interface IMainProps {
  theme: 'dark' | 'light';
}

interface IMainState {
  activePanel: string;
  panels: {
    [index: string]: React.ComponentClass;
  };
}

export class Main extends React.Component<IMainProps, IMainState> {
  public readonly state: IMainState = {
    activePanel: 'welcome',

    // FIXME: this is a loose coupling
    panels: {
      welcome: WelcomePanel,
      launch: LaunchPanel,
      shaders: ShadersPanel,
      settings: SettingsPanel,
      help: HelpPanel,
    },
  };

  private handleMenuChanged = (name: string): void => {
    this.setState({ activePanel: name });
  };

  public render(): React.ReactNode {
    const SpecificPanel = this.state.panels[this.state.activePanel];
    return (
      <ThemeProvider theme={createMuiTheme(Themes[this.props.theme])}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <div className="Main">
          <div className="MainArea">
            <VerticalMenu onMenuChanged={this.handleMenuChanged}></VerticalMenu>
            <SpecificPanel></SpecificPanel>
          </div>
          <StatusBar></StatusBar>
        </div>
      </ThemeProvider>
    );
  }
}
