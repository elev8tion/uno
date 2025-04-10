export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setUserId = (userId: string): void => {
  localStorage.setItem('userId', userId);
};

export const getUserId = (): string | null => {
  return localStorage.getItem('userId');
}; 