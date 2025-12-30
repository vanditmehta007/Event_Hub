import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const User_Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.updates);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading notifications...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Total: {notifications.length}
        </span>
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You have 0 notifications.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {notifications.map((notif) => (
            <div key={notif._id} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-full">
                  {notif.club_name}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{notif.update_text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default User_Notification;
