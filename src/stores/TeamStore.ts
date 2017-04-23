
import { TeamModel } from "../../common/models/Team";
import { User } from "../../common/models/User";
import { TeamResponse } from "../../common/responses/TeamResponse";

import { getAllTeams, getTeamByAbbreviation, saveTeams } from "../utilities/server/teams";

import { Store } from "./Store";

export class TeamStore implements Store<TeamModel> {
    private _initialized: Promise<void>;

    private _teamMap: Map<string, TeamModel> = new Map<string, TeamModel>();

    getToken: () => string;

    constructor(getToken: () => string) {
        this.getToken = getToken;
        this.initialize = this.initialize.bind(this);
        this.get = this.get.bind(this);
        this.getAll = this.getAll.bind(this);
        this.save = this.save.bind(this);
        this.create = this.create.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    initialize(): Promise<void> {
        this._initialized = this._initialized ? this._initialized : new Promise<void>((resolve, reject) => {
            return this.refresh().then(() => {
                resolve();
            });
        });
        return this._initialized;
    }

    get(key: string): TeamModel {
        if (this._teamMap.has(key)) return this._teamMap.get(key);
        return null;
    }

    getAll(): TeamModel[] {
        return Array.from(this._teamMap.values());
    }

    save(model: TeamModel): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const payload = [model.json];
            return saveTeams(payload, this.getToken()).then((newResponses) => {
                const newTeamModels: TeamModel[] = [];
                if (newResponses.length) {
                    for (const newTeamResponse of newResponses) {
                        if (this._teamMap.has(newTeamResponse.key)) {
                            this._teamMap.delete(newTeamResponse.key);
                        }
                        const team = new TeamModel(newTeamResponse);
                        this._teamMap.set(newTeamResponse.key, team);
                    }
                    resolve(true);
                }
                reject(new Error("No responses from server"));
            }).catch(reject);
        });
    }

    create(tr: TeamResponse): Promise<TeamModel> {
        return new Promise<TeamModel>((resolve, reject) => {
            const payload = [tr];
            return saveTeams(payload, this.getToken()).then((newResponses) => {
                const newTeamModels: TeamModel[] = [];
                if (newResponses.length) {
                    for (const newTeamResponse of newResponses) {
                        if (this._teamMap.has(newTeamResponse.key)) {
                            this._teamMap.delete(newTeamResponse.key);
                        }
                        const team = new TeamModel(newTeamResponse);
                        this._teamMap.set(newTeamResponse.key, team);
                    }
                    resolve(this.get(tr.key));
                }
                else {
                    reject(new Error("No valid response from server"));
                }
            }).catch(reject);
        });
    }

    refresh(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            return getAllTeams().then(teamResponses => {
                this._teamMap.clear();
                for (const teamResponse of teamResponses) {
                    const team = new TeamModel(teamResponse);
                    this._teamMap.set(teamResponse.key, team);
                }
                resolve();
            });
        });
    }
}
