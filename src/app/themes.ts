import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import { lightBlue, blue } from '@material-ui/core/colors';

interface IMuiThemes {
  dark: ThemeOptions;
  light: ThemeOptions;
}

const Themes: IMuiThemes = {
  dark: {
    palette: {
      primary: lightBlue,
      type: 'dark',
    },
  },
  light: {
    palette: {
      primary: blue,
      type: 'light',
    },
  },
};

export { Themes };
