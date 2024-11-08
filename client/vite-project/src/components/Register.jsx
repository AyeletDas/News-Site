import React, { useState } from 'react';
import axios from 'axios';

const Register = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }

        try {
            const response = await axios.post('https://news-site-csxz.onrender.com/users/register', {
                email,
                password,
                first_name: firstName,
                last_name: lastName
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setSuccessMessage(response.data.message);
            // אפשר להוסיף כאן לוגיקה נוספת, כמו ניווט לדף הבית או הצגת הודעה נוספת
        } catch (err) {
            setError(err.response?.data?.error || 'אירעה שגיאה בעת ההרשמה');
        }
    };
    const handleRegister = async (userData) => { 
        // כאן תרשום את הלוגיקה להרשמה שלך Make
        // לדוגמה:
        await registerUser(userData);
      
        // שליחה ל-Zapier או Make
        await fetch('https://hook.eu2.make.com/gneljt4ugnetapsoyzjbksrxzrqgij3l', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userData.email }),
        });
      };
      
    return (
        <div className="w-full">
            <h2 className="text-3xl font-bold mb-6 text-right text-gray-800">הרשמה</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 text-xs italic mb-4">{successMessage}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">אימייל</label>
                    <input
                        type="email"
                        placeholder="הכנס אימייל"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">סיסמה</label>
                    <input
                        type="password"
                        placeholder="הכנס סיסמה"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">אשר סיסמה</label>
                    <input
                        type="password"
                        placeholder="אשר סיסמה"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">שם פרטי</label>
                    <input
                        type="text"
                        placeholder="הכנס שם פרטי"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-right">שם משפחה</label>
                    <input
                        type="text"
                        placeholder="הכנס שם משפחה"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                >
                    הירשם
                </button>
            </form>
        </div>
    );
};

export default Register;
