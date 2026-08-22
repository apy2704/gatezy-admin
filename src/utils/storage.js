const TOKEN_KEY = 'gatezy_token';
const ADMIN_KEY = 'gatezy_admin';

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const saveAdmin = (admin) => {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

export const getAdmin = () => {
  const data = localStorage.getItem(ADMIN_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const removeAdmin = () => {
  localStorage.removeItem(ADMIN_KEY);
};
