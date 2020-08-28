import React, { Component } from "react";

import "./App.css";
//import NavigationTabs from "./Pages/NavigationTabs.js";
import Home from "./Pages/HomePage.js";
//import Rtest from "./Rtest";
// import NavTest from "./Pages/NavTest";


class App extends Component {
  render() {
    return (
      <div>
        {/*<NavigationTabs />*/}
        <Home/>
      </div>
    );
  }
}
export default App;