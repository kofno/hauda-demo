import * as React from "react";
import "rxjs/add/observable/fromEvent";
import { PersistedValue, StoredValue } from "./PersistedValue";
import {just, nothing} from "maybeasy";

interface State {
  aNumber: StoredValue;
}

export class LocalStorageTracking extends React.Component<{}, State> {
  constructor(_props: {}) {
    super(_props);
  }

  componentWillMount() {
    this.storage = new PersistedValue({ key: "aLocal" });
    this.storage.status.subscribe(aNumber => {
      this.setState({ aNumber });
    });
  }

  componentWillUnmount() {
    this.storage && this.storage.stop();
  }

  render() {
    return (
      <div>
        <div>{this.state.aNumber.cata({ Err: msg => msg, Ok: v => v })}</div>
        <button onClick={this.subtract}>-</button>
        <button onClick={this.add}>+</button>
        <button onClick={this.reset}>Reset</button>
      </div>
    );
  }

  private storage?: PersistedValue;

  private doMath = (mathOp: (n: number) => number) => {
    if (!this.storage) return;

    this.storage.value = this.storage.value
      .map(Number)
      .map(mathOp)
      .map(String)
      .cata({
        Nothing: () => just("0"),
        Just: v => just(v)
      });
  };

  private subtract = () => {
    this.doMath(n => n - 1);
  };

  private add = () => {
    this.doMath(n => n + 1);
  };

  private reset = () => {
    this.storage && (this.storage.value = nothing<string>());
  }
}
