import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {

    // Initialize navigation hook
    const navigate = useNavigate();

    // Function to handle navigation back to home page
    const handleBackToHome = () => {
        navigate('/');
    };

    // Function to handle successful login
    const handleLoginSuccess = (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
    };

    // Render the component
    return (
        <div className="relative min-h-screen">
            {/* Back to Home button */}
            <button
                className="absolute top-4 right-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={handleBackToHome}
            >
                חזרה לעמוד הראשי
            </button>

            {/* Main content container */}
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-6xl p-8">
                    {/* Flex container for Register and Login components */}
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Register component */}
                        <div className="w-full md:w-3/5">
                        <Register  />
                        </div>
                        {/* Login component */}
                        <div className="w-full md:w-3/5">
                            <Login onLoginSuccess={handleLoginSuccess} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;