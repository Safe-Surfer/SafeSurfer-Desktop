// spec.js

const Application = require('spectron').Application,
  assert = require('assert'),
  electronPath = require('electron'),
  path = require('path');

describe('Application launch', function () {
  this.timeout(10000);

  const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')]
  });

  beforeEach(function () {
    this.app = app;
    return this.app.start();
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  const setupApp = function() {
        app.client.waitUntilWindowLoaded();
  };

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1);
    });
  });
});
