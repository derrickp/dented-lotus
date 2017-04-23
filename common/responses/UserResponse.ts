export interface UserResponse {
    key: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    points?: number;
    email?: string;
    imageUrl?: string;
    faveDriver?: string;
    faveTeam?: string;
    numCorrectPicks?: number;
}