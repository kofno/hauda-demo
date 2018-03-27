import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import { Subject } from "rxjs/Subject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import Result from "resulty/Result";
import { err, ok } from "resulty";
import storageAvailable from "storage-available";
import { just, nothing } from "maybeasy";
import Maybe from "maybeasy/Maybe";

interface Options {
  key: string;
  storage?: Storage;
}

export type StoredValue = Result<string, string>;

export class PersistedValue {
  public status: BehaviorSubject<StoredValue> = new BehaviorSubject<
    StoredValue
  >(err("Unknown"));

  constructor(options: Options) {
    this.key = options.key;
    this.storage = options.storage || window.localStorage;
    this.start();
  }

  get value(): Maybe<string> {
    return this.status.value.cata({
      Err: () => nothing<string>(),
      Ok: v => just(v)
    });
  }

  set value(s: Maybe<string>) {
    this.page$.next(
      s.cata({
        Nothing: () => err<string, string>("Nothing stored"),
        Just: v => ok<string, string>(v)
      })
    );
  }

  start = () => {
    if (storageAvailable("localStorage")) {
      const value = this.storage.getItem(this.key);
      const initial = value
        ? ok<string, string>(value)
        : err<string, string>("No value");
      const behavior = new BehaviorSubject<StoredValue>(initial);
      this.page$.subscribe(behavior);
      this.storage$.subscribe(behavior);

      this.status = behavior;
    } else {
      this.status = new BehaviorSubject<StoredValue>(
        err("Web Storage is not available")
      );
    }
  };

  stop = () => {
    this.status.complete();

    this.page$.unsubscribe();

    this._storage$ = undefined;
    this._page$ = undefined;
  };

  private get page$(): Subject<StoredValue> {
    if (!this._page$) {
      const subject = new Subject<StoredValue>();
      subject.subscribe(result => {
        result.cata({
          Err: e => this.storage.removeItem(this.key),
          Ok: v => this.storage.setItem(this.key, v)
        });
      });
      this._page$ = subject;
    }

    return this._page$;
  }

  private get storage$(): Observable<StoredValue> {
    if (!this._storage$) {
      this._storage$ = Observable.fromEvent<StorageEvent>(window, "storage")
        .filter(e => e.key === this.key)
        .map(e => e.newValue)
        .map(v => (v ? ok(v) : err("Nothing Stored")));
    }

    return this._storage$;
  }

  private key: string;
  private storage: Storage;
  private _page$?: Subject<StoredValue>;
  private _storage$?: Observable<StoredValue>;
}
