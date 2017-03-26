export const DATE_FORMAT = "MM/DD/YYYY";

export const FULL_FORMAT = "MM/DD/YYYY HH:mm"

import * as moment from "moment";

export function getDurationFromNow(date: string): DurationFromNow {
    const cutoffTime = moment(date, DATE_FORMAT);
    const now = moment();
    const timeRemaining = cutoffTime.diff(now);
    const duration = moment.duration(timeRemaining, "milliseconds");
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    const strHours = ("0" + hours.toString()).slice(-2);
    const strMinutes = ("0" + minutes.toString()).slice(-2);
    const strSeconds = ("0" + seconds.toString()).slice(-2);
    const dayString = days === 1 ? "day" : "days";
    const output = `${days} ${dayString} : ${strHours} : ${strMinutes} : ${strSeconds}`;
    return {
        timeRemaining: timeRemaining,
        duration: duration,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        fullDuration: output
    };
}

export interface DurationFromNow {
    timeRemaining: number;
    duration: moment.Duration;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    fullDuration: string;
}