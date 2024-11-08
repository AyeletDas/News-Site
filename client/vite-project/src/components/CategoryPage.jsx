import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import ArticleCard from './ArticleCard'; // Adjust the path as necessary

const CategoryPage = () => {
    const { categoryName } = useParams();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const username = params.get('username') || '';

    // Function to fetch articles from the backend API
    const fetchArticles = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/articles?category=${categoryName}&limit=10&username=${username}`
            );
            const uniqueArticles = response.data.filter(
                (value, index, self) => index === self.findIndex((t) => t.id === value.id)
            );
            setArticles(uniqueArticles);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [categoryName, username]);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('username');
        setIsLoggedIn(!!loggedInUser); // Update login state based on the stored username
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>{categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Articles - {username}</h1>

            {articles.length === 0 ? (
                <p>No articles found in this category.</p>
            ) : (
                <div className="articles-container">
                    {articles.map((article) => (
                        <div key={article.id || article._id}>
                            {isLoggedIn && <ArticleCard article={article} />} {/* שמור♥- יופיע רק אם משתמש מחובר */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
