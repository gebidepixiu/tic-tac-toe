import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './homeReducer';
const store = configureStore({ reducer: { homeReducer } });
export default store;
