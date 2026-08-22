import { getToken, removeToken, removeAdmin } from '../utils/storage';

export const isAuthenticated = () => {
  const token = getToken();
  return Boolean(token);
};

export const logout = () => {
  removeToken();
  removeAdmin();
};
