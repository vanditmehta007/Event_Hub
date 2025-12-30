import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const InternalClubUpdates = () => {
    const [updateText, setUpdateText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendUpdate = async (e) => {
        e.preventDefault();
        if (!updateText.trim()) return;

        setLoading(true);
        try {
            const res = await api.post('/club/internal-updates', { update_text: updateText });
            if (res.data.success) {
                toast.success(res.data.message);
                setUpdateText('');
            } else {
                toast.error(res.data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send update");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                Send updates securely via email to all registered committee members.
            </p>
            <form onSubmit={handleSendUpdate} className="space-y-3">
                <textarea
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
                    rows="4"
                    placeholder="Type your internal update here..."
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                >
                    {loading ? 'Sending...' : 'Send to Committee'}
                </button>
            </form>
        </div>
    );
};

export default InternalClubUpdates;
