// store.js

import { legacy_createStore as createStore } from 'redux';
import rootReducer from './rootReducer';

const store = createStore(rootReducer); // Create the store with the reducer

export default store;


