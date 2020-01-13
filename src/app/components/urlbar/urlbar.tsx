import React from 'react';
import { TextField } from '@material-ui/core';

import * as styles from './urlbar.scss';

interface IUrlBarProps {
  url: string;
  onChange: (url: string) => void;
}

export class UrlBar extends React.Component<IUrlBarProps> {

  private handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(event.target.value);
  };

  public render(): React.ReactNode {
    return (
      <div className={styles.UrlBar}>
        <TextField
          fullWidth
          margin="normal"
          id="outlined-basic"
          label="Launch URL"
          variant="outlined"
          value={this.props.url}
          onChange={this.handleUrlChange}
        />
      </div>
    );
  }
}
