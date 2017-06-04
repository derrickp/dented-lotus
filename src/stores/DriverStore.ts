
import { DriverModel, DriverModelContext } from "../../common/models/Driver";
import { TeamModel } from "../../common/models/Team";
import { User } from "../../common/models/User";
import { DriverResponse } from "../../common/responses/DriverResponse";

import { getAllDrivers, getDriver, saveDrivers, createDriver } from "../utilities/server/drivers";

import { Store } from "./Store";

export class DriverStore implements Store<DriverModel> {
    private _initialized: Promise<void>;

    private readonly _driverMap: Map<string, DriverModel> = new Map<string, DriverModel>();

    getTeam: (key: string) => TeamModel;
    getToken: () => string;

    constructor(getToken: () => string, getTeam: (key: string) => TeamModel) {
        this.initialize = this.initialize.bind(this);
        this.get = this.get.bind(this);
        this.getAll = this.getAll.bind(this);
        this.save = this.save.bind(this);
        this.create = this.create.bind(this);
        this.refresh = this.refresh.bind(this);
        this.getToken = getToken;
        this.getTeam = getTeam;
    }

    initialize(): Promise<void> {
        this._initialized = this._initialized ? this._initialized : new Promise<void>((resolve, reject) => {
            return this.refresh().then(() => {
                resolve();
            }).catch(error => reject(error));
        });
        return this._initialized;
    }

    get(key: string): DriverModel {
        if (this._driverMap.has(key)) return this._driverMap.get(key);
        return null;
    }

    getAll(): DriverModel[] {
        return Array.from(this._driverMap.values());
    }

    save(driver: DriverModel): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            return saveDrivers([driver.json], this.getToken()).then(newDriverResponses => {
                const newDriverModels: DriverModel[] = [];
                if (newDriverResponses.length) {
                    for (const newDriverResponse of newDriverResponses) {
                        if (this._driverMap.has(newDriverResponse.key)) {
                            this._driverMap.delete(newDriverResponse.key);
                        }
                        const newDriverModel = new DriverModel(newDriverResponse, this.driverContext);
                        this._driverMap.set(newDriverResponse.key, newDriverModel);
                    }
                }
                resolve(true);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    create(dr: DriverResponse): Promise<DriverModel> {
        return new Promise<DriverModel>((resolve, reject) => {
            // Ensure the key is nulled out for a new driver
            dr.key = null;
            return createDriver(dr, this.getToken()).then((newDriverResponse) => {
                const newDriverModel: DriverModel = null;
                if (newDriverResponse) {
                    if (this._driverMap.has(newDriverResponse.key)) {
                        this._driverMap.delete(newDriverResponse.key);
                    }
                    const driverModel = new DriverModel(newDriverResponse, this.driverContext);
                    this._driverMap.set(newDriverResponse.key, driverModel);
                    resolve(driverModel);
                }
                reject(new Error("No response when creating driver"));
            }).catch(reject);
        });
    }

    refresh(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return getAllDrivers().then((driverResponses: DriverResponse[]) => {
                this._driverMap.clear();
                for (const dr of driverResponses) {
                    const driverModel = new DriverModel(dr, this.driverContext);
                    this._driverMap.set(dr.key, driverModel);
                }
                resolve();
            });
        });
    }

    get driverContext(): DriverModelContext {
        return {
            saveDriver: (driver: DriverModel) => {
                return this.save(driver);
            },
            getTeam: (key: string) => {
                return this.getTeam(key);
            }
        };
    }
}