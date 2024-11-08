// newsReducer.js
import { GET_NEWS } from './actionTypes';

const initialNewsState = {
  news: [],
};

const newsReducer = (state = initialNewsState, action) => {
  switch (action.type) {
    case GET_NEWS:
      return { ...state, news: action.payload };
    default:
      return state; 
  }
};

export default newsReducer;
