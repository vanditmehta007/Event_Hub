import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function EventRegiFormCreator({ event_name }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [formEventName, setFormEventName] = useState(event_name || '');
  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState({ label: '', type: 'text', name: '', required: false });
  const navigate = useNavigate();

  const addCustomField = () => {
    if (!newField.label || !newField.name) {
      toast.error('Label and Name (identifier) are required');
      return;
    }
    // Simple validation for name to be mostly alphanumeric
    if (!/^[a-zA-Z0-9_]+$/.test(newField.name)) {
      toast.error('Field identifier (name) must be alphanumeric (e.g. twitter_handle)');
      return;
    }

    setCustomFields([...customFields, newField]);
    setNewField({ label: '', type: 'text', name: '', required: false });
  };

  const removeCustomField = (index) => {
    const updated = [...customFields];
    updated.splice(index, 1);
    setCustomFields(updated);
  };

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
        event_name: formEventName.trim(),
        custom_fields: customFields
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

        {/* Custom Fields Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700">Custom Fields</h4>

          {/* List of added custom fields */}
          {customFields.length > 0 && (
            <div className="space-y-2">
              {customFields.map((field, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                  <div>
                    <span className="font-semibold text-sm">{field.label}</span>
                    <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                    {field.required && <span className="text-xs text-red-500 ml-2">*Required</span>}
                  </div>
                  <button type="button" onClick={() => removeCustomField(idx)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                </div>
              ))}
            </div>
          )}

          {/* Add new field inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-blue-50 rounded border border-blue-100">
            <input
              type="text" placeholder="Label (e.g. GitHub Link)"
              value={newField.label}
              onChange={e => setNewField({ ...newField, label: e.target.value })}
              className="p-2 border rounded text-sm"
            />
            <input
              type="text" placeholder="Identifier (e.g. github_link)"
              value={newField.name}
              onChange={e => setNewField({ ...newField, name: e.target.value })}
              className="p-2 border rounded text-sm"
            />
            <select
              value={newField.type}
              onChange={e => setNewField({ ...newField, type: e.target.value })}
              className="p-2 border rounded text-sm"
            >
              <option value="text">Text Input</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="date">Date</option>
              <option value="textarea">Long Text</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={e => setNewField({ ...newField, required: e.target.checked })}
              />
              <label className="text-sm">Required?</label>
            </div>
            <button type="button" onClick={addCustomField} className="col-span-1 md:col-span-2 mt-2 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700">
              Add Custom Field
            </button>
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