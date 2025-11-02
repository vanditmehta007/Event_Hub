import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    
    const fetchUser = async () => {
      try {
     
        const { data } = await axios.get('/profile');
        if (data) {
          setUser(data); 
        }
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false); 
      }
    };
    
    fetchUser();
  }, []); 

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}