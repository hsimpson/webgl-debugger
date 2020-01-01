import './settings.scss';
import React from 'react';
import { PanelTitle } from './panelTitle';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

type ThemeTypes = 'dark' | 'light' | 'system';
interface ISettingsPanelState {
  theme: ThemeTypes;
}

export class SettingsPanel extends React.Component<{}, ISettingsPanelState> {
  public readonly state: ISettingsPanelState = {
    theme: window.localStorage.userTheme ?? 'system',
  };

  private handleThemeChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    const newTheme = event.target.value as ThemeTypes;
    this.setState({ theme: newTheme });
    if (newTheme === 'system') {
      window.localStorage.removeItem('userTheme');
    } else {
      window.localStorage.userTheme = newTheme;
    }
    window.__setTheme();
  };

  public render(): React.ReactNode {
    return (
      <div className="SettingsPanel">
        <PanelTitle title="Settings"></PanelTitle>
        <div className="panelContainer">
          <FormControl>
            <InputLabel id="theme-select-label">Style</InputLabel>
            <Select labelId="theme-select-label" value={this.state.theme} onChange={this.handleThemeChange}>
              <MenuItem value={'dark'}>Dark</MenuItem>
              <MenuItem value={'light'}>Light</MenuItem>
              <MenuItem value={'system'}>System</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
    );
  }
}
