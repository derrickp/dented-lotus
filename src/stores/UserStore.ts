
import { User } from "../../common/models/User";
import { PublicUser } from "../../common/responses/PublicUser";
import { UserResponse } from "../../common/responses/UserResponse";

import { Store } from "./Store";

import { saveUserInfo, getUser as serverGetUser, getAllPublicUsers } from "../utilities/server/users";

export class UserStore implements Store<User> {
    private _initializePromise: Promise<void>;
    private _googleAuth: gapi.auth2.GoogleAuth;

    private _userMap: Map<string, User> = new Map<string,User>();

    getToken: () => string;

    constructor(getToken: () => string) {
        this.get = this.get.bind(this);
        this.refreshUser = this.refreshUser.bind(this);
        this.initialize = this.initialize.bind(this);
        this.get = this.get.bind(this);
        this.getAll = this.getAll.bind(this);
        this.save = this.save.bind(this);
        this.create = this.create.bind(this);
        this.refreshAllUsers = this.refreshAllUsers.bind(this);
        this.getToken = getToken;
    }

    initialize(): Promise<void> {
        this._initializePromise = this._initializePromise ? this._initializePromise : new Promise<void>((resolve, reject) => {
            const promises: Promise<void>[] = [];
            promises.push(this.refreshAllUsers());
            return Promise.all(promises).then(() => {
                resolve();
            });
        });
        return this._initializePromise;
    }

    getAll(): User[] {
        return Array.from(this._userMap.values());
    }

    create(response: UserResponse) {
        return Promise.reject(new Error("Not implemented"));
    }

    save(model: User) {
        return Promise.reject(new Error("Not implemented"));
    }

    get(key: string) {
        if (this._userMap.has(key)) return this._userMap.get(key);
        return null;
    }

    refreshUser(key: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return serverGetUser(key, this.getToken()).then(userResponse => {
                const user = new User(userResponse, "", null);
                if (this._userMap.has(key)) this._userMap.delete(key);
                this._userMap.set(key, user);
                resolve();
            }).catch(reject);
        });
    }

    refreshAllUsers(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return getAllPublicUsers().then((users: PublicUser[]) => {
                for (const publicUser of users) {
                    const user = new User(publicUser, "", null);
                    if (this._userMap.has(publicUser.key)) this._userMap.delete(publicUser.key);
                    this._userMap.set(publicUser.key, user);
                }
                resolve();
            });
        });
    }
}