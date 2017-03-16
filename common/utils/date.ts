export const DATE_FORMAT = "MM/DD/YYYY";

import * as moment from "moment";

export function getDurationFromNow(date: string): DurationFromNow {
    const cutoffTime = moment(date, DATE_FORMAT);
    const now = moment();
    const timeRemaining = cutoffTime.diff(now);
    const duration = moment.duration(timeRemaining, "milliseconds");
    const days = Math.floor(duration.asDays());
    const hours = Math.floor(duration.subtract(days, "days").asHours());
    const minutes = Math.floor(duration.subtract(hours, "hours").asMinutes());
    const seconds = Math.floor(duration.subtract(minutes, "minutes").asSeconds());
    const strHours = ("0" + hours.toString()).slice(-2);
    const strMinutes = ("0" + minutes.toString()).slice(-2);
    const strSeconds = ("0" + seconds.toString()).slice(-2);
    const dayString = days === 1 ? "day" : "days";
    const output = `${days} ${dayString} : ${strMinutes} : ${strSeconds}`;
    return {
        duration: duration,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        fullDuration: output
    };
}

export interface DurationFromNow {
    duration: moment.Duration;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    fullDuration: string;
}