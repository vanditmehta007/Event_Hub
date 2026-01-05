import React, { useState, useEffect, useContext } from 'react';
import Event_updates from '../../components/club_components/Event_updates';
import Setup_event from '../../components/club_components/Setup_event';
import ClubEventsStats from '../../components/club_components/ClubEventsStats';
import ClubMembersManager from '../../components/club_components/ClubMembersManager';
import InternalClubUpdates from '../../components/club_components/InternalClubUpdates';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserContext } from '../../context/UserContext';


const DashboardCard = ({ title, children, isLocked = false }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg ${isLocked ? 'opacity-50 pointer-events-none relative' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-xl">
          <span className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">Feature Locked</span>
        </div>
      )}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="text-gray-600">
        {children}
      </div>
    </div>
  );
};

const ApprovalStatusCard = ({ status, hoursRemaining, onResend, onRefresh }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [showSuccess, setShowSuccess] = useState(true);

  useEffect(() => {
    if (status === 'approved') {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'pending' && hoursRemaining > 0) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 60000);

      setTimeLeft(hoursRemaining * 60);
      return () => clearInterval(interval);
    }
  }, [status, hoursRemaining]);

  if (status === 'approved' && showSuccess) {
    return (
      <div className="bg-green-50 border-2 border-green-500 p-6 rounded-xl mb-6 animate-fadeOut">
        <div className="flex items-center gap-4">
          <div className="text-4xl">✅</div>
          <div>
            <h3 className="text-xl font-bold text-green-700">You have been approved!</h3>
            <p className="text-green-600">Your club registration is approved. All features are now unlocked.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-500 p-6 rounded-xl mb-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-yellow-700">Pending Admin Approval</h3>
            <p className="text-yellow-600 mb-3">Your registration is awaiting admin approval. Features are temporarily locked.</p>
            {hoursRemaining > 0 ? (
              <p className="text-sm text-yellow-600 font-semibold">
                ⏱️ Time remaining: <span className="text-lg">{Math.ceil(hoursRemaining)} hours</span>
              </p>
            ) : (
              <div>
                <p className="text-red-600 font-semibold mb-3">24-hour timer expired. Resend approval request to admin.</p>
                <div className="flex gap-4">
                  <button
                    onClick={onResend}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition"
                  >
                    Resend Approval Request
                  </button>
                  <button
                    onClick={onRefresh}
                    className="bg-white border border-yellow-500 text-yellow-600 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-50 transition"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            )}

            {hoursRemaining > 0 && (
              <div className="mt-4">
                <button
                  onClick={onRefresh}
                  className="bg-white border border-yellow-500 text-yellow-600 font-semibold py-2 px-4 rounded-lg hover:bg-yellow-50 transition text-sm flex items-center gap-2"
                >
                  🔄 Check Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const Club_Dashboard = () => {
  const { user, loading } = useContext(UserContext);
  const [approvalStatus, setApprovalStatus] = useState('pending');
  const [hoursRemaining, setHoursRemaining] = useState(24);
  const [isLoading, setIsLoading] = useState(true);
  const [clubId, setClubId] = useState(null);
  const [eventsRefreshTrigger, setEventsRefreshTrigger] = useState(0);

  const handleEventCreated = () => {
    setEventsRefreshTrigger(prev => prev + 1);
  };

  const fetchApprovalStatus = async () => {
    try {
      let clubIdToUse = clubId;

      if (!clubIdToUse) {
        const clubStr = localStorage.getItem('club');
        const club = clubStr ? JSON.parse(clubStr) : null;
        if (club?.id) {
          clubIdToUse = club.id;
        } else if (user?.id && user?.role === 'club') {
          clubIdToUse = user.id;
          // Sync to localStorage if missing
          const newClubData = {
            id: user.id,
            cname: user.cname,
            cid: user.cid
          };
          localStorage.setItem('club', JSON.stringify(newClubData));
        }
      }

      if (clubIdToUse) {
        setClubId(clubIdToUse);
        const response = await axios.post('/club/approval-status', {
          clubId: clubIdToUse
        });

        if (response.data.success) {
          const newStatus = response.data.club.registrationStatus;
          console.log("Fetched Approval Status:", newStatus);
          setApprovalStatus(newStatus);
          setHoursRemaining(response.data.club.hoursRemaining);

          // Update localStorage
          const clubStr = localStorage.getItem('club');
          if (clubStr) {
            const club = JSON.parse(clubStr);
            club.registrationStatus = newStatus;
            localStorage.setItem('club', JSON.stringify(club));
          }
        }
      } else {
        console.warn("No Club ID found to fetch status.");
      }
    } catch (error) {
      console.error('Error fetching approval status:', error);
      toast.error("Failed to check approval status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalStatus();
    const interval = setInterval(fetchApprovalStatus, 30000);
    return () => clearInterval(interval);
  }, [user, loading]);

  const handleResendApproval = async () => {
    try {
      const response = await axios.post('/club/resend-approval', {
        clubId: clubId
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setHoursRemaining(24);
        setApprovalStatus('pending');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend approval request');
    }
  };

  const isApproved = approvalStatus === 'approved';

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Club Dashboard</h1>

        {!isLoading && (
          <ApprovalStatusCard
            status={approvalStatus}
            hoursRemaining={hoursRemaining}
            onResend={handleResendApproval}
            onRefresh={fetchApprovalStatus}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 flex flex-col gap-8">
            <DashboardCard title="Create an Event" isLocked={!isApproved}>
              <Setup_event onEventCreated={handleEventCreated} />
            </DashboardCard>
          </div>


          <div className="lg:col-span-1 flex flex-col gap-6">
            <DashboardCard title="Events & Statistics" isLocked={!isApproved}>
              <ClubEventsStats refreshTrigger={eventsRefreshTrigger} />
            </DashboardCard>

            <DashboardCard title="Committee Members" isLocked={!isApproved}>
              <ClubMembersManager />
            </DashboardCard>

            <DashboardCard title="Internal Updates (Email)" isLocked={!isApproved}>
              <InternalClubUpdates />
            </DashboardCard>

            <DashboardCard title="Public Site Updates" isLocked={!isApproved}>
              <Event_updates />
            </DashboardCard>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Club_Dashboard;