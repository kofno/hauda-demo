import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/skipWhile';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import Result from 'resulty/Result';
import { err, ok } from 'resulty';
import storageAvailable from 'storage-available';
import { just, nothing } from 'maybeasy';
import Maybe from 'maybeasy/Maybe';
import { Subscription } from 'rxjs/Subscription';

interface Options {
  key: string;
  storage?: Storage;
}

export type StoredValue = Result<string, string>;

export class PersistedValue {
  constructor(options: Options) {
    this.key = options.key;
    this.storage = options.storage || window.localStorage;
    this.subscription = this.all$
      .skipWhile(() => !storageAvailable('localStorage'))
      .subscribe(this.status);
  }

  get status(): BehaviorSubject<StoredValue> {
    if (this._status) return this._status;
    this._status = storageAvailable('localStorage')
      ? new BehaviorSubject<StoredValue>(this.getValue())
      : new BehaviorSubject<StoredValue>(err('Web storage not available'));
    return this._status;
  }

  get value(): Maybe<string> {
    return this.status.value.cata({
      Err: () => nothing<string>(),
      Ok: v => just(v),
    });
  }

  set value(s: Maybe<string>) {
    this.page$ &&
      this.page$.next(
        s.cata({
          Nothing: () => err<string, string>('Nothing stored'),
          Just: v => ok<string, string>(v),
        }),
      );
  }

  stop = () => {
    this.subscription.unsubscribe();
  };

  mute = () => {
    this.muted = true;
  };

  unmute = () => {
    this.muted = false;
  };

  private getValue = (): StoredValue => {
    const value = this.storage.getItem(this.key);
    return value ? ok(value) : err('No value');
  };

  private get page$(): Subject<StoredValue> {
    if (this._page$) return this._page$;
    this._page$ = new Subject<StoredValue>();
    return this._page$;
  }

  private get storage$(): Observable<StoredValue> {
    if (this._storage$) return this._storage$;
    this._storage$ = Observable.fromEvent<StorageEvent>(window, 'storage')
      .filter(e => e.key === this.key)
      .map(e => e.newValue)
      .map(v => (v ? ok(v) : err('Nothing Stored')));
    return this._storage$;
  }

  private get all$(): Observable<StoredValue> {
    if (this._all$) return this._all$;
    this._all$ = Observable.merge(
      this.storage$.filter(() => !this.muted),
      this.page$.filter(() => !this.muted).do(this.writeValue),
    );
    return this._all$;
  }

  private writeValue = (value: StoredValue): void => {
    value.cata({
      Err: e => this.storage.removeItem(this.key),
      Ok: v => this.storage.setItem(this.key, v),
    });
  };

  private key: string;
  private storage: Storage;
  private _storage$?: Observable<StoredValue>;
  private _page$?: Subject<StoredValue>;
  private _all$?: Observable<StoredValue>;
  private _status?: BehaviorSubject<StoredValue>;
  private muted: boolean = false;
  private subscription: Subscription;
}
