import { MainContext } from '../provider/MainProvider';
import { useContext } from 'react';

export const useMain = () => {
  const context = useContext(MainContext);
  if (context === undefined) {
    throw new Error('useMain() must be used within an MainProvider');
  }
  return context;
};
