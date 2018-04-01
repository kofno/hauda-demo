import * as React from 'react';
import { PersistedValue } from './PersistedValue';
import { StoredValue } from 'hauda/Types';
import { observer } from 'mobx-react';

interface Props {
  store: PersistedValue;
}

const showValue = (storedValue: StoredValue): string => {
  switch (storedValue.kind) {
    case 'value':
      return storedValue.value;
    case 'no-value':
      return '[Empty]';
    case 'unknown':
      return '[Unknown]';
    case 'storage-error':
      return storedValue.message;
  }
};

const LocalStorageTracking: React.StatelessComponent<Props> = ({ store }) => (
  <div>
    <div>{showValue(store.value.current)}</div>
    <button onClick={store.subtract}>-</button>
    <button onClick={store.add}>+</button>
    <button onClick={store.reset}>Reset</button>
  </div>
);

export default observer(LocalStorageTracking);
