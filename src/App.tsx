import * as React from 'react';
import './App.css';
import LocalStorageTracking from './LocalStorageTracking';
import { PersistedValue } from './PersistedValue';
import { Maybe, nothing, just } from 'maybeasy';

const logo = require('./logo.svg');

class App extends React.Component<{}, {}> {
  localNumber: Maybe<PersistedValue> = nothing<PersistedValue>();
  sessionNumber: Maybe<PersistedValue> = nothing<PersistedValue>();

  componentWillMount() {
    this.localNumber = just(new PersistedValue({ key: 'aLocal' }));
    this.sessionNumber = just(
      new PersistedValue({
        key: 'aSession',
        storage: window.sessionStorage,
      }),
    );
  }

  componentWillUnmount() {
    this.localNumber.map(ln => ln.stop());
    this.sessionNumber.map(sn => sn.stop());
  }

  stopAll = () => {
    this.localNumber.map(ln => ln.mute());
    this.sessionNumber.map(sn => sn.mute());
  };

  startAll = () => {
    this.localNumber.map(ln => ln.unmute());
    this.sessionNumber.map(sn => sn.unmute());
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <p>Local Storage</p>
        <div>
          {this.localNumber
            .map(ln => <LocalStorageTracking store={ln} />)
            .getOrElse(() => <span />)}
        </div>
        <p>Session Storage</p>
        <div>
          {this.sessionNumber
            .map(sn => <LocalStorageTracking store={sn} />)
            .getOrElse(() => <span />)}
        </div>
        <button onClick={this.stopAll}>Stop All</button>
        <button onClick={this.startAll}>Start All</button>
        <div>
          {this.localNumber
            .map(ln => <LocalStorageTracking store={ln} />)
            .getOrElse(() => <span />)}
        </div>
      </div>
    );
  }
}

export default App;
