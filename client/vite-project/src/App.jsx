import React, { useState } from 'react';  // Import React for JSX and useState for managing component state
import { Route, Routes, useLocation } from 'react-router-dom';  // Import routing components and hook for location handling
import HomePage from './components/HomePage'; 
import Navbar from './components/Navbar';  
import AuthPage from './components/AuthPage';  
import Favorites from './components/Favorites';  

const App = () => {  // Main App component
    const location = useLocation();  // Get the current URL location
    const params = new URLSearchParams(location.search);  // Parse query parameters from the URL
    const username = params.get('username');  // Retrieve 'username' parameter from the query string

    const [savedArticles, setSavedArticles] = useState([]);  // Initialize an empty array
 // const [פונקציה לעדכון המצב ,הערך אותו משנים]

    const handleSaveArticle = (article) => {  // Function to add an article to the array
        if (!savedArticles.some(saved => saved.id === article.id)) {  // Check if the article is not already saved. savedArticles- הופך לנכון או לא נכון לפי הצורך
            setSavedArticles([...savedArticles, article]);  // Add the article to the saved articles array. ליצור מערך חדש שכולל את כל הפריטים הקיימים במערך
        }
    };

    return (
        <>
            <Navbar username={username} />  
            <Routes>  
                <Route path="/" element={<HomePage username={username} onSaveArticle={handleSaveArticle} />} />  
                <Route path="/login" element={<AuthPage username={username} />} />  
                <Route path="/:categoryName" element={<HomePage username={username} onSaveArticle={handleSaveArticle} />} /> 
                <Route path="/favorites" element={<Favorites savedArticles={savedArticles} />} />  
            </Routes>
        </>
    );
};

export default App;  // Export the App component for use in the main application
