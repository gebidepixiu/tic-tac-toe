import React from 'react';
import './App.css';
import Home from './view/home';
/**
 * 主入口
 * */
class App extends React.Component {
    render () {
        return (
            <div className="App">
                <Home/>
            </div>
        );
    }
}

export default App;
