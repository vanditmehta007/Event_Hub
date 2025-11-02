import React, { useState, useEffect, useRef } from "react";
import User_event_regform from "./user_components/User_event_regform";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'; 


const EventsCard = ({ event }) => {

  const [isVisible, setVisible] = useState(false);
  const formButton = () => {
    setVisible(!isVisible);
  };

 
  const imageUrl = event.eimage || 'https://images.unsplash.com/photo-1618762627958-3561b3b3a3aa?q=80&w=1974';

  return (
    <div className="flex-row w-11/12 md:w-[500px] p-0 font-[poppins] relative m-8 mx-auto w-[30%] overflow-hidden bg-cyan-800 p-2
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
          
          <button onClick={formButton} className="text-blue-600 font-semibold mt-2">
            {isVisible ? 'Close Form' : 'Register'}
          </button>
          
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/events'); 
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); 

  if (loading) {
    return <div className="text-white p-4">Loading events...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex overflow-x-auto snap-x snap-mandatory py-4 scrollbar-hide"
      style={{ scrollPadding: '19px 20rem' }}
    >
      <div className="flex-shrink-0 w-4"></div>

    
      {events.map((eventItem) => (

        <EventsCard key={eventItem._id} event={eventItem} />
      ))}
      <div className="h-24 bg-stone-50"></div>
    </div>
  );
}