import React, { PureComponent,  } from 'react';
import styled from 'styled-components';
import { TextField, Radio, Typography } from '@equinor/eds-core-react';
import BridgeGraph from "./BridgeGraph.js";

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: min-width;
  padding: 0px;
  padding-bottom: 2rem;
  grid-gap: 2rem;
  position: relative;
  transition: all 0.36s;
  grid-template-columns: repeat(1, fit-content(100%));
`

const WrapperHeader = styled.div`
  padding-bottom: 2rem;
`

const UnstyledList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
`

const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  display: flex;
  grid-gap: 0px 100px;
`

export default class BridgeContainer extends PureComponent {
  constructor() {
    super();
    this.state = { 
      unit: "mD",
      mode: "PERMEABILITY",
      value: 500,
      bridgeValue: -1,
      bridgeMode: null,
      bridge: null,
      combinationMap: new Map(),
      sizeFractions: [],
      combinations: [],
      loadingSizeFractions: false,
      fetchedSizeFractions: false,
      loadingBridge: false,
      fetchedBridge: false
    };
    this.onChange = this.onChange.bind(this);
    this.onNewValue = this.onNewValue.bind(this);
    this.getSizeFractions = this.getSizeFractions.bind(this);
    this.getBridge = this.getBridge.bind(this);
    this.updateCombinations = this.updateCombinations.bind(this);
    this.getOption = this.getOption.bind(this);
    this.getValue = this.getValue.bind(this);
  }

  updateCombinations(combinationMap) {
    alert("Update combinations")
    this.setState({
      combinationMap: combinationMap
    })
  }

  getValue() {
    return this.state.value
  }

  getOption(){
    return this.state.mode
  }

  onChange(event) {
    switch (event.target.value) {
      case 'PERMEABILITY':
        this.setState({
          mode: 'PERMEABILITY',
          unit: 'mD'})
        break;
      case 'AVERAGE_PORESIZE':
          this.setState({
            mode: 'AVERAGE_PORESIZE',
            unit: 'microns'})
          break;

      case 'MAXIMUM_PORESIZE':
          this.setState({
            mode: 'MAXIMUM_PORESIZE',
            unit: 'microns'})
          break;
      default:
        return
    } 
    this.getBridge(this.state.value, event.target.value)
  }

  onNewValue(event) {
    var value = event.target.value
    //alert("New value: " + value)
    if (!value || isNaN(value)){
      this.setState({
        value: 0
      })
    } else {
      this.setState({
        value: value
      })
    }
    this.getBridge((isNaN(value)) ? 0 : event.target.value, this.state.mode)
  }

  getBridge(value, mode) {
    this.setState({
      loadingBridge: true,
      fetchedBridge: false
    })
    if (value !== 0){
      fetch('https://lcm-blend-backend-test.azurewebsites.net/api/BackendAPI', {
        method: 'POST',
        headers: {
        "Accept": "application/json",
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "request": "BRIDGE",
          "option": mode,
          "value": parseInt(value)
      })
      })
    .then(response => { 
      return response.json();
    })

    .then(responseData => {
      console.log(responseData); return responseData;})
    .then(data => {
      // Check if returned request is outdated
      if (value !== this.state.value) {
        this.setState({
          loadingBridge: false,
          fetchedBridge: true
        })
      } else {
        this.setState({
          bridgeValue: value,
          bridgeMode: mode,
          bridge: data.bridge,
          loadingBridge: false,
          fetchedBridge: true
        })
      }
      return data;
    })
    .catch(err => {
        console.log("fetch error" + err);
        if (value !== this.state.value) {
          this.setState({
            loadingBridge: false,
            fetchedBridge: true
          })
        }
        else {
          this.setState({
            bridge: null,
            loadingBridge: false,
            fetchedBridge: true
          })
        }
    });
    } else {
      this.setState({
        bridge: null,
        bridgeValue: 0,
        loadingBridge: false,
        fetchedBridge: true
      })
    }
  }

  getSizeFractions() {
    this.setState({
      loadingSizeFractions: true
    })
    fetch('https://lcm-blend-backend-test.azurewebsites.net/api/BackendAPI', {
        method: 'POST',
        headers: {
        "Accept": "application/json",
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "request": "SIZE_FRACTIONS"
            })
      })
    .then(response => { 
      return response.json();
    })
    .then(responseData => {
      console.log(responseData); return responseData;})
    .then(data => {
      this.setState({
        sizeFractions: data.size_fractions,
        loadingSizeFractions: false,
        fetchedSizeFractions: true
      })
      return data;
    })
    .catch(err => {
        console.log("fetch error" + err);
        this.setState({
          loadingSizeFractions: false,
          fetchedSizeFractions: true
        })
    });
  }

  render() {
    if (!this.state.fetchedSizeFractions && !this.state.loadingSizeFractions){
      this.getSizeFractions()
    } 
    if ((this.state.bridgeValue !== this.state.value || this.state.bridgeMode !== this.state.mode) && !this.state.loadingBridge) {
      this.getBridge(this.state.value, this.state.mode)
    }
    var bridgeAndCombinations = []
    if (this.state.bridge) {
      bridgeAndCombinations.push({name: "Bridge", cumulative: this.state.bridge})
    } 
    this.props.combinationMap.forEach((combination, key) => {
      if (combination.hasOwnProperty("cumulative")){
        bridgeAndCombinations.push({name: combination.name, cumulative: combination.cumulative})
      }
    })
    return (
      <Wrapper>
        <Grid>
          <div>
            <WrapperHeader>
              <Typography variant="h2">Bridging options</Typography>
            </WrapperHeader>
            <Wrapper>
              <legend>Bridging based on:</legend>
                <UnstyledList>
                  <li>
                    <Radio
                      label="Permeability"
                      name="group"
                      value="PERMEABILITY"
                      onChange={this.onChange}
                      checked={(this.state.mode === "PERMEABILITY") ? true : false}
                    />
                  </li>
                  <li>
                    <Radio
                      label="Average poresize"
                      name="group"
                      value="AVERAGE_PORESIZE"
                      onChange={this.onChange}
                      checked={(this.state.mode === "AVERAGE_PORESIZE") ? true : false}
                    />
                  </li>
                  <li>
                    <Radio
                      label="Maximum poresize"
                      name="group"
                      value="MAXIMUM_PORESIZE"
                      onChange={this.onChange}
                      checked={(this.state.mode === "MAXIMUM_PORESIZE") ? true : false}
                    />
                  </li>
                </UnstyledList>
                <legend>Enter value:</legend>
                <TextField
                  type="number"
                  id="textfield-number"
                  meta={this.state.unit}
                  value={(this.state.value === 0) ? "" : this.state.value}
                  onChange={this.onNewValue}
                />
            </Wrapper>
          </div>
            <BridgeGraph key="bridgeGraph" 
              fetchedBridge={this.state.fetchedBridge} 
              loadingBridge={this.state.loadingBridge} 
              bridgeAndCombinations={bridgeAndCombinations} 
              fetchedSizeFractions={this.state.fetchedSizeFractions} 
              sizeFractions={this.state.sizeFractions} 
          />
        </Grid>
      </Wrapper>
    );
  }
}