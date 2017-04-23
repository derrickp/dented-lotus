
import { baseUrl } from "../ServerUtils";
import { DriverResponse } from "../../../common/responses/DriverResponse";

export function getAllDrivers(activeOnly: boolean = true): Promise<DriverResponse[]> {
    return new Promise<DriverResponse[]>((resolve, reject) => {
        let suffix = "/drivers";
        if (activeOnly) {
            suffix += "/active";
        }
        return fetch(`${baseUrl}/drivers`).then(response => {
            return response.json().then((drivers: DriverResponse[]) => {
                resolve(drivers);
            });
        });
    });
}

export function getDriver(key: string): Promise<DriverResponse> {
    return new Promise<DriverResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/drivers/${key}`).then(response => {
            return response.json().then((drivers: DriverResponse[]) => {
                if (drivers.length) {
                    resolve(drivers[0]);
                } else {
                    resolve(null);
                }
            });
        });
    });
}

export function saveDrivers(driversPayload: DriverResponse[], id_token: string): Promise<DriverResponse[]> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<DriverResponse[]>((resolve, reject) => {
        return fetch(`${baseUrl}/admin/drivers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(driversPayload)
        }).then(response => {
            return response.json().then((driverResponse: DriverResponse[]) => {
                resolve(driverResponse);
            });
        });
    });
}

export function createDriver(driverPayload: DriverResponse, id_token: string): Promise<DriverResponse> {
    if (!id_token) return Promise.reject(new Error("Unauthorized"));
    return new Promise<DriverResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/admin/drivers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(driverPayload)
        }).then(response => {
            return response.json().then((driverResponse: DriverResponse) => {
                resolve(driverResponse);
            });
        });
    });
}