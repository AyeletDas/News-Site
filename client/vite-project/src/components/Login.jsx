import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/users/login', { email, password }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.user && response.data.token) {
        const { token, user } = response.data;

        // שמור את המידע ב-localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user._id); // הוסף את מזהה המשתמש
        localStorage.setItem('username', user.first_name);

        onLoginSuccess(user);
      } else {
        setError('User information or token is missing in the response');
        console.error('User information or token is missing in the response:', response.data);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred'); // שדרוג הודעת השגיאה
      console.error('Login error:', err);
    }
  };

  return (
    <div>
      <div className="max-w-md mx-auto text-right">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 text-right">
          <h2 className="text-3xl font-bold mb-6 text-right text-gray-800">התחברות</h2>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              אימייל
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
              id="email"
              type="email"
              placeholder="הכנס אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              סיסמה
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline text-right"
              id="password"
              type="password"
              placeholder="הכנס סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              התחבר
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
