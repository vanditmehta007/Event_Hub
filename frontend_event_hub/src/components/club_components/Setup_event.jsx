import React from 'react'
import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom'
import EventRegiFormCreator from './EventRegiFormCreator';
import { UserContext } from '../../context/UserContext';
// Removed PaperPlaneAnimation import

function DateForm() {
  const [selectedDate, setSelectedDate] = useState('');
}


const Setup_event = () => {
  const navigate = useNavigate();
  const { user: club, loading } = useContext(UserContext);
  const [edata, seteData] = useState({
    ename: '',
    eclub_name: '',
    ecid: '',
    edate: '',
    evenue: '',
    etype: '',
    eprmsg: '',
    // Removed duplicate eprmsg key
  });

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isEventCreated, setIsEventCreated] = useState(false);
  // Removed showAnimation state
  const [allVenues, setAllVenues] = useState([]);
  const [bookedVenues, setBookedVenues] = useState([]);
  // const [availableVenues, setAvailableVenues] = useState([]); // Removed
  const [loadingVenues, setLoadingVenues] = useState(false);

  const [file, setFile] = useState(null);

  // Fetch venues when date changes
  useEffect(() => {
    const fetchVenues = async () => {
      if (!edata.edate) {
        setAllVenues([]);
        setBookedVenues([]);
        return;
      }

      try {
        setLoadingVenues(true);
        // Clear selected venue if date changes, as availability might change
        seteData(prev => ({ ...prev, evenue: '' }));

        const res = await axios.post('/venues/available', { date: edata.edate });

        if (res.data.success) {
          setAllVenues(res.data.allVenues);
          setBookedVenues(res.data.bookedVenues);
        } else {
          toast.error("Failed to fetch venues");
        }
      } catch (err) {
        console.error("Error fetching venues:", err);
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();
  }, [edata.edate]);

  useEffect(() => {
    if (club && club.role === 'club') {
      seteData(prevData => ({
        ...prevData,
        eclub_name: club.cname,
        ecid: club.cid
      }));
    }
  }, [club]);

  const setupevent = async (e) => {
    e.preventDefault();

    if (!edata.evenue) {
      toast.error('Please select a venue.');
      return;
    }
    if (!edata.etype) {
      toast.error('Please select an event type.');
      return;
    }

    if (!file) {
      toast.error('Please upload an event image.');
      return;
    }
    const formData = new FormData();
    formData.append('eimage', file);
    formData.append('ename', edata.ename);
    formData.append('eclub_name', edata.eclub_name);
    formData.append('ecid', edata.ecid);
    formData.append('edate', edata.edate);
    formData.append('evenue', edata.evenue);
    formData.append('etype', edata.etype);
    formData.append('eprmsg', edata.eprmsg);

    try {
      const { data: responseData } = await axios.post('/createevent', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (responseData.error) {
        toast.error(responseData.error)
      }
      else {
        setIsEventCreated(true);
        setFile(null);
        toast.success('Event Created !')
      }
    } catch (error) {
      console.log('Event Creation Error:', error);
      toast.error(error.response?.data?.error || "Event creation failed");
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!club || club.role !== 'club') {
    return <div>You must be logged in as a club to view this page.</div>
  }

  const RadioInput = ({ label, value, checked, onChange }) => (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="radio"
        name="event_type"
        value={value}
        checked={checked}
        onChange={onChange}
        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
      />
      {label}
    </label>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header / Dropdown Toggle */}
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
      >
        <span className="font-semibold text-gray-700">
          {isFormOpen ? 'Cancel/Collapse Event Creation' : 'Create New Event'}
        </span>
        <span className={`transform transition-transform duration-200 ${isFormOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Content */}
      <div className={`transition-all duration-300 overflow-hidden ${isFormOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>

        {/* --- Main Event Setup Form --- */}
        <form onSubmit={setupevent} className="flex flex-col gap-4 pt-4">

          {/* Event Name */}
          <div>
            <label htmlFor="ename" className="block text-sm font-medium text-gray-700">Event Name</label>
            <input type='text' id="ename" placeholder='e.g., TechNova Hackathon' value={edata.ename}
              onChange={(e) => seteData({ ...edata, ename: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>

          {/* Autofilled Fields (Read Only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="eclub_name" className="block text-sm font-medium text-gray-700">Club Name</label>
              <input type='text' id="eclub_name" value={edata.eclub_name}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed" readOnly />
            </div>
            <div>
              <label htmlFor="ecid" className="block text-sm font-medium text-gray-700">Club ID</label>
              <input type='text' id="ecid" value={edata.ecid}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed" readOnly />
            </div>
          </div>

          {/* Date and Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor='date' className="block text-sm font-medium text-gray-700">Date</label>
              <input type='date' id='date' value={edata.edate}
                onChange={(e) => seteData({ ...edata, edate: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Venue ({edata.edate ? (loadingVenues ? 'Checking availability...' : 'Classroom Availability') : 'Please select a date first'})</label>

            {!edata.edate ? (
              <div className="p-4 bg-gray-100 rounded-lg text-gray-500 text-sm text-center border border-gray-200">
                Select an event date to see available venues.
              </div>
            ) : loadingVenues ? (
              <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-sm italic text-center">Loading...</div>
            ) : allVenues.length === 0 ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
                No venues found.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {allVenues.map((venue) => {
                  const isBooked = bookedVenues.includes(venue);
                  return (
                    <button
                      key={venue}
                      type="button"
                      disabled={isBooked}
                      onClick={() => !isBooked && seteData({ ...edata, evenue: venue })}
                      className={`px-2 py-2 text-xs font-semibold rounded-md border transition-all duration-200
                                      ${isBooked
                          ? 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed opacity-70'
                          : edata.evenue === venue
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                                  `}
                      title={isBooked ? "Venue unavailable" : "Available"}
                    >
                      {venue}
                    </button>
                  );
                })}
              </div>
            )}
            {/* Hidden input to ensure HTML5 validation if needed, or handle validation manually in onSubmit */}
            {/* Hidden input removed to fix validation sticking issue */}
          </div>


          {/* Event Type (Radio Buttons) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <div className="flex items-center gap-4 pt-1">
              <RadioInput label="Hackathon" value="Hackathon" checked={edata.etype === 'Hackathon'} onChange={(e) => seteData({ ...edata, etype: e.target.value })} />
              <RadioInput label="Seminar" value="Seminar" checked={edata.etype === 'Seminar'} onChange={(e) => seteData({ ...edata, etype: e.target.value })} />
              <RadioInput label="Carnival" value="Carnival" checked={edata.etype === 'Carnival'} onChange={(e) => seteData({ ...edata, etype: e.target.value })} />
              <RadioInput label="Interview" value="Interview" checked={edata.etype === 'Interview'} onChange={(e) => seteData({ ...edata, etype: e.target.value })} />
            </div>
          </div>

          {/* PR Message */}
          <div>
            <label htmlFor="eprmsg" className="block text-sm font-medium text-gray-700">PR Message</label>
            <textarea id="eprmsg" placeholder='A short, catchy description for the event' value={edata.eprmsg}
              onChange={(e) => seteData({ ...edata, eprmsg: e.target.value })}
              rows="3"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* File Input */}
          <div>
            <label htmlFor="eimage" className="block text-sm font-medium text-gray-700">Event Image</label>
            <input type='file' id="eimage" accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100" required />
          </div>

          {/* Submit Button */}
          <button type='submit'
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50"
          >
            Create Event
          </button>
        </form>

        {/* --- Divider --- */}
        <hr className="my-4 border-gray-200" />

        {/* --- Event Form Creator Section --- */}
        {
          isEventCreated && (
            <div className='animate-fadeIn'>
              <h3 className="text-lg font-semibold text-gray-800">Create Registration Form</h3>
              <p className="text-sm text-gray-600 mb-4">Select the fields you want users to fill out for ` {edata.ename} `.</p>
              <EventRegiFormCreator
                event_name={edata.ename}
              // club_name={edata.eclub_name}
              // club_id={edata.ecid}
              />
            </div>
          )
        }
      </div >
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div >
  );
}

export default Setup_event;