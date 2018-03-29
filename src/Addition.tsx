import * as React from "react";
import { just, nothing } from "maybeasy";
import { observer } from "mobx-react";
import {PersistedValue} from "./PersistedValue";

interface Props {
  aNumber: PersistedValue;
}

type MathOp = (n: number) => number;

const doMath = (op: MathOp, num: PersistedValue) => {
  const v = num.value.map(Number).getOrElseValue(0);
  const justAString = (n: any) => just(String(n));
  if (isNaN(v)) {
    console.error(`${v} is not a number. Can't math it.`); // tslint:disable-line: no-console
  } else {
    num.value = justAString(op(v));
  }
};

const subtract = (num: PersistedValue) => () => doMath(n => n - 1, num);
const add = (num: PersistedValue) => () => doMath(n => n + 1, num);
const reset = (num: PersistedValue) => () => (num.value = nothing<string>());

const Addition: React.StatelessComponent<Props> = ({ aNumber }) => {
  return (
    <div>
      <div>{aNumber.value.getOrElseValue("Not stored")}</div>
      <button onClick={subtract(aNumber)}>-</button>
      <button onClick={add(aNumber)}>+</button>
      <button onClick={reset(aNumber)}>Reset</button>
    </div>
  );
};

export default observer(Addition);
