import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Event_updates = () => {
  const [updateText, setUpdateText] = useState('');
  const [currentUpdate, setCurrentUpdate] = useState({ _id: '', update_text: 'No Updates' });
  const [loading, setLoading] = useState(true);

  // Fetch current update when component mounts
  useEffect(() => {
    fetchCurrentUpdate();
  }, []);

  const fetchCurrentUpdate = async () => {
    try {
      const { data } = await axios.get('/club-update');
      if (data.success) {
        setCurrentUpdate(data.update);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error fetching update:', error);
      toast.error('Failed to fetch update');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) {
      toast.error('Please enter update text');
      return;
    }

    try {
      const { data } = await axios.post('/club-update', { update_text: updateText });
      if (data.success) {
        toast.success('Update posted successfully');
        setUpdateText('');
        fetchCurrentUpdate();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error posting update:', error);
      toast.error('Failed to post update');
    }
  };

  const handleDelete = async () => {
    if (!currentUpdate._id) return;

    try {
      const { data } = await axios.delete(`/club-update/${currentUpdate._id}`);
      if (data.success) {
        toast.success('Update deleted successfully');
        setCurrentUpdate({ _id: '', update_text: 'No Updates' });
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error deleting update:', error);
      toast.error('Failed to delete update');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Event Updates</h2>
      
      {/* Current Update Display */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Current Update</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-gray-800">{currentUpdate.update_text}</p>
          {currentUpdate._id && (
            <button
              onClick={handleDelete}
              className="mt-2 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:underline"
            >
              Delete Update
            </button>
          )}
        </div>
      </div>

      {/* New Update Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="update" className="block text-sm font-medium text-gray-700 mb-1">
            New Update
          </label>
          <textarea
            id="update"
            rows="3"
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your update here..."
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Post Update
        </button>
      </form>
    </div>
  );
};

export default Event_updates;
