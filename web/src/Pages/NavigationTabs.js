import React from 'react'
import { Tabs } from '@equinor/eds-core-react'
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from "./Main.tsx";
import Bridge from "./BridgePage.js";
import Blend from "./BlendPage.js";
import history from './history';
import Optimizer from "./OptimizerPage.js"


const { TabList, Tab, TabPanels, TabPanel } = Tabs
//const { BrowserRouter, Route, Link } = ReactRouterDOM


class NavigationTabs extends React.Component {
  
  constructor(props) {    
    super(props);    
    this.state = {     
                        activeTab: 0    }; 
    this.props = props; 
    this.handleChange = this.handleChange.bind(this);
    this.updateTab = this.updateTab.bind(this);
  }

  handleChange(index) {
    //alert(index)

    switch (index) {
      case 0:
        history.push('/');
        break;
      case 1:
          history.push('/bridge');
          break;
      case 2:
          history.push('/blend');
          break;
      case 3:
          history.push('/optimizer');
          break;
    }
    //this.setState({activeTab: index})
    this.setState({activeTab: index})
  }

  updateTab() {
    //var index
    var index = 0;
    switch (history.location.pathname) {
      case '/':
        index = 0
        break
      case '/bridge':
        index = 1
        break
      case '/blend':
        index = 2
        break
      case '/optimizer':
        index = 3
        break
    }
    if (index !== this.state.activeTab) {
      this.setState({activeTab: index})
    }

  }
  render() {
   
    return (
      <Router>

        <Route>
          {this.updateTab}
        </Route>

        <Tabs activeTab={this.state.activeTab} onChange={this.handleChange}>

        
      <TabList>
        <Tab>Home</Tab>
        <Tab>Bridge</Tab>
        <Tab>Blend</Tab>
        <Tab>Optimizer</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Home/>
        </TabPanel>
        <TabPanel>
          <Bridge/>
        </TabPanel>
        <TabPanel>
          <Blend/>
        </TabPanel>
        <TabPanel>
          <Optimizer/>
        </TabPanel>
      </TabPanels>
      
    </Tabs>
    

    </Router>

          
        
      
    );
  }
}

export default NavigationTabs;