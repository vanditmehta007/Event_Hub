import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EventParticipantsViewer = ({ eventName, onClose }) => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const res = await axios.get(`/club/event-registrations/${encodeURIComponent(eventName)}`);
                if (res.data.success) {
                    setRegistrations(res.data.registrations);
                } else {
                    toast.error(res.data.error || "Failed to fetch participants");
                }
            } catch (error) {
                console.error("Error fetching participants:", error);
                toast.error("Error loading data");
            } finally {
                setLoading(false);
            }
        };

        if (eventName) {
            fetchParticipants();
        }
    }, [eventName]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800">
                        Participants for <span className="text-blue-600">{eventName}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="text-center py-8">Loading participants...</div>
                    ) : registrations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No registrations found for this event.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SAP ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custom Responses</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {registrations.map((reg) => (
                                        <tr key={reg._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.sapid}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.phone || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {reg.custom_responses ? (
                                                    <ul className="list-disc pl-4">
                                                        {Object.entries(reg.custom_responses).map(([key, value]) => (
                                                            <li key={key}>
                                                                <span className="font-semibold text-xs text-gray-400 capitalize">{key.replace('_', ' ')}:</span> {String(value)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : '-'}
                                                {reg.about_yourself && (
                                                    <div className="mt-1">
                                                        <span className="font-semibold text-xs text-gray-400">About:</span> {reg.about_yourself}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
                    {/* <button
                        onClick={() => {
                            // Simple CSV export logic could be added here
                            toast('Export feature coming soon!', { icon: '🚧' });
                        }}
                        className="mr-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                        Export to CSV
                    </button> */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventParticipantsViewer;
