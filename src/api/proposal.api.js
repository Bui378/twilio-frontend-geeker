import apiClient from './index';
// import { SESSION_EXPIRE_URL } from '../constants';

export async function getProposals(params) {
  return apiClient
    .get('/proposals', { params })
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}


export async function createProposal(data) {
  return apiClient
    .post('/proposals', data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function retrieveProposal(ProposalId) {
  return apiClient
    .get(`/proposals/${ProposalId}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function updateProposal(ProposalId, data) {
  return apiClient
    .put(`/proposals/${ProposalId}`, data)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}

export async function removeProposal(ProposalId) {
  return apiClient
    .delete(`/proposals/${ProposalId}`)
    .then(response => {
      if (response) {
        return response.data;
      }
      return Promise.reject();
    })
    
}
