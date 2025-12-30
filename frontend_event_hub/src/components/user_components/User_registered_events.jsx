import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const User_registered_events = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await api.get('/user/registrations');
        if (res.data.success) {
          setRegistrations(res.data.registrations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading events...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered: {registrations.length}</span>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven't registered for any events yet.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {registrations.map(reg => (
            <div key={reg._id} className="bg-white p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{reg.event_name}</h3>
                {reg.eventDetails && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {reg.eventDetails.etype}
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600">
                {reg.eventDetails ? (
                  <>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(reg.eventDetails.edate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {reg.eventDetails.evenue}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      {reg.eventDetails.eclub_name}
                    </div>
                  </>
                ) : (
                  <p className="italic text-gray-400">Event details unavailable</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default User_registered_events;
