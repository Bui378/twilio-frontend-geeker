import apiClient from './index';

export async function updateBusinessDetails(id,data) {
    return apiClient
        .post(`/business-details/update/${id}`, data)
        .then(response => {
            if (response) {
                return response.data;
            }
            return Promise.reject();
        })

}