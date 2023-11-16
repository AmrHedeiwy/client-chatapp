import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export const useSession = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession() must be used within an AuthProvider');
  }
  return context;
};
