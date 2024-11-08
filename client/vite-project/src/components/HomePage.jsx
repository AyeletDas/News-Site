import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Newspaper, Search, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import debounce from 'lodash.debounce';
import '../index.css';
import ArticleCard from './ArticleCard';

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [savedArticles, setSavedArticles] = useState([]);

    // State for active category (defaults to 'homePage')
    const [activeCategory, setActiveCategory] = useState('homePage');
    // State to store all articles across all categories
    const [allArticles, setAllArticles] = useState([]);
    // State to store articles per category
    const [categoryArticles, setCategoryArticles] = useState({});
    // State for storing the latest article
    const [latestArticle, setLatestArticle] = useState(null);
    // State for search term entered by user
    const [searchTerm, setSearchTerm] = useState('');
    // State for filtered articles (based on search or category)
    const [filteredArticles, setFilteredArticles] = useState([]);
    // State for managing the logged-in username from localStorage
    const [username, setUsername] = useState(localStorage.getItem('username') || '');
    // State to store fetched articles
    const [articles, setArticles] = useState([]);
    // State to track whether the user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Categories object with key-value pairs for category names
    const categories = {
        homePage: 'דף הבית',
        sports: 'ספורט',
        realestate: 'נדל"ן',
        health: 'בריאות',
        economy: 'כלכלה',
        tourism: 'תיירות',
        cooking: 'אוכל',
        cars: 'רכב',
        fashion: 'אופנה'
    };


    // Effect hook to handle login state and save username to localStorage
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlUsername = params.get('username');

        if (urlUsername && urlUsername !== username) {
            setUsername(urlUsername);
            localStorage.setItem('username', urlUsername);
        }

        // Check if the user is logged in
        const loggedInUser = localStorage.getItem('username');
        setIsLoggedIn(!!loggedInUser);
    }, [location, username]);

    // Function to fetch all articles for each category
    const fetchAllArticles = useCallback(async () => {
        try {
            const articlesData = {};
            let allArticlesTemp = [];

            for (const category of Object.keys(categories)) {
                if (category !== 'homePage') {
                    const response = await axios.get(`http://localhost:8000/articles?category=${category}&limit=10`);
                    console.log(`Response data for category ${category}:`, response.data);

                    const filteredData = filterArticlesByDate(Array.isArray(response.data) ? response.data : Object.values(response.data));
                    articlesData[category] = filteredData;
                    allArticlesTemp = [...allArticlesTemp, ...filteredData];
                }
            }

            setAllArticles(allArticlesTemp);
            setCategoryArticles(articlesData);
            allArticlesTemp.sort((a, b) => new Date(b.published) - new Date(a.published));
            setLatestArticle(allArticlesTemp[0]);
            setFilteredArticles(allArticlesTemp);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    }, []);

    // Function to handle click on 'Liked Articles' button
    const handleLikedArticlesClick = () => {
        if (isLoggedIn) {
            navigate('/Favorites'); // Navigate to the 'Favorites' page if the user is logged in
        } else {
            // Show alert if the user is not logged in
            alert('רק משתמש רשום יכול להיכנס');
        }
    };
    // Function to filter out articles based on today's date
    const filterArticlesByDate = (articles) => {
        console.log("Filtering articles:", articles);

        // אם מדובר באובייקט, המירו אותו למערך
        if (typeof articles === 'object' && !Array.isArray(articles)) {
            articles = Object.values(articles);
        }

        // אם עדיין לא מדובר במערך, החזר מערך ריק
        if (!Array.isArray(articles)) {
            console.error("Expected articles to be an array, but got:", articles);
            return [];
        }

        const today = new Date();
        return articles.filter(article => new Date(article.published) <= today);
    };



    // Effect hook to fetch all articles and set a refresh interval of 5 minutes
    useEffect(() => {
        fetchAllArticles();
        const interval = setInterval(fetchAllArticles, 300000); // Refresh every 5 minutes
        return () => clearInterval(interval);
    }, [fetchAllArticles]);

    // Search handler with debounce to optimize search performance
    const handleSearch = useCallback(
        debounce(() => {
            const articlesToSearch = activeCategory === 'homePage' ? allArticles : categoryArticles[activeCategory] || [];
            const results = searchTerm.trim() === ''
                ? articlesToSearch
                : articlesToSearch.filter(article =>
                    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            setFilteredArticles(results);
        }, 300),
        [searchTerm, activeCategory, allArticles, categoryArticles]
    );

    // Effect hook to trigger search when the search term or category changes
    useEffect(() => {
        handleSearch();
    }, [searchTerm, activeCategory, handleSearch]);

    // Function to navigate to login page with the username parameter
    const handleLoginClick = () => {
        navigate(`/login?username=${username}`);
    };

    // Function to handle category change and navigate to the correct URL
    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setSearchTerm('');
        navigate(`/${category}?username=${encodeURIComponent(username)}`);
    };

    // Effect hook to handle changes in URL and set the active category
    useEffect(() => {
        const path = location.pathname.slice(1);
        if (path === '') {
            setActiveCategory('homePage');
        } else if (Object.keys(categories).includes(path)) {
            setActiveCategory(path);
        } else {
            setActiveCategory('homePage');
        }
    }, [location]);

    const saveArticle = (article) => {
        setSavedArticles((prevSavedArticles) => [...prevSavedArticles, article]);
    };
    return (
        <nav>
            <div className="rtl text-black min-h-screen" dir="rtl">
                <header className="border-b border-gray-900">
                </header>
                <div
                    className="bg-cover bg-center flex flex-col justify-between relative"
                    style={{
                        backgroundImage: "url('/bg.jpg')",
                        height: "80vh",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div style={{ gap: '10px' }} className="flex space-x-4">{/* הוספת class ליצירת רווח בין הכפתורים */}
                            <button
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-3 rounded"
                                onClick={handleLoginClick}
                            >
                                התחברות בקליק
                            </button>
                            <button
                                className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded flex items-center ${isLoggedIn ? '' : 'opacity-50 cursor-not-allowed'}`}
                                onClick={handleLikedArticlesClick} // This will always trigger the click handler, even if the user is not logged in
                            >
                                כתבות אהובות <Heart size={16} className="mr-1" />
                            </button>

                        </div>

                        <div className="flex-grow flex items-center justify-end" style={{ marginLeft: '10px' }}>
                            <input
                                type="text"
                                placeholder="חיפוש חדשות מהיר"
                                className="px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-r-md"
                                onClick={handleSearch}
                            >
                                <Search size={16} className="inline-block" />
                            </button>
                        </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-16 flex justify-start items-center z-20">
                        <a href="/" >
                            <img src="/Logo.png" alt="Logo" />
                        </a>
                    </div>
                    <nav className="flex justify-center space-x-4 mb-8">
                        {Object.entries(categories).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => handleCategoryChange(key)}
                                className={`px-4 py-2 rounded ml-4 ${activeCategory === key
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-gray-600 hover:bg-gray-500' // https://tailwindcss.com/docs/background-color
                                    }`}
                            >
                                {value}
                            </button>
                        ))}
                    </nav>
                </div>
                <main className="container mx-auto p-4">
                    {activeCategory === 'homePage' && !searchTerm && (
                        <>
                            <br />
                            <h2 className="text-3xl font-bold mb-4 text-center">הכתבה הכי חדשה מכל הקטגוריות</h2>
                            {latestArticle && (
                                <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-8">
                                    <div className="md:flex">
                                        <div className="md:flex-shrink-0">
                                            {latestArticle.image ? (
                                                <img
                                                    className="h-48 w-full object-cover md:w-48"
                                                    src={latestArticle.image}
                                                    alt={latestArticle.title}
                                                />
                                            ) : (
                                                <div className="h-48 w-full md:w-48 bg-gray-700 flex items-center justify-center">
                                                    <Newspaper size={80} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8">
                                            <div className="uppercase tracking-wide text-sm text-yellow-500 font-semibold">
                                                {categories[latestArticle.category]}
                                            </div>
                                            <a href={latestArticle.link} className="block mt-1 text-lg leading-tight font-medium text-black hover:underline">
                                                {latestArticle.title}
                                            </a>
                                            <p className="mt-2 text-gray-300">
                                                {latestArticle.description ? latestArticle.description.substring(0, 200) + '...' : ''}
                                            </p>
                                            <div className="mt-2 text-sm text-gray-400">

                                                <span>
                                                    {new Date(latestArticle.published).toLocaleString('he-IL')}</span>

                                                {isLoggedIn && <ArticleCard article={latestArticle} />}  {/* שמור♥- יופיע רק אם משתמש מחובר*/}

                                            </div>


                                            <a
                                                href={latestArticle.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded text-sm"
                                            >
                                                לקריאה נוספת
                                            </a>

                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {(activeCategory !== 'homePage' || searchTerm) && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">
                                {searchTerm ? `תוצאות חיפוש עבור: ${searchTerm}` : categories[activeCategory]}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredArticles.map((article, index) => (
                                    <div key={index} className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                                        <div className="h-40 w-full bg-gray-700 flex items-center justify-center">
                                            {article.image ? (
                                                <img
                                                    className="h-40 w-full object-cover"
                                                    src={article.image}
                                                    alt={article.title}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <Newspaper size={60} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <a href={article.link} className="block mt-1 text-lg leading-tight font-medium text-white hover:underline">
                                                {article.title}
                                            </a>
                                            <p className="mt-2 text-gray-300">
                                                {article.description ? article.description.substring(0, 100) + '...' : ''}
                                            </p>
                                            <div className="mt-2 text-sm text-gray-400 flex items-center space-x-2">
                                                <span>{new Date(article.published).toLocaleString('he-IL')}</span>
                                                {/* שמור♥- יופיע רק אם משתמש מחובר*/}
                                                {isLoggedIn && (
                                                    <span className="flex items-center">
                                                        <ArticleCard article={article} /> {/* ♥ בדף קטגוריות -שמור*/}
                                                    </span>
                                                )}
                                            </div>


                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeCategory === 'homePage' && !searchTerm && (
                        Object.entries(categories).map(([categoryKey, categoryName]) => {
                            if (categoryKey !== 'homePage') {
                                return (
                                    <div key={categoryKey} className="mb-8">
                                        <h2 className="text-2xl font-bold mb-4">{categoryName}</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                                            {categoryArticles[categoryKey]?.slice(0, 4).map((article, index) => (
                                                <div key={index} className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                                                    <div className="h-40 w-full bg-gray-700 flex items-center justify-center">
                                                        {article.image ? (
                                                            <img
                                                                className="h-40 w-full object-cover"
                                                                src={article.image}
                                                                alt={article.title}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center">
                                                                <Newspaper size={60} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        <a href={article.link} className="block mt-1 text-lg leading-tight font-medium text-white hover:underline">
                                                            {article.title}
                                                        </a>
                                                        <p className="mt-2 text-gray-300">
                                                            {article.description ? article.description.substring(0, 100) + '...' : ''}
                                                        </p>
                                                        <div className="mt-2 text-sm text-gray-400 flex flex-row space-x-2">
                                                            <span>{new Date(article.published).toLocaleString('he-IL')}</span>
                                                            {isLoggedIn && <ArticleCard article={article} />}  {/* שמור♥- יופיע רק אם משתמש מחובר*/}

                                                        </div>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })
                    )}
                </main>
                <footer className="bg-gray-800 text-white text-center py-4">
                    {/* קוד מתוקן 26/9 - הוספת שם מפתח ושנה נוכחית */}
                    <p lang="he" dir="rtl" className="text-center"> האתר פותח ע"י אילת דסקל © {new Date().getFullYear()}</p>
                </footer>
            </div>
        </nav>
    );
};

export default HomePage;