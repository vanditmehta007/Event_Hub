import React, { useEffect, useState } from "react";

import axios from 'axios'; 

const Event_RegiForm = ({ event_name }) => {
  const [formConfig, setFormConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
console.log(event_name);

  useEffect(() => {
    if (!event_name) {
      setLoading(false);
      setError("No event specified.");
      return;
    }
    const fetchFormConfig = async () => {
      try {

        const res = await axios.get(`/event-form/${event_name}`); 
        
        console.log("Response:", res.data); // Debug log

        if (res.data && res.data.success) {
          setFormConfig(res.data);
          setError(null); // Clear any previous errors
        } else {
          setError(res.data.error || "Failed to load form config.");
        }
      } catch (err) {
        console.error("Error fetching form:", err.response || err);
        setError(err.response?.data?.error || "Failed to load form configuration.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormConfig();
  }, [event_name]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const res = await axios.post(`/userregevent`, {
        ...formData, 
        event_name: event_name 
      }); 
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Error submitting form.");
    }
  };


  if (loading) return <p>Loading form...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!formConfig || !formConfig.selectedFields) return <p>No form configuration found.</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Register for {formConfig.event_name}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {formConfig.selectedFields.includes('name_tf') && (
          <input
            type="text" name="name" placeholder="Name"
            onChange={handleChange} className="border p-2 rounded" required
          />
        )}
        {formConfig.selectedFields.includes('sapid_tf') && (
          <input
            type="text" name="sapid" placeholder="SAP ID"
            onChange={handleChange} className="border p-2 rounded" required
          />
        )}
        {formConfig.selectedFields.includes('email_tf') && (
          <input
            type="email" name="email" placeholder="Email"
            onChange={handleChange} className="border p-2 rounded" required
          />
        )}
        {formConfig.selectedFields.includes('phone_tf') && (
          <input
            type="tel" name="phone" placeholder="Phone"
            onChange={handleChange} className="border p-2 rounded" required
          />
        )}

        {formConfig.selectedFields.includes('department_tf') && (
          <input
            type="text" name="department" placeholder="Department"
            onChange={handleChange} className="border p-2 rounded" required
          />
        )}
        {formConfig.selectedFields.includes('about_yourself_tf') && (
          <textarea
            name="about_yourself" placeholder="About Yourself"
            onChange={handleChange} className="border p-2 rounded"
            rows="3" required
          />
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Event_RegiForm;