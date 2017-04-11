import { RacePage } from "./Pages/RacePage";
import { AllRaces } from "./Pages/AllRaces";
import { TrackPage } from "./Pages/TrackPage";
import { Tracks } from "./Pages/Tracks";
import { Drivers } from "./Pages/Drivers";
import { AllSeasonPicks } from "./Pages/AllSeasonPicks"
import { Blogs } from "./Pages/Blogs";
import { Profile } from "./Pages/Profile";
import { RaceAdminPage as RaceAdmin } from "./Pages/Admin/RaceAdmin"
import { GeneralAdmin } from "./Pages/Admin/GeneralAdmin";

export { RacePage, AllRaces, TrackPage, Tracks, Drivers, AllSeasonPicks, Blogs, Profile, RaceAdmin, GeneralAdmin };

export class Pages {
    static HOME = "home";
    static RACE = "race";
    static USER = "user";
    static DRIVERS = "drivers";
    static TRACKS = "tracks";
    static ALL_RACES = "all-races";
    static PICKS = "picks";
    static ALL_SEASON_PICKS = "all-season-picks";
    static BLOGS = "blogs";
    static PROFILE = "profile";
    static PREDICTIONS_ADMIN = "predictions-admin";
    static RACE_ADMIN = "race-admin";
    static GENERAL_ADMIN = "general-admin";
}
