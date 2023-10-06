import { useMutation, useQuery, useQueryClient } from 'react-query';
import apiClient from './index';

export const fetchInvites = async () => {
  let { data } = await apiClient.get('/invite');
  return data;
};

/**
 * Following API will fetch all the invites according to the data provided without any pagination
 * @params : data
 * @return : All invite list
 * @author : Vinit
 **/
export async function findAllInvitesByParams(data){
	return apiClient
	.post('/invite/fetchAllInvites',data)
	.then(response =>{
		if(response){
			return {invites:response.data,total:response.data.totalCount};
		}
		return Promise.reject();
	})
	
}

const fetchInvite = async (inviteCode) => {
  let { data } = await apiClient.get(`/invite/get/${inviteCode}`);

  return data?.data;
};
export const useFetchInvites = () => useQuery('invites', fetchInvites);

const sendInvite = async (inviteData) => {

  let { data } = await apiClient.post('/invite/new', inviteData);
  return data;
};

export const useInviteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation((inviteData) => sendInvite(inviteData), {
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries('invites');
      }
    },
    onError: (data) => {
      console.log('error', data);
    },
  });
};

export const useFetchInvite = (inviteId) => useQuery(['invite', inviteId], () => fetchInvite(inviteId));

