import { useState } from 'react';
import { readStore, writeStore, removeStore } from '../utils/storage';

const LOGIN_USERNAME = 'Bolona1969';
const LOGIN_PASSWORD = 'Pedro2026';

const ADMIN_USER = {
  id: 'admin',
  username: LOGIN_USERNAME,
  name: 'Admin',
  role: 'admin',
};

export function useAuth() {
  const [user, setUser] = useState(() => readStore('user', null));

  const login = (username, password) => {
    if (
      username === LOGIN_USERNAME &&
      password === LOGIN_PASSWORD
    ) {
      writeStore('user', ADMIN_USER);
      setUser(ADMIN_USER);
      return true;
    }

    return false;
  };

  const logout = () => {
    removeStore('user');
    setUser(null);
  };

  return {
    user,
    login,
    logout,
  };
}