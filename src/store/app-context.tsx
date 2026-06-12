import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserInfo, UserRole } from '@/types';
import { mockCurrentUser } from '@/data/users';

interface AppContextType {
  user: UserInfo;
  setUser: (user: UserInfo) => void;
  switchRole: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo>(mockCurrentUser);

  const switchRole = (role: UserRole) => {
    setUser(prev => ({
      ...prev,
      role
    }));
  };

  return (
    <AppContext.Provider value={{ user, setUser, switchRole }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
