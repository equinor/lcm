import React from 'react';
import { Slider, Card, Typography, Checkbox } from '@equinor/eds-core-react'
import styled from 'styled-components'
import WeigthChart from './WeigthChart.js'

const Wrapper = styled.div`
  padding-bottom: 2rem;
`

const UnstyledList = styled.ul`
  margin: 0px;
  padding: 0px;
  list-style-type: none;
`

const Grid = styled.div`
  height: auto;
  width: fit-content;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 300px);
  grid-gap: 100px 100px;
  align-items: center;
`

const GridUpper = styled.div`
  height: auto;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 300px);
  grid-gap: 100px 100px;
`

const GridFilter = styled.div`
  height: auto;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(1, 600px);
  
`

const EnvironmentalWrapper = styled.div`
  margin: 0px;
  display: grid;
  grid-gap: 0px;
  grid-template-columns: repeat(4, 150px);
`


export default class WeightOptions extends React.Component { 
    constructor() {
        super()
        this.state = {
            fitValue: 5,
            co2Value: 0,
            costValue: 0,
            massValue: 5,
            environmentalGreen: true,
            environmentalYellow: true,
            environmentalRed: true,
            environmentalBlack: true,
        }
    }

    getEnvironmental() {
        var environmental = []
        if (this.state.environmentalGreen) {
            environmental.push("GREEN")
        }
        if (this.state.environmentalYellow) {
            environmental.push("YELLOW")
        }
        if (this.state.environmentalRed) {
            environmental.push("RED")
        }
        if (this.state.environmentalBlack) {
            environmental.push("BLACK")
        }
        return environmental
    }

    getWeightPercentages() {
        var weightSum = this.state.fitValue + this.state.co2Value + this.state.costValue + this.state.massValue
        return {
            "best_fit": 100*(this.state.fitValue/weightSum),
            "mass_fit": 100*(this.state.massValue/weightSum),
            "co2": 100*(this.state.co2Value/weightSum),
            "cost": 100*(this.state.costValue/weightSum)
        }        
    }
    render () {
        return (
            <Card style={{ width: 'fit-content'}}>
            <GridUpper>
                <Typography variant="h6">Weigthing</Typography>
                <div></div>
            </GridUpper>
            <Grid>
            <div>
            <Wrapper>
            <span style={{color: '#3D3D3D'}}>
                Fit
            </span>
            <Slider 
                id='Fit'  
                value={this.state.fitValue} min={0} max={10} 
                onChange={(event, value) => {
                    this.setState({
                        fitValue: value
                    })
                }} 
                disabled={this.props.loading} 
                ariaLabelledby = {(this.props.loading) ? "disabled-slider" : "simple-slider"}
                
                //onChangeCommitted={(event, value) => {updateValueFitCommited(value)}}
            />
            </Wrapper>
            <Wrapper> 
            <span style={{color: '#3D3D3D'}}>
                Cost
            </span>
            <Slider 
                id='Cost'  
                value={this.state.costValue} min={0} max={10} 
                onChange={(event, value) => {
                    this.setState({
                        costValue: value
                    })
                }} 
                disabled={this.props.loading} 
                ariaLabelledby = {(this.props.loading) ? "disabled-slider" : "simple-slider"}
                //onChangeCommited={(event, value) => {updateValueCostCommited(value)}} 
            />
            </Wrapper>
            {/*</div>
            <div>*/}
            <Wrapper>
            <span style={{color: '#3D3D3D'}}>
                CO2
            </span>
            <Slider 
                id='CO2'  
                value={this.state.co2Value} min={0} max={10} 
                onChange={(event, value) => {
                    this.setState({
                        co2Value: value
                    })
                }} 
                disabled={this.props.loading} 
                ariaLabelledby = {(this.props.loading) ? "disabled-slider" : "simple-slider"}
                //onChangeCommited={(event, value) => {updateValueCO2Commited(value)}} 
            />
            </Wrapper>
            <Wrapper>
            <span style={{color: '#3D3D3D'}}>
                Mass
            </span>
            <Slider 
                id='Mass'  
                value={this.state.massValue} min={0} max={10} 
                onChange={(event, value) => {
                    this.setState({
                        massValue: value
                    })
                }} 
                disabled={this.props.loading} 
                ariaLabelledby = {(this.props.loading) ? "disabled-slider" : "simple-slider"}
            />
            </Wrapper>
            </div>
            <WeigthChart fitValue={this.state.fitValue} costValue={this.state.costValue} CO2Value={this.state.co2Value} massValue={this.state.massValue}/>
            </Grid>
            <GridUpper>
            <Typography variant="h6">Environmental</Typography>
            </GridUpper>
            <GridFilter>
            <div> 
            {
                <UnstyledList>
                    <EnvironmentalWrapper>
                    <li>
                        <Checkbox 
                            label="Green" 
                            name="multiple" 
                            onChange={(event) => this.setState({environmentalGreen: !this.state.environmentalGreen})} 
                            checked={this.state.environmentalGreen} value="Green" disabled={this.props.loading}/>
                    </li>
                    <li>
                        <Checkbox 
                            label="Yellow" 
                            name="multiple" 
                            onChange={(event) => this.setState({environmentalYellow: !this.state.environmentalYellow})} 
                            checked={this.state.environmentalYellow} value="Yellow" disabled={this.props.loading}/>
                    </li>
                    <li>
                        <Checkbox 
                            label="Red" 
                            name="multiple" 
                            onChange={(event) => this.setState({environmentalRed: !this.state.environmentalRed})} 
                            checked={this.state.environmentalRed} value="Red" disabled={this.props.loading}/>
                    </li>
                    <li>
                        <Checkbox 
                            label="Black" 
                            name="multiple" 
                            onChange={(event) => this.setState({environmentalBlack: !this.state.environmentalBlack})} 
                            checked={this.state.environmentalBlack} value="Black" disabled={this.props.loading}/>
                    </li>
                    </EnvironmentalWrapper>
                </UnstyledList>
            }
            </div>
            </GridFilter>
            <Typography variant="body_long" style={{color:"#858585"}}>*Note that these weightings are not well-defined, and only serve to tune the optimizing algorithm based on the different categories.</Typography>
            </Card>
        )
    }
}


