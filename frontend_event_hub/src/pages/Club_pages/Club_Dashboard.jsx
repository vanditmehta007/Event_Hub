import React from 'react';
import Event_Register_counter from '../../components/club_components/Event_Register_counter';
import Event_updates from '../../components/club_components/Event_updates';
import Events_info from '../../components/club_components/Events_info';
import Setup_event from '../../components/club_components/Setup_event';
import Venue_booking from '../../components/club_components/venue_booking';

// A reusable Card component for the dashboard
const DashboardCard = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="text-gray-600">
        {children}
      </div>
    </div>
  );
};

const Club_Dashboard = () => {
  return (
 
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Club Dashboard</h1>
        
       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
       <div className="lg:col-span-2 flex flex-col gap-8">
            <DashboardCard title="Create an Event">
              <Setup_event />
            </DashboardCard>

            <DashboardCard title="Venue Booking">
              <Venue_booking />
            </DashboardCard>
          </div>

          {/* Sidebar area */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <DashboardCard title="Event Registrations">
              <Event_Register_counter />
            </DashboardCard>
            
            <DashboardCard title="Event Information">
              <Events_info />
            </DashboardCard>

            <DashboardCard title="Updates">
              <Event_updates />
            </DashboardCard>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Club_Dashboard;