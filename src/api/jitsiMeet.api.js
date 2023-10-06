import { getIdFromJobId } from 'utils';
// import { apiClientJitsi } from './index';

export function gettingMeeting(id) {
  const jitsiMeetId = getIdFromJobId(id);

  return {
    aud: 'jitsi',
    authRoom: '*',
    avatar: 'https://www.gravatar.com/avatar/73543542128f5a067ffc34305eefe48a',
    email: 'customer@askned.com',
    exp: 24,
    fullURL: 'https://winkit.ml',
    group: 'justwinkit',
    id: jitsiMeetId,
    iss: 'panther-core',
    name: 'cust hi',
    room: jitsiMeetId,
    sub: 'winkit.ml',
    userId: 'usr_TYvCKtASP5SLbYu2r',
  };
}

export function createMeeting(data) {
  const response = { id: data.room };
  return response;
  // return response.data;
}
