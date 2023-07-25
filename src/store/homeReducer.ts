import { createSlice } from '@reduxjs/toolkit';
import { InLattice } from '../view/home/interface/home';
const initialState:{gameHitory:InLattice[]} = { gameHitory: [] };
const homeReducer = createSlice({
    name: 'useHomeGame',
    initialState,
    reducers: {
        setGameHitory: (state, action) => {
            state.gameHitory = action.payload;
        },
    },
});
export const { setGameHitory } = homeReducer.actions;
export default homeReducer.reducer;
