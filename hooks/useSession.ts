import { AuthContext } from '../components/provider/AuthProvider';
import { useContext } from 'react';

export const useSession = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession() must be used within an AuthProvider');
  }
  return context;
};
