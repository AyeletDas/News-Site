import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername); // עדכון ה-state לפי localStorage
  }, [location]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('username'); // מחיקת ה-username בעת סגירת הדף
      localStorage.removeItem('token'); // מחיקת ה-token גם
      localStorage.removeItem('userId'); // מחיקת ה-userId גם
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('username'); // מחיקת ה-username מ-localStorage
    localStorage.removeItem('token'); // מחיקת ה-token
    localStorage.removeItem('userId'); // מחיקת ה-userId
    setUsername(''); // עדכון ה-state של username
    navigate('/login'); // ניווט לדף הלוגין ללא פרמטרים
  };

  return (
    <nav className="border-b border-gray-900">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          <Link to="/home"></Link>
        </div>
        <div className="flex items-right justify-end space-x-2">
          {!username && (
            <div className="flex items-center space-x-2">
              <p>התחבר כדי לראות אופציות נוספות ולשמור כתבות שאהבת</p>
              <div className="arrow"></div>
            </div>
          )}
          {username && <p className="mr-4">! טוב לראות אותך ,{username} שלום</p>}
          {username && (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              התנתק
            </button>
          )}
        </div>
        <style>
          {`
            .arrow {
              width: 0;
              height: 0;
              border-left: 10px solid transparent;
              border-right: 10px solid transparent;
              border-top: 20px solid darkblue; /* החץ מופנה כלפי מטה */
              position: relative; /* מאפשר מיקום הקו */
              animation: bounceDown 1s infinite;
            }

            .arrow::before {
              content: '';
              position: absolute;
              top: -30px; /* גובה הקו לפני החץ */
              left: -1px;
              width: 2px;
              height: 30px; /* אורך הקו */
              background-color: darkblue; /* צבע הקו */
            }

            @keyframes bounceDown {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(10px); /* זז למטה */
              }
            }
          `}
        </style>
      </div>
    </nav>
  );
};

export default Navbar;
