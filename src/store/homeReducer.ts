import { createSlice } from '@reduxjs/toolkit';
import { ILattice } from '../view/home/interface/home';
interface IGameHitory{
    latticeHitory:ILattice;
    startAI:boolean;
}
const initialState:{gameHitory: IGameHitory[]} = { gameHitory: [] };
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
