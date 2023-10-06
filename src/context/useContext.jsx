import React from 'react';
import { useAuth } from './authContext';

const UserContext = React.createContext(false);

function UserProvider(props) {
  const user = useAuth();
  console.log("useAuth :::::::::", user);
  return <UserContext.Provider value={user} {...props} />;
}

function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export { UserProvider, useUser };