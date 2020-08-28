import React, {Component} from 'react';
import styled from 'styled-components';
import { TextField, Button } from '@equinor/eds-core-react';

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: min-width;
  padding: 0px;
  
  grid-gap: 2rem;
  position: relative;
  transition: all 0.36s;
  grid-template-columns: repeat(1, fit-content(100%));
`

class PillInput extends Component {
  constructor (props){
    super(props)
    this.state = {
      pillVolume: 10,
      pillDensity: 350,
      pillMass: 3500
    }
    this.calculateMass = this.calculateMass.bind(this)
    this.onChangeVolume = this.onChangeVolume.bind(this)
    this.onChangeDensity = this.onChangeDensity.bind(this)
    this.getPillMass = this.getPillMass.bind(this)
    this.onClickOptimize = this.onClickOptimize.bind(this)
  } 

  getPillMass() {
    return this.state.pillMass
  }

  calculateMass() {
    var pillV = document.getElementById('pillvolume');
    var pillD = document.getElementById('pilldensity');
    var volume = (isNaN(parseInt(pillV.value)) ? 0 : parseInt(pillV.value));
    var density = (isNaN(parseInt(pillD.value)) ? 0 : parseInt(pillD.value));
    this.setState({mass: volume*density})
  }
  onChangeVolume(event) {
    var volume = event.target.value
    var mass = volume*this.state.pillDensity
    this.setState({
      pillMass: mass,
      pillVolume: volume
    })
  }
  onChangeDensity(event) {
    var density = event.target.value
    var mass = density*this.state.pillVolume
    this.setState({
      pillMass: mass,
      pillDensity: density
    })
  }
  onClickOptimize() {
    // Check if room in combinations
    var countSackCombinations = 0
    this.props.combinationMap.forEach((combination, key) => {
      if(combination.sacks) {
        countSackCombinations += 1
      }
    })
    if (countSackCombinations < 5) {
      this.props.getOptimalBlend()
    } else {
      alert("Please remove a atleast 1 sack combination before running the optimizer")
    }
  }

render () {

  return (
    <Wrapper>
      <legend style={{color:"#3D3D3D"}}>Enter pill volume in m<sup>3</sup> :</legend>
      <TextField
        type="number"
        id="pillvolume"
        value={this.state.pillVolume}
        meta= "m3"
        onChange = {(event) => this.onChangeVolume(event)}
        disabled={this.props.loading}
      />
      <legend style={{color:"#3D3D3D"}}>Enter pill density in kg/m<sup>3</sup>:</legend>
      <TextField
        type="number"
        id="pilldensity"
        value={this.state.pillDensity}
        meta="kg/m3"
        onChange = {(event) => this.onChangeDensity(event)}
        disabled={this.props.loading}
      />
      <legend id="test" style={{color:"red"}}>Mass: {this.state.pillMass}</legend>
      <Button 
        variant="outlined" 
        onClick={(event) => {this.onClickOptimize()}}
        disabled={this.props.loading}
      >
        Run optimizer
      </Button>
    </Wrapper>
  )
}
}

export default PillInput