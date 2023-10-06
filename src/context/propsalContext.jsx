import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router';
import * as PropApi from '../api/proposal.api';
import { openNotificationWithIcon } from '../utils';

const ProposalContext = React.createContext({});

function ProposalProvider(props) {
  const [proposal, setProposal] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const fetchProposal = useCallback(async (propId) => {
    try {
      setIsLoading(true);
      const res = await PropApi.retrieveProposal(propId);
      setProposal(res);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon('error', 'Error', 'Job does not exist.');
      history.push('/dashboard');
    }
  }, [history]);

  async function createJob(data) {
    try {
      const res = await PropApi.createProposal(data);
      setProposal(res);
      return res;
    } catch (err) {
      openNotificationWithIcon('error', 'Error', 'Job does not exist.');
    }
  }

  async function updateProp(jobId, data) {
    try {
      await PropApi.updateProposal(jobId, data);
      await fetchProposal(jobId);
    } catch (err) {
      setIsLoading(false);
      openNotificationWithIcon('error', 'Error', 'Failed to update proposal.');
    }
  }

  return (
    <ProposalContext.Provider
      value={{
        proposal,
        isLoading,
        fetchProposal,
        createJob,
        updateProp,
      }}
      {...props}
    />
  );
}

function useProposal() {
  const context = React.useContext(ProposalContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}

export { ProposalProvider, useProposal };
