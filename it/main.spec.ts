import * as spectron from "spectron";

import * as fs from "fs";
import * as path from "path";

const screenshotsPath = path.join(__dirname, "/screenshots/");

if (!fs.existsSync(screenshotsPath)) {
  fs.mkdirSync(path.join(__dirname, "/screenshots/"));
}

describe("Electron App", () => {

  const applicationPath: string = fs.realpathSync(path.join(__dirname, ".."));

  let testSubject: spectron.Application;
  let counter: number = 0;

  beforeAll(() => {
    testSubject = new spectron.Application({
      args: [applicationPath],
      path: "node_modules/.bin/electron",
      startTimeout: 10000,
    });

    return testSubject.start();
  });

  afterAll(() => {
    if (testSubject && testSubject.isRunning()) {
      return testSubject.stop();
    }
  });

  beforeEach(() => {
    return testSubject.client.waitUntilTextExists("div.Main > div.MainArea > div.WelcomePanel > div.PanelTitle > span", "Welcome");
  });

  afterEach(() => {
    return new Promise((resolve, reject) => {
      if (testSubject.client.saveScreenshot(path.join(screenshotsPath, `main${counter}.png`))) {
        counter = counter + 1;
        resolve(counter);
      } else {
        reject();
      }
    });
  });

  it("has correct welcome page", () => {
    return expect(testSubject.client.getText("div.Main > div.MainArea > div.WelcomePanel > div.PanelTitle > span")).resolves.toBe("Welcome");
  });

  it("clicking on Launch WebGL site", () => {
    return testSubject.client.element("div.MainArea > div.VerticalMenu > div.VerticalMenuButton[title='Launch WebGL site']").click();
  });
});
