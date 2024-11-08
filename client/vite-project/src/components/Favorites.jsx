import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, ShoppingCart, Trash2, ChevronUp, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`https://news-site-csxz.onrender.com/users/${userId}/favorites`);
        setFavorites(response.data.favorites || []);
      } catch (err) {
        console.error('Error checking favorite status:', err);
        setError(err.response?.data?.error || 'נכשל בהבאת המועדפים');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleDelete = async (articleId) => {
    try {
      const response = await axios.delete(`https://news-site-csxz.onrender.com/users/${userId}/favorites/${articleId}`);
      if (response.status === 200) {
        setFavorites(prevFavorites => prevFavorites.filter(article => article.id !== articleId));
        showNotification('הכתבה נמחקה בהצלחה מהמועדפים');
      }
    } catch (error) {
      console.error('שגיאה במחיקת הכתבה מהמועדפים:', error);
      showNotification('אירעה שגיאה במחיקת הכתבה מהמועדפים', 'error');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const updatedFavorites = Array.from(favorites);
    const [movedArticle] = updatedFavorites.splice(result.source.index, 1);
    updatedFavorites.splice(result.destination.index, 0, movedArticle);
    setFavorites(updatedFavorites);

    try {
      await axios.put(`https://news-site-csxz.onrender.com/users/${userId}/favorites/order`, {
        favorites: updatedFavorites.map(article => article.id)
      });
    } catch (error) {
      console.error('שגיאה בעדכון הסדר של הכתבות המועדפות:', error);
      showNotification('אירעה שגיאה בעדכון סדר הכתבות', 'error');
    }
  };

  const moveArticle = (index, direction) => {
    const updatedFavorites = Array.from(favorites);
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < updatedFavorites.length) {
      const [movedArticle] = updatedFavorites.splice(index, 1);
      updatedFavorites.splice(newIndex, 0, movedArticle);
      setFavorites(updatedFavorites);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen" dir="rtl">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert" dir="rtl">
      <strong className="font-bold">שגיאה: </strong>
      <span className="block sm:inline">{error}</span>
    </div>
  );

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={handleBackToHome}
        >
          חזרה לעמוד הראשי
        </button>
      </div>

      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded shadow-lg z-50 transition-transform duration-300 ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
        >
          <div className="flex items-center">
          <span>{notification.message}</span>
            {notification.type === 'success' ? (
              <CheckCircle2 className="mr-2 text-green-600" />
              
            ) : (
              <AlertCircle className="mr-2 text-red-600" />
            )}
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">הכתבות אהובות שלי
        <ShoppingCart className="inline-block mr-2" />
      </h1>
      {favorites.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="favoritesList">
            {(provided) => (
              <ul className="space-y-4" {...provided.droppableProps} ref={provided.innerRef}>
                {favorites.map((article, index) => (
                  <Draggable key={article.id} draggableId={article.id.toString()} index={index}>
                    {(provided) => (
                      <li
                        className="bg-white shadow-lg rounded-lg p-4 flex items-center justify-between transition-all hover:shadow-xl"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="flex items-center flex-1">
                          <img
                            className="h-24 w-24 object-cover rounded-md ml-6"
                            src={article.image}
                            alt={article.title}
                          />
                          <div className="flex-1">
                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="block mt-1 text-lg leading-tight font-medium text-black hover:underline mb-2">
                              {article.title}
                            </a>
                            <p className="text-gray-600 text-sm">{article.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center ml-4">
                          <button
                            className="text-blue-500 hover:text-blue-700 p-1"
                            onClick={() => moveArticle(index, -1)}
                            disabled={index === 0}
                          >
                            <ChevronUp size={20} />
                          </button>
                          <span className="text-gray-600 font-semibold my-1">{index + 1}</span>
                          <button
                            className="text-blue-500 hover:text-blue-700 p-1"
                            onClick={() => moveArticle(index, 1)}
                            disabled={index === favorites.length - 1}
                          >
                            <ChevronDown size={20} />
                          </button>
                        </div>
                        <div className="flex justify-center items-center">

                          <button
                            className="mx-auto text-red-500 hover:text-red-700 p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                            onClick={() => handleDelete(article.id)}
                            aria-label="מחיקת כתבה מהרשימה"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">סל המאמרים המועדפים שלך ריק.</p>
          <p className="text-gray-500 mt-2">הוסף מאמרים לרשימת המועדפים שלך כדי לראות אותם כאן.</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
