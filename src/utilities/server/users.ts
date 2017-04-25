
import { baseUrl } from "../ServerUtils";
import { getRandomInt } from "../../../common/utils/numbers";
import { DEFAULT_IMAGES } from "../../../common/utils/images";
import { PublicUser } from "../../../common/responses/PublicUser"; 
import { AuthPayload } from "../../../common/payloads/AuthPayload";
import { AuthResponse } from "../../../common/responses/AuthResponse";
import { UserResponse } from "../../../common/responses/UserResponse";

export function saveUserInfo(user: UserResponse, id_token: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        return fetch(`${baseUrl}/users/${user.key}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(user)
        }).then(response => {
            if (response.ok) {
                resolve();
                return;
            }
            else {
                return response.json().then(json => {
                    reject(new Error(json.message));
                });
            }
        });
    });
}

export function getUser(key: string, id_token: string): Promise<UserResponse> {
    return new Promise<UserResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/users/${key}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + id_token
            }
        }).then(response => {
            return response.json().then(json => {
                if (response.ok) {
                    const users: UserResponse[] = json;
                    const user = users[0];
                    user.imageUrl = user.imageUrl ? user.imageUrl : getRandomImage();
                    resolve(user);
                }
                else {
                    reject(new Error(json.message));
                }
            });
        });
    });
}

export function authenticate(authPayload: AuthPayload): Promise<AuthResponse> {
    return new Promise<AuthResponse>((resolve, reject) => {
        return fetch(`${baseUrl}/users/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(authPayload)
        }).then(response => {
            return response.json().then((authResponse: AuthResponse) => {
                resolve(authResponse);
            });
        });
    });
}

export function getAllPublicUsers(): Promise<PublicUser[]> {
    return new Promise<PublicUser[]>((resolve, reject) => {
        return fetch(`${baseUrl}/allusers`).then(response => {
            return response.json().then((publicUsers: PublicUser[]) => {
                const users = publicUsers.map(ur => {
                    const user: PublicUser = {
                        imageUrl: ur.imageUrl ? ur.imageUrl : getRandomImage(),
                        display: ur.display,
                        points: ur.points,
                        key: ur.key,
                        numCorrectPicks: ur.numCorrectPicks,
                        position: ur.position,
                        positionChange: ur.positionChange
                    };
                    return user;
                });
                resolve(users);
            });
        });
    });
}

function getRandomImage(): string {
    const num = getRandomInt(0, 2);
    const imageUrl = DEFAULT_IMAGES[num];
    return imageUrl;
}