// In User_event_regform.jsx
import React from 'react'
import Event_RegiForm from '../club_components/Event_RegiForm'
// 1. DO NOT import or use useParams

// 2. Accept { event_name } as a prop
const User_event_regform = ({ event_name }) => {
  return (
    <div className='text-stone-900 '>
      Congrats !!  enjoy !!.
      Fill out this form for {event_name}.
      {/* 3. Pass the prop down */}
      <Event_RegiForm event_name={event_name} /> 
    </div>
  )
}

export default User_event_regform