import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthText';

export function useAuth() {
  const value = useContext(AuthContext);

  return value;
};
