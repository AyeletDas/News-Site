import React from 'react'; // JSX = (JavaScript XML) = HTML inside JavaScript - Dynamic interfaces
import ReactDOM from 'react-dom/client'; // start the application. update them according to changes in *state* or *properties*.
import App from './App'; // App.jsx
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // Navigation management
import { Provider } from 'react-redux'; // Wraps the application and provides the store for all child components
import store from './redux/store'; // import store from -store.js


ReactDOM.createRoot(document.getElementById('root')).render( //The place where it will "plant" inside the HTML file.
  <Provider store={store}> {/* Provides the store for all components */}
    <BrowserRouter> {/* Navigation management */}
      <App />
    </BrowserRouter>
  </Provider>
);

// React :
// $ npm create vite@latest
// $  cd vite-project
// $  npm install
// $  npm run dev
// $ npm i react -router-dom

// Packages :
// $ npm install axios lucide-react react-router-dom lodash.debounce reducers redux shadcn-ui @shadcn/ui react-beautiful-dnd@latest
// $ npm install -D @vitejs/plugin-react @shadcn/ui - התקנת פלאגינים לפיתוח 

// Design :
// $ npm install -D tailwindcss postcss autoprefixer
// $ npx tailwindcss init -p
// $ npm i react-beautiful-dnd - עיצוב כתבות


// $ npm list react- בדיקת גרסה

// $ npm run dev 

// העלאה לשרת גלובלי
// npm run build --> hostinger--> Website--> website--> empty PHP/HTML website --> Dashboard --> File manager --> public_html --> Upload -->dist--> Upload--> app.py + requirements.txt -->


