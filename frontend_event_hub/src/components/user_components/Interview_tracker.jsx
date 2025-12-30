import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Interview_tracker = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/user/registrations');
        if (res.data.success) {
          // Filter only interviews and valid data
          const interviewsOnly = res.data.registrations.filter(
            reg => reg.eventDetails && reg.eventDetails.etype === 'Interview'
          );
          setInterviews(interviewsOnly);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading tracker...</div>;

  const sortedInterviews = [...interviews].sort((a, b) => {
    const dateA = a.eventDetails ? new Date(a.eventDetails.edate) : new Date(0);
    const dateB = b.eventDetails ? new Date(b.eventDetails.edate) : new Date(0);
    return dateA - dateB;
  });

  return (
    <div className="mt-2 h-full">
      {sortedInterviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No events scheduled.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pt-2 pb-2">
          {sortedInterviews.map((interview) => {
            const event = interview.eventDetails;
            return (
              <div key={interview._id} className="ml-6 relative">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-[1.85rem] ring-4 ring-white border border-blue-200">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                </span>
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="flex items-center text-base font-semibold text-gray-800">
                    {interview.event_name}
                    {event && event.etype === 'Interview' && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ml-auto">Interview</span>
                    )}
                  </h3>
                  <time className="block mb-3 text-sm font-normal leading-none text-blue-500 mt-1">
                    {event ? new Date(event.edate).toLocaleDateString() : 'Date TBD'}
                  </time>

                  {event ? (
                    <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
                      <p className="flex items-start">
                        <span className="font-semibold w-16 text-xs uppercase text-gray-500 mt-0.5">Venue</span>
                        <span>{event.evenue}</span>
                      </p>
                      <p className="flex items-start">
                        <span className="font-semibold w-16 text-xs uppercase text-gray-500 mt-0.5">Club</span>
                        <span>{event.eclub_name}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Details loading...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Interview_tracker;
