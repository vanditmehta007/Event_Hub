import React from 'react';
import User_registered_events from '../../components/user_components/User_registered_events';
import Interview_tracker from '../../components/user_components/Interview_tracker';
import User_Notification from '../../components/user_components/User_Notification';
import UserMemberships from '../../components/user_components/UserMemberships';

// A reusable Card component for the dashboard
const DashboardCard = ({ title, children, bgColor = 'bg-white' }) => {
  return (
    <div className={`${bgColor} p-6 rounded-xl shadow-lg h-full`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-200/50">{title}</h2>
      <div className="text-gray-600">
        {children}
      </div>
    </div>
  );
};

const User_dashboard = () => {
  return (
    // Main container with padding and a max-width
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">User Dashboard</h1>

        {/* Responsive grid layout for the dashboard widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <DashboardCard title="Notifications">
            <User_Notification />
          </DashboardCard>

          {/* You can highlight a specific card if you want */}
          <DashboardCard title="Your Registered Events" bgColor="bg-white">
            <User_registered_events />
          </DashboardCard>

          <DashboardCard title="Booked Interview Tracker">
            <Interview_tracker />
          </DashboardCard>

          <DashboardCard title="My Club Memberships">
            <UserMemberships />
          </DashboardCard>

        </div>
      </div>
    </div>
  );
};

export default User_dashboard;