import { remote } from 'electron';

declare global {
  // eslint-disable-next-line @typescript-eslint/interface-name-prefix
  interface Window {
    __setTheme: () => void;
  }
}

function setOSTheme(): void {
  const theme = remote.nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  window.localStorage.os_theme = theme; // eslint-disable-line @typescript-eslint/camelcase

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
