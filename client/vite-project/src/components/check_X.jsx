import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ArticleCard({ article, onSaveArticle, onRemoveArticle }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [notification, setNotification] = useState('');
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId'); // נוסיף שמירה של ID המשתמש

    // בדיקת סטטוס מועדפים בטעינת הקומפוננטה
    useEffect(() => {
        checkIfFavorite();
    }, [article.id]); // נוסיף תלות ב-article.id

    const checkIfFavorite = async () => {
        const token = localStorage.getItem('token');
        if (!token || !userId) return;

        try {
            // שימוש בנתיב החדש שיצרנו בשרת לבדיקת כתבה ספציפית
            const response = await axios.get(
                `http://localhost:5000/users/${userId}/favorites/${article.id || article._id}`,
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

    const handleFavoriteClick = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login.');
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                // במקרה שהכתבה כבר במועדפים, לא נוסיף שוב ונציג הודעה
                setNotification('הכתבה כבר קיימת במועדפים');
                setTimeout(() => setNotification(''), 3000);
                return; // יוצאים מהפונקציה ולא מבצעים שום פעולה
            } else {
                // הוספת כתבה למועדפים
                const response = await axios.put(
                    `http://localhost:5000/users/favorites/${article.id || article._id}`,
                    { article },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 201) {
                    setIsFavorite(true);
                    setNotification('הכתבה נוספה למועדפים');
                    if (onSaveArticle) {
                        onSaveArticle(article);
                    }
                }
                // נעלים את ההודעה אחרי 3 שניות
                setTimeout(() => setNotification(''), 3000);
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
            setNotification('הייתה שגיאה בעדכון הסטטוס');
            setTimeout(() => setNotification(''), 3000);
        }
    };

    return (
        <div className="article-card">
            <p>{article.summary}</p>
            <button 
                onClick={handleFavoriteClick} 
                className={`mt-2 ${isFavorite ? 'text-red-500 bg-gray-200' : 'text-gray-500'}`}
            >
                {isFavorite ? '❤️ הכתבה כבר במועדפים' : '🤍 הוסף למועדפים'}
            </button>
            {notification && (
                <div className="text-sm text-red-500 mt-2 notification-fade">
                    {notification}
                </div>
            )}
        </div>
    );
}

export default ArticleCard;
