import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function EventRegiFormCreator({ event_name }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [formEventName, setFormEventName] = useState(event_name || '');
  const navigate = useNavigate(); 

  const handleOptionChange = (event) => {
    const value = event.target.value;
    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== value));
    } else {
      setSelectedOptions([...selectedOptions, value]);
    }
  };

  const createform = async (e) => {
    e.preventDefault();
    console.log('form created.');

    try {
      if (!formEventName.trim()) {
        toast.error('Event name is required');
        return;
      }
      if (selectedOptions.length === 0) {
        toast.error('Please select at least one field for the form');
        return;
      }

      const { data: responseData } = await axios.post('/createeventform', { 
        selectedOptions, 
        event_name: formEventName.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (responseData.error) {
        toast.error(responseData.error);
        console.log(responseData.error);
        
      } else {
     
        setSelectedOptions([]); 
        toast.success('Event Form Created !');
        navigate('/clubdash'); 
      }
    } catch (error) {
      console.log("Error in form creation: ", error.response || error);
      if (error.response?.status === 400) {
        toast.error(error.response.data?.error || 'Invalid form data');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found');
      } else {
        toast.error('Form creation failed. Please try again.');
      }
    }
  }

return (
  <div className="mt-4 border-t border-gray-200 pt-4">
    
    <div className="mb-4">
      <label htmlFor="event_name" className="block text-sm font-medium text-gray-700">Event Name</label>
      <input
        type="text"
        id="event_name"
        value={formEventName}
        onChange={(e) => setFormEventName(e.target.value)}
        placeholder="Enter event name"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        required
      />
    </div>

    {/* Form Section */}
    <form onSubmit={createform} className="flex flex-col gap-4">
      
      {/* Checkbox Group */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Select Fields for Registration Form:</label>
        
        {/* Using a grid for better alignment on slightly larger screens */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              value="name_tf"
              checked={selectedOptions.includes('name_tf')}
              onChange={handleOptionChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            Name
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              value="sapid_tf"
              checked={selectedOptions.includes('sapid_tf')}
              onChange={handleOptionChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            SAP ID
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              value="email_tf"
              checked={selectedOptions.includes('email_tf')}
              onChange={handleOptionChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              value="phone_tf"
              checked={selectedOptions.includes('phone_tf')}
              onChange={handleOptionChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            Phone Number
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              value="department_tf"
              checked={selectedOptions.includes('department_tf')}
              onChange={handleOptionChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            Department
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              value="about_yourself_tf"
              checked={selectedOptions.includes('about_yourself_tf')}
              onChange={handleOptionChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            About Yourself
          </label>
        </div>
      </div>

      {/* Display selected options (optional) */}
      <p className="text-xs text-gray-500">Selected fields: {selectedOptions.join(', ')}</p>

      {/* Submit Button */}
      <button type='submit'
        className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50"
      >
        Create Form
      </button>
    </form>
  </div>
);
}

export default EventRegiFormCreator;