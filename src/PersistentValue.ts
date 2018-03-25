import {
  computed,
  observable,
  configure,
  reaction,
  IReactionDisposer
} from "mobx";
import { fromNullable, just, Maybe, nothing } from "maybeasy";

configure({ enforceActions: true });

interface CannotPersist {
  kind: "cannot-persist";
}

interface Deleting {
  kind: "deleting";
  key: string;
}

const deleting = (key: string): Status => ({ kind: "deleting", key });

interface Writing {
  kind: "writing";
  key: string;
  value: string;
}

const writing = (key: string, value: string): Status => ({
  kind: "writing",
  key,
  value
});

interface NotFound {
  kind: "not-found";
}

const notFound = (): Status => ({ kind: "not-found" });

interface Found {
  kind: "found";
  value: string;
}

const found = (value: string): Status => ({ kind: "found", value });

interface Finding {
  kind: "finding";
  key: string;
}

const finding = (key: string): Status => ({ kind: "finding", key });

interface Unknown {
  kind: "unknown";
}

type Status =
  | Unknown
  | Finding
  | Found
  | NotFound
  | Writing
  | Deleting
  | CannotPersist;

interface Options {
  key: string;
  storage?: Storage;
}

type Terminator = () => void;

export class PersistedValue {
  constructor(options: Options) {
    this.key = options.key;
    this.storage = options.storage || window.localStorage;
    this.start();
  }

  @computed
  get status(): Status {
    return this._status;
  }

  set status(s: Status) {
    this._status = s;
  }

  @computed
  get value(): Maybe<string> {
    switch (this.status.kind) {
      case "unknown":
      case "finding":
      case "not-found":
      case "deleting":
      case "cannot-persist":
        return nothing<string>();
      case "found":
      case "writing":
        return just(this.status.value);
    }
  }

  set value(v: Maybe<string>) {
    v.cata({
      Nothing: () => {
        this.status = deleting(this.key);
      },
      Just: value => {
        this.status = writing(this.key, value);
      }
    });
  }

  start = () => {
    if (this.terminators.length > 0) {
      console.warn("Persisted value already started");
      return;
    }
    this.terminators = [this.listenToStorage(), this.startReactions()];
  };

  stop = () => {
    if (this.terminators.length == 0) {
      console.warn("Persisted value already stopped");
      return;
    }
    this.terminators.forEach(fn => fn());
    this.terminators.length = 0;
  };

  @observable private _status: Status = { kind: "unknown" };
  private key: string;
  private storage: Storage;
  private terminators: Terminator[] = [];

  private listenToStorage = () => {
    const handleUpdateFromStorage = (event: StorageEvent) => {
      if (event.key === this.key) {
        this.status = fromNullable(event.newValue).cata({
          Nothing: (): Status => notFound(),
          Just: (value): Status => found(value)
        });
      }
    };

    window.addEventListener("storage", handleUpdateFromStorage);

    return () => {
      window.removeEventListener("storage", handleUpdateFromStorage);
    };
  };

  private startReactions = (): IReactionDisposer =>
    reaction(
      (): Status => this.status,
      (status: Status) => {
        switch (status.kind) {
          case "unknown":
            this.status = finding(this.key);
            break;
          case "finding":
            this.status = fromNullable(this.storage.getItem(status.key))
              .map(found)
              .getOrElse(notFound);
            break;
          case "found":
          case "not-found":
          case "cannot-persist":
            break;
          case "writing":
            this.storage.setItem(status.key, status.value);
            this.status = found(status.value);
            break;
          case "deleting":
            this.storage.removeItem(status.key);
            this.status = notFound();
        }
      },
      { fireImmediately: true }
    );
}
