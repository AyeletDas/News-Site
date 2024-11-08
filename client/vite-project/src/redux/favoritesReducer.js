// favoritesReducer.js
import { ADD_FAVORITE, REMOVE_FAVORITE, SET_FAVORITES, SET_ERROR } from './actionTypes';

const initialState = {
  favorites: [],
  loading: true,
  error: null,
};

export const favoritesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FAVORITES:
      return { ...state, favorites: action.payload, loading: false };
    case SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ADD_FAVORITE:
      return { ...state, favorites: [...state.favorites, action.payload] };
    case REMOVE_FAVORITE:
      return {
        ...state,
        favorites: state.favorites.filter((article) => article.id !== action.payload),
      };
    default:
      return state;
  }
};
