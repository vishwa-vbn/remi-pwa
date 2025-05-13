import { applyMiddleware, createStore, compose } from 'redux';
import {thunk} from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './rootReducer';

// Enable Redux DevTools extension in development
const composeEnhancers =
  (typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

// Middleware setup
const middlewares = [thunk];

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['alert'], // Example reducer to ignore
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create Redux store
export const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(...middlewares))
);

// Accessors
export const getState = () => store.getState();
export const getStore = () => store;

// Configure and export persistor
export const configureStore = () => {
  const persistor = persistStore(store);

  // Hot Module Replacement (HMR) for reducers (ESM-friendly way)
  if (import.meta.hot) {
    import.meta.hot.accept('./rootReducer', async () => {
      const { rootReducer: nextRootReducer } = await import('./rootReducer');
      store.replaceReducer(persistReducer(persistConfig, nextRootReducer));
    });
  }

  return { store, persistor };
};