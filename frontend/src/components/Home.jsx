import React, { useState, useEffect } from 'react';
import api from '../api'; // Import your API helper

const Home = () => {
  const [userData, setUserData] = useState('Loading...');
  const [error, setError] = useState('');

  useEffect(() => {
    // This is a good place to fetch data for the dashboard
    const fetchData = async () => {
      try {
        // TODO: Create a protected route on the backend
        // (e.g., /api/users/me) that returns the user's data
        // and requires the JWT.
        
        // const response = await api.get('/users/me');
        // setUserData(response.data.username);
        
        // Placeholder:
        setUserData('test_user');

      } catch (err) {
        setError('Could not fetch user data.');
        console.error(err);
      }
    };

    fetchData();
  }, []); // The empty array means this runs once on mount

  return (
    <div className="p-4 rounded-lg bg-white shadow">
      <h2 className="text-2xl font-bold mb-4">Homepage</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p className="text-gray-700">
          Welcome, you are logged in as: <strong>{userData}</strong>
        </p>
      )}
      <p className="mt-4 text-gray-600">
        This is your protected dashboard.
      </p>
      {/* TODO: Build out your dashboard/homepage content here */}
    </div>
  );
};

export default Home;