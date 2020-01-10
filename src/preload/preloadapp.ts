import { remote } from 'electron';
import { registerDevToolsShortCutWeb } from '../shared/toggleDevTools';

declare global {
  interface Window {
    __setTheme: () => void;
  }
}

registerDevToolsShortCutWeb();

function setOSTheme(): void {
  const theme = remote.nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  window.localStorage.osTheme = theme; // eslint-disable-line @typescript-eslint/camelcase

  //
  // Defined in index.html, so undefined when launching the app.
  // Will be defined for `systemPreferences.subscribeNotification` callback.
  //

  if ('__setTheme' in window) {
    window.__setTheme();
  }
}

remote.nativeTheme.on('updated', setOSTheme);
setOSTheme();
