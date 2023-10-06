/**
 * Function will return the total job time amd total seconds -- excluding pause time
 * @params = job
 * @response : Will return an object of total job time and total seconds
 * @author : Vinit
 */

const getTotalJobTime=(job)=>{
    let meetingStartTime = new Date(job.meeting_start_time);
    let meetingEndTime = (job.status === "Completed") ? new Date(job.meeting_end_time) : new Date()
    // let meetingEndTime = new Date()
    let total_time = 0
    let totalSeconds = 0

    if(job.meeting_pause || job.pause_start_time){

        if(job.meeting_pause){
            meetingEndTime = job.pause_start_time;
            totalSeconds = new Date(meetingEndTime).getTime() - meetingStartTime.getTime()
            let duration = new Date(totalSeconds);
            if(job.total_pause_seconds && job.total_pause_seconds > 0){
                total_time = new Date(duration - (job.total_pause_seconds * 1000)).toISOString().substr(11, 8);
            }else{
                total_time = new Date(duration).toISOString().substr(11, 8);
            }

        }else{
            let meetingEndTime = (job.status === "Completed") ? new Date(job.meeting_end_time) : new Date()
            totalSeconds = meetingEndTime.getTime() - meetingStartTime.getTime()
            let duration = totalSeconds;
            if(job.total_pause_seconds && job.total_pause_seconds > 0){
                total_time = new Date(duration - (job.total_pause_seconds * 1000)).toISOString().substr(11, 8);
            }
        }

    }else{
        if(meetingEndTime && meetingStartTime){
            totalSeconds = meetingEndTime.getTime()-meetingStartTime.getTime();
        }
        if(totalSeconds > 0){
            total_time = new Date(totalSeconds).toISOString().substr(11, 8);
        }

    }
     console.log("COmmon console complete obj", {'totalSeconds':(totalSeconds > 0) ? (totalSeconds/1000) : 0, 'totalTime': total_time})
    return ({'totalSeconds':(totalSeconds > 0) ? (totalSeconds/1000) : 0, 'totalTime': total_time})
} 

export default getTotalJobTime;