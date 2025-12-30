import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const UserMemberships = () => {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMemberships = async () => {
            try {
                const res = await axios.get('/user/memberships');
                if (res.data.success) {
                    setMemberships(res.data.memberships);
                } else {
                    console.error("Failed to fetch memberships:", res.data.error);
                }
            } catch (err) {
                console.error("Error fetching memberships:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMemberships();
    }, []);

    const handleSwitchToClub = async (clubDbId) => {
        try {
            const res = await axios.post('/user/switch-to-club', { target_club_id: clubDbId });
            if (res.data.success) {
                localStorage.setItem('club', JSON.stringify({
                    id: res.data.club.id,
                    cname: res.data.club.cname,
                    cid: res.data.club.cid,
                    role: 'club'
                }));
                // We need to refresh the page or update context to switch views
                // Navigating to club dashboard should trigger the context update or protect route check
                // However, App.jsx or Context usually fetches /profile on load.
                // Let's force a reload for now to ensure clean state switch, or just navigate.
                window.location.href = '/clubdash';
            } else {
                toast.error(res.data.error || "Failed to switch");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error switching profile");
        }
    };

    if (loading) return <div className="text-gray-500 text-sm">Loading memberships...</div>;

    if (memberships.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">You are not a member of any club yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {memberships.map((membership) => (
                <div key={membership._id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div>
                        <h3 className="font-semibold text-gray-800">{membership.cname}</h3>
                        <p className="text-sm text-gray-500">{membership.cdepartment}</p>
                        <p className="text-xs text-blue-500 mt-1">Status: Active Member</p>
                    </div>
                    <button
                        onClick={() => handleSwitchToClub(membership.club_id)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                        Switch to Club View
                    </button>
                </div>
            ))}
        </div>
    );
};

export default UserMemberships;
