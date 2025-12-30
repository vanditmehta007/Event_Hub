import React, { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from '../context/UserContext';
import User_event_regform from "./user_components/User_event_regform";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';


const EventsCard = ({ event, isRegistered }) => {

  const [isVisible, setVisible] = useState(false);
  const formButton = () => {
    setVisible(!isVisible);
  };


  const imageUrl = event.eimage || 'https://images.unsplash.com/photo-1618762627958-3561b3b3a3aa?q=80&w=1974';

  return (
    <div className="flex-row w-11/12 md:w-[400px] p-0 font-[poppins] relative mx-[3px] my-4 w-[24%] overflow-hidden bg-cyan-800 p-2
    text-white
    before:absolute before:right-0 before:top-0 before:block before:h-0
    before:w-0 before:border-b-[16px] before:border-r-[16px] before:border-solid
    before:border-b-white before:border-r-cyan-500 before:bg-[#658E15]
    before:content-[''] 
    before:shadow-[0_1px_1px_rgba(0,0,0,0.3),-1px_1px_1px_rgba(0,0,0,0.2)]">
      <div className="bg-stone-50 shadow-2xl border border-stone-200/80 h-full overflow-hidden ">
        <div
          className="w-full h-90 bg-cover bg-center shadow-md"
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
        <div className="text-left p-4">

          <h3 className="text-1xl font-semibold text-stone-900">{event.ename}</h3>
          <p className="text-sm text-gray-700">{event.eclub_name}</p>
          <p className="text-xs text-gray-500">Date: {event.edate} | Venue: {event.evenue}</p>
          <p className="text-sm text-gray-600 mt-2">{event.eprmsg}</p>

          {isRegistered ? (
            <button disabled className="text-green-600 font-bold mt-2 cursor-default">
              ✅ Registered
            </button>
          ) : (
            <button onClick={formButton} className="text-blue-600 font-semibold mt-2">
              {isVisible ? 'Close Form' : 'Register'}
            </button>
          )}

          {
            isVisible ? <User_event_regform event_name={event.ename} /> : null
          }
        </div>
      </div>
    </div>
  );
}



export default function Event_Carousel() {

  const [events, setEvents] = useState([]);
  const [registeredEventNames, setRegisteredEventNames] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const registeredScrollRef = useRef(null);
  const eventsScrollRef = useRef(null);
  const interviewsScrollRef = useRef(null);


  useEffect(() => {
    const fetchEventsAndRegistrations = async () => {
      try {
        setLoading(true);
        const [eventsRes, registrationsRes] = await Promise.all([
          axios.get('/events'),
          user ? axios.get('/user/registrations') : Promise.resolve({ data: { success: false } })
        ]);

        setEvents(eventsRes.data);

        if (registrationsRes.data.success) {
          const regNames = new Set(registrationsRes.data.registrations.map(r => r.event_name));
          setRegisteredEventNames(regNames);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndRegistrations();
  }, [user]);

  // Filter events
  // Filter events
  const userRegisteredEvents = events.filter(e => registeredEventNames.has(e.ename));
  const interviews = events.filter(e => e.etype === 'Interview');
  const standardEvents = events.filter(e => e.etype !== 'Interview');

  if (loading) {
    return <div className="text-white p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Registered Events Carousel (Only if user has registered events) */}
      {userRegisteredEvents.length > 0 && (
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold ml-8 text-white mb-2 bg-black/30 p-2 rounded-lg w-fit backdrop-blur-sm shadow-md">Your Registered Events</h2>
          <div
            ref={registeredScrollRef}
            className="flex items-start overflow-x-auto snap-x snap-mandatory py-4 scrollbar-hide"
            style={{ scrollPadding: '19px 20rem' }}
          >
            <div className="flex-shrink-0 w-4"></div>
            {userRegisteredEvents.map((eventItem) => (
              <EventsCard key={`reg-${eventItem._id}`} event={eventItem} isRegistered={true} />
            ))}
            <div className="h-24 bg-transparent w-8"></div>
          </div>
        </div>
      )}

      {/* Standard Events Carousel */}
      {standardEvents.length > 0 && (
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold ml-8 text-white mb-2 bg-black/30 p-2 rounded-lg w-fit backdrop-blur-sm shadow-md">Upcoming Events</h2>
          <div
            ref={eventsScrollRef}
            className="flex items-start overflow-x-auto snap-x snap-mandatory py-4 scrollbar-hide"
            style={{ scrollPadding: '19px 20rem' }}
          >
            <div className="flex-shrink-0 w-4"></div>
            {standardEvents.map((eventItem) => (
              <EventsCard
                key={eventItem._id}
                event={eventItem}
                isRegistered={registeredEventNames.has(eventItem.ename)}
              />
            ))}
            <div className="h-24 bg-stone-50"></div>
          </div>
        </div>
      )}

      {/* Interviews Carousel */}
      {interviews.length > 0 && (
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold ml-8 text-white mb-2 bg-black/30 p-2 rounded-lg w-fit backdrop-blur-sm shadow-md">Upcoming Interviews</h2>
          <div
            ref={interviewsScrollRef}
            className="flex items-start overflow-x-auto snap-x snap-mandatory py-4 scrollbar-hide"
            style={{ scrollPadding: '19px 20rem' }}
          >
            <div className="flex-shrink-0 w-4"></div>
            {interviews.map((eventItem) => (
              <EventsCard
                key={eventItem._id}
                event={eventItem}
                isRegistered={registeredEventNames.has(eventItem.ename)}
              />
            ))}
            <div className="h-24 bg-stone-50"></div>
          </div>
        </div>
      )}
    </div>
  );
}