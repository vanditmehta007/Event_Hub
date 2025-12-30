import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import EventParticipantsViewer from './EventParticipantsViewer';

const ClubEventsStats = ({ refreshTrigger }) => {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('upcoming'); // upcoming, current, past
    const [loading, setLoading] = useState(true);
    const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, [refreshTrigger]);

    const fetchEvents = async () => {
        try {
            const res = await api.get('/club/events-stats');
            if (res.data.success) {
                setEvents(res.data.events);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEvents = events.filter(e => e.status === filter);

    const getStatusColor = (s) => {
        if (s === 'current') return 'text-green-600 bg-green-100';
        if (s === 'upcoming') return 'text-blue-600 bg-blue-100';
        return 'text-gray-600 bg-gray-100';
    };

    if (loading) return <div className="p-4 text-center">Loading events...</div>;

    return (
        <div className="space-y-4">
            <div className="flex space-x-2 border-b pb-2">
                {['upcoming', 'current', 'past'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)} ({events.filter(e => e.status === f).length})
                    </button>
                ))}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                {filteredEvents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No {filter} events.</p>
                ) : (
                    filteredEvents.map(event => (
                        <div key={event._id} className="border p-3 rounded-lg hover:shadow-md transition-shadow bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800">{event.ename}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                                    {event.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mt-3 border-t pt-2">
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-semibold">Date:</span> {new Date(event.edate).toLocaleDateString()}</p>
                                    <p><span className="font-semibold">Venue:</span> {event.evenue}</p>
                                    <p><span className="font-semibold">Registrations:</span> {event.registrationCount}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedEventForParticipants(event.ename)}
                                    className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-md text-sm hover:bg-cyan-100 transition-colors border border-cyan-200"
                                >
                                    View Participants
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedEventForParticipants && (
                <EventParticipantsViewer
                    eventName={selectedEventForParticipants}
                    onClose={() => setSelectedEventForParticipants(null)}
                />
            )}
        </div>
    );
};

export default ClubEventsStats;
