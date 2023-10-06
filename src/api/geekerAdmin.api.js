import apiClient from './index';

export async function getGeekerAdminById(geekerAdminId) {
    console.log("My console for id in geekerAdmin.api", geekerAdminId)
	return apiClient
		.get(`/geekerAdmin/${geekerAdminId}`)
		.then(response => {
			if (response) {
				return response.data;
			}
			return Promise.reject();
		})
}