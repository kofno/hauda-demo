import * as React from "react";
import "./App.css";
import { PersistedValue } from "./PersistentValue";
import Addition from "./Addition";
import { LocalStorageTracking } from "./LocalStorageTracking";

const logo = require("./logo.svg");

class App extends React.Component {
  localNumber: PersistedValue = new PersistedValue({ key: "aLocal" });
  sessionNumber: PersistedValue = new PersistedValue({
    key: "aSession",
    storage: window.sessionStorage
  });

  componentWillMount() {
    this.localNumber.start();
    this.sessionNumber.start();
  }

  componentWillUnmount() {
    this.localNumber && this.localNumber.stop();
    this.sessionNumber && this.sessionNumber.stop();
  }

  stopAll = () => {
    this.localNumber.stop();
    this.sessionNumber.stop();
  };

  startAll = () => {
    this.localNumber.start();
    this.sessionNumber.start();
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
        <p>
          <Addition aNumber={this.localNumber} />
        </p>
        <p>Session Storage</p>
        <p>
          <Addition aNumber={this.sessionNumber} />
        </p>
        <button onClick={this.stopAll}>Stop All</button>
        <button onClick={this.startAll}>Start All</button>
        <div><LocalStorageTracking /></div>
      </div>
    );
  }
}

export default App;
