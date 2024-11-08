// rootReducer.js

import { combineReducers } from 'redux';
import newsReducer from './newsReducer';
import { favoritesReducer } from './favoritesReducer';

const rootReducer = combineReducers({
  news: newsReducer,
  favorites: favoritesReducer,
});

export default rootReducer;
