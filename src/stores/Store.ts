export interface Store<T> {
    get: (key: string) => T;
    getAll: () => T[];
    initialize: () => Promise<void>;
    save: (obj: T) => Promise<boolean>;
    create: (obj: any) => Promise<T>;
}