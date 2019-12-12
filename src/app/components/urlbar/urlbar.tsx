import './urlbar.scss';
import React from 'react';
import { TextField } from '@material-ui/core';

/*
interface IUrlBarState {
  url: string;
}
*/

interface IUrlBarProps {
  url: string;
  onChange: (url: string) => void;
}

export class UrlBar extends React.Component<IUrlBarProps> {
  /*
  public readonly state: IUrlBarState = {
    url: '',
  };
  */

  private handleUrlChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    this.props.onChange(event.target.value as string);
  };

  public render(): React.ReactNode {
    return (
      <div className="UrlBar">
        <TextField
          fullWidth
          margin="normal"
          id="outlined-basic"
          //className={classes.textField}
          label="Launch URL"
          variant="outlined"
          value={this.props.url}
          onChange={this.handleUrlChange}
        />
      </div>
    );
  }
}
