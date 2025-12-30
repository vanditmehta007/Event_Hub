import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ClubMembersManager = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', sapid: '', phone: '', department: ''
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/club/members');
            if (res.data.success) {
                setMembers(res.data.members);
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/club/members', formData);
            if (res.data.success) {
                toast.success(res.data.message);
                setMembers([...members, res.data.member]);
                setFormData({ name: '', email: '', sapid: '', phone: '', department: '' });
                setShowAddForm(false);
            } else {
                toast.error(res.data.error);
            }
        } catch (error) {
            toast.error("Failed to add member");
        }
    };

    const handleRemoveMember = async (id) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            const res = await api.delete(`/club/members/${id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                setMembers(members.filter(m => m._id !== id));
            } else {
                toast.error(res.data.error);
            }
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    if (loading) return <div className="p-4 text-center">Loading members...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Committee ({members.length})</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                >
                    {showAddForm ? 'Cancel' : '+ Add Member'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddMember} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3 border">
                    <input className="w-full p-2 border rounded" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <input className="w-full p-2 border rounded" placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-2">
                        <input className="w-full p-2 border rounded" placeholder="SAP ID" value={formData.sapid} onChange={e => setFormData({ ...formData, sapid: e.target.value })} required />
                        <input className="w-full p-2 border rounded" placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <select className="w-full p-2 border rounded" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required>
                        <option value="">Select Department</option>
                        <option value="COMPS">COMPS</option>
                        <option value="IT">IT</option>
                        <option value="AIDS">AIDS</option>
                        <option value="EXTC">EXTC</option>
                        <option value="MECH">MECH</option>
                        <option value="CHEM">CHEM</option>
                    </select>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition border-none cursor-pointer">Add Member</button>
                </form>
            )}

            <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {members.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No members added yet.</p>
                ) : (
                    members.map(member => (
                        <div key={member._id} className="flex justify-between items-center p-3 bg-white border rounded group hover:shadow-sm">
                            <div>
                                <p className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    {member.name}
                                    {member.status === 'pending' && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-200">
                                            Pending
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">{member.department} | {member.sapid}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveMember(member._id)}
                                className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Remove Member"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClubMembersManager;
