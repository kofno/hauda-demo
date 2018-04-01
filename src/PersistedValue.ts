import { StoredValueSubject, Options } from 'hauda';
import { StoredValue, storedValue, noValue } from 'hauda/Types';
import { computed } from 'mobx';
import * as MobxUtils from 'mobx-utils';
import { Maybe, just, nothing } from 'maybeasy';

export class PersistedValue {
  readonly value$: StoredValueSubject;
  readonly value: { current: StoredValue; dispose: () => void };

  constructor(options: Options) {
    this.value$ = new StoredValueSubject(options);
    this.value = MobxUtils.fromStream<StoredValue>(this.value$);
  }

  @computed
  get number(): Maybe<number> {
    const { current } = this.value;
    switch (current.kind) {
      case 'value':
        return just(current.value)
          .map(Number)
          .andThen(v => (isNaN(v) ? nothing<number>() : just(v)));
      default:
        return nothing<number>();
    }
  }

  public add = () => {
    console.log('Foo');
    this.doMath(n => n + 1);
  };

  public subtract = () => {
    this.doMath(n => n - 1);
  };

  public reset = () => {
    this.value$.next(noValue());
  };

  public stop = () => {
    this.value.dispose();
  };

  public mute = () => {
    this.value$.mute();
  };

  public unmute = () => {
    this.value$.unmute();
  };

  private doMath = (mathOp: (n: number) => number) => {
    const result = this.number.map(mathOp).map(String).cata({
      Nothing: () => storedValue('0'),
      Just: v => storedValue(v),
    });
    this.value$.next(result);
  };
}
