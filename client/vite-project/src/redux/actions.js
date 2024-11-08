// actions.js
import { GET_NEWS, ADD_FAVORITE, REMOVE_FAVORITE, SET_FAVORITES } from './actionTypes';

const getNews = (news) => ({
  type: GET_NEWS,
  payload: news,
});

const addFavorite = (article) => ({
  type: ADD_FAVORITE,
  payload: article,
});

const removeFavorite = (articleId) => ({
  type: REMOVE_FAVORITE,
  payload: articleId,
});

const setFavorites = (favorites) => ({
  type: SET_FAVORITES,
  payload: favorites,
});

export { getNews, addFavorite, removeFavorite, setFavorites };