/*export const WeightOptions = () => {

    const [valueFit, updateValueFit] = useState(5)
    const [valueFitCommited, updateValueFitCommited] = useState(5)
    const [valueCost, updateValueCost] = useState(0)
    const [valueCostCommited, updateValueCostCommited] = useState(0)
    const [valueCO2, updateValueCO2] = useState(0)
    const [valueCO2Commited, updateValueCO2Commited] = useState(0)
    const [valueMass, updateValueMass] = useState(0)
    const [valueMassCommited, updateValueMassCommited] = useState(0)

    console.log(valueFit + valueCost + valueCO2 + valueMass)
  
        return(
            <Card style={{ width: 'fit-content'}}>
            <GridUpper>
                <Typography variant="h6">Weigthing</Typography>
                <div></div>
                <div></div>
            </GridUpper>
            <Grid>
            <div>
            <Wrapper>
            <span style={{color: '#3D3D3D'}}>
                Fit
            </span>
            <Slider 
                id='Fit'  
                value={5} min={0} max={10} 
                onChange={(event, value) => {updateValueFit(value)}} 
                ariaLabelledby="simple-slider" 
                //onChangeCommitted={(event, value) => {updateValueFitCommited(value)}}
            />
            </Wrapper>
            <span style={{color: '#3D3D3D'}}>
                Cost
            </span>
            <Slider 
                id='Cost'  
                value={0} min={0} max={10} 
                onChange={(event, value) => {updateValueCost(value)}} 
                ariaLabelledby="simple-slider" 
                //onChangeCommited={(event, value) => {updateValueCostCommited(value)}} 
            />
            </div>
            <div>
            <Wrapper>
            <span style={{color: '#3D3D3D'}}>
                CO2
            </span>
            <Slider 
                id='CO2'  
                value={0} min={0} max={10} 
                onChange={(event, value) => {updateValueCO2(value)}} 
                ariaLabelledby="simple-slider" 
                //onChangeCommited={(event, value) => {updateValueCO2Commited(value)}} 
            />
            </Wrapper>
            <span style={{color: '#3D3D3D'}}>
                Mass
            </span>
            <Slider 
                id='Mass'  
                value={0} min={0} max={10} 
                onChange={(event, value) => {updateValueMass(value)}} 
                ariaLabelledby="simple-slider" 
            />
            </div>
            <WeigthChart fitValue={valueFit} costValue={valueCost} CO2Value={valueCO2} massValue={valueMass}/>
            </Grid>
            <GridUpper>
            <Typography variant="h6">Environmental</Typography>
            </GridUpper>
            <GridFilter>
            <FilterEnvironmental />
            </GridFilter>
            <Typography variant="body_long" style={{color:"#858585"}}>*Note that these weigthings are just in blabalba, order of magnitude are taken care of in the algorithm.</Typography>
            </Card>
        )  
    }



export default WeightOptions*/