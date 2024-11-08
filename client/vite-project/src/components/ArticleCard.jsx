import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

// Main ArticleCard component - now without duplicate date display
const ArticleCard = ({ article, onSaveArticle, onRemoveArticle }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [notification, setNotification] = useState('');
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    // Check favorite status on component mount
    useEffect(() => {
        checkIfFavorite();
    }, [article.id]);

    // Function to verify if article is in favorites
    const checkIfFavorite = async () => {
        const token = localStorage.getItem('token');
        if (!token || !userId) return;

        try {
            const response = await axios.get(
                `http://localhost:8000/users/${userId}/favorites/${article.id || article._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setIsFavorite(response.data.isFavorite);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    // Handle favorite toggle functionality
    const handleFavoriteClick = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login.');
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                const response = await axios.delete(
                    `http://localhost:8000/users/${userId}/favorites/${article.id || article._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                if (response.status === 200) {
                    setIsFavorite(false);
                    setNotification('הכתבה הוסרה מהמועדפים');
                    if (onRemoveArticle) {
                        onRemoveArticle(article);
                    }
                    setTimeout(() => setNotification(''), 3000);
                }
            } else {
                const response = await axios.put(
                    `http://localhost:8000/users/favorites/${article.id || article._id}`,
                    { article },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 200 && response.data.message === "Article already in favorites") {
                    setNotification('הכתבה כבר קיימת במועדפים');
                    setIsFavorite(true);
                } else if (response.status === 201) {
                    setIsFavorite(true);
                    setNotification('הכתבה נוספה למועדפים');
                    if (onSaveArticle) {
                        onSaveArticle(article);
                    }
                }
                setTimeout(() => setNotification(''), 3000);
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
            setNotification('הכתבה כבר קיימת במועדפים');
            setTimeout(() => setNotification(''), 3000);
        }
    };

    // Render only the favorites button without date
    return (
        <button 
            onClick={handleFavoriteClick}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors duration-300 ${
                isFavorite 
                    ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
        >
            <Heart 
                size={16} 
                className={`${isFavorite ? 'fill-current' : ''}`}
            />
            <span className="text-sm mr-1">
                {isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            </span>

            {/* Notification */}
            {notification && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                    {notification}
                </div>
            )}
        </button>
    );
};

export default ArticleCard;