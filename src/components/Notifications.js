import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { MdNotifications } from 'react-icons/md';
import { fetchCommunications } from '../store/communicationsSlice';
import './Notifications.css';

const NotificationSection = ({ title, communications, type }) => (
  <div className="notification-section">
    <div className="section-header">
      <h3>{title}</h3>
    </div>
    <div className="notification-list">
      {communications.map((comm) => (
        <div key={comm.id} className="notification-item">
          <div className="company-info">
            <div className="company-name">{comm.companyName}</div>
            <div className="communication-method">{comm.method}</div>
          </div>
          <div className="due-date">
            {type === 'due-today' ? 'Today' : format(new Date(comm.dueDate), 'MMM dd, yyyy')}
          </div>
          <div className="priority">{comm.priority}</div>
          <div>
            <span className={`status-badge ${type}`}>
              {type === 'overdue' ? 'Overdue' : 'Due Today'}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { overdueCommunications, todayCommunications, loading, error } = useSelector(
    state => state.communications
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchCommunications()).unwrap();
      } catch (err) {
        console.error('Error fetching communications:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [dispatch]);

  // Add error handling for development
  useEffect(() => {
    if (error && process.env.NODE_ENV === 'development') {
      console.error('Notifications error:', error);
    }
  }, [error]);

  const totalNotifications = overdueCommunications.length + todayCommunications.length;

  // Show a more user-friendly error message
  if (error) {
    return (
      <div className="notifications-container">
        <div className="notification-icon" onClick={() => setIsOpen(!isOpen)}>
          <MdNotifications size={20} />
        </div>
        {isOpen && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h2>Notifications</h2>
              <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
            </div>
            <div className="error-state">
              <p>Unable to load notifications</p>
              <button 
                className="retry-button"
                onClick={() => dispatch(fetchCommunications())}
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notification-icon" onClick={() => setIsOpen(!isOpen)}>
        <MdNotifications size={20} />
        {totalNotifications > 0 && (
          <span className="notification-badge">{totalNotifications}</span>
        )}
      </div>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h2>Notifications ({totalNotifications})</h2>
            <button className="close-button" onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="notifications-content">
            {loading && (
              <div className="loading-state">
                <p>Loading notifications...</p>
              </div>
            )}

            {error && (
              <div className="error-state">
                <p>Error loading notifications: {error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {overdueCommunications.length > 0 && (
                  <NotificationSection 
                    title="Overdue Communications" 
                    communications={overdueCommunications}
                    type="overdue"
                  />
                )}

                {todayCommunications.length > 0 && (
                  <NotificationSection 
                    title="Due Today" 
                    communications={todayCommunications}
                    type="due-today"
                  />
                )}

                {totalNotifications === 0 && (
                  <div className="empty-state">
                    <p>No pending communications</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 