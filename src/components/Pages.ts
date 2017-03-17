import { RacePage } from "./Pages/RacePage";
import { AllRaces } from "./Pages/AllRaces";
import { TrackPage } from "./Pages/TrackPage";
import { Tracks } from "./Pages/Tracks";
import {Drivers} from "./Pages/Drivers";
import { Signup } from "./Pages/Signup";

export { RacePage, AllRaces, TrackPage, Tracks, Drivers, Signup };

export class Pages {
    static HOME = "home";
    static RACE  = "race";
    static USER = "user";
    static DRIVERS = "drivers"; 
    static TRACKS = "tracks";
    static ALL_RACES = "all-races";
    static SIGN_UP = "signup";
    static PICKS = "picks";
}