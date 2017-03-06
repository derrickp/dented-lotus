export class Race {
    displayName: string;
    date: Date;
    country: string;
    id:number;
}

export const races: Race[] = [
    {
        id:1,
        displayName: "Australian GP",
        date: new Date("March 26, 2017"),
        country: "Australia"
    },
    {
        id:2,
        displayName: "Monaco GP",
        date: new Date("April 1, 2017"),
        country: "Richville"
    },
    {
        id:3,
        displayName: "American GP",
        date: new Date("August 22, 2017"),
        country: "Apocalypse Now"
    }
];