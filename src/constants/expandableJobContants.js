export const formatResult = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let durationType = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return { hours, minutes, durationType }
}

export const pageDetailData =
{
    help: "Help is on the way!",
    matching: "We are matching a Geek to your request...",
    time_detail: "Typical wait time is usually less than 15 minutes...",
    next: "What happens next:",
    ready_to_connect: "When your Geek is ready to connect we'll attempt to connect you at:",
    contact_through_num: "If you chose phone audio, your Geek will be calling from the following number:",
    time_finished_message: "Sorry, we’re currently experiencing a higher-than-average demand.",
    message_for_times_up: "Looks like you’re not the only one struggling with"
}

export const hrArray = ["1 hour", "2 hours", "3 hours", "4 hours", "5 hours", "6 hours"];
export const defaultContactNumber = '(907 268 6284)'
export const defaultContactNumberSecond = '(737 241 0962)'

export const calculateTimeDifference = (startTime, notifiedTechs, tech_search_time) => {
    const now = new Date().getTime();
    const selectedTime = new Date(startTime);
    let timeDiff = now - selectedTime;
    timeDiff = tech_search_time - timeDiff
    return timeDiff;
}
