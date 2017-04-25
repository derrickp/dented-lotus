export interface UserResponse {
    key: string;
    display?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    points?: number;
    email?: string;
    imageUrl?: string;
    faveDriver?: string;
    faveTeam?: string;
    numCorrectPicks?: number;
    position?: number;
    positionChange?: number;
}