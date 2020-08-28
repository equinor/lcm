import React from 'react'
import { Typography } from '@equinor/eds-core-react'
import styled from 'styled-components'
import ExportButton from './ExportButton.js'

const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 0px;
  padding-bottom: 0px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 130px);
  grid-gap: 0px 0px;
`

const Wrapper = styled.div`
    padding-bottom: 32px;
`

class SolutionData extends React.Component {
    
    constructor() {
      super()
      this.getTotalMass = this.getTotalMass.bind(this)
    }

    getTotalMass(){
      var products = this.props.optimizationData.products
      var totalMass = 0
      if (products&&products.length !== 0) {
        products.map((product) => {
          totalMass += product.sacks * (this.props.productMap.get(product.id)).sack_size
        })
      }
      return totalMass
    }
  
    render() {
      if (!this.props.fetched) {
        return(
          <p>Not fetched</p>
        )
      } else {
        return (
          <div>
          <Wrapper>
          <Typography variant="h4">Optimal solution</Typography>
          </Wrapper>
          <Wrapper>   
            <Wrapper>
                <Typography variant="h6">Optimal blend:</Typography>
            </Wrapper>        
            {(this.props.fetched && this.props.optimizationData && this.props.optimizationData.products && this.props.optimizationData.products.length !== 0) ? this.props.optimizationData.products.map((product) => 
              ((product.sacks !== 0) ?
                <div>
                <Grid>
                  <Typography variant="body_short">{(this.props.productMap.get(product.id)).name}: </Typography>
                  <Typography variant="body_short">{product.sacks} sacks</Typography>
                </Grid>
                </div>
                : console.log("sack is of size 0"))
                ) : <Typography variant="body_short" style={{color:"#EC462F"}}>No solution found</Typography>
                }
                {(this.props.fetched && this.props.optimizationData) ?
                <Grid>
                  <Typography variant="body_short">Total mass: </Typography>
                  <Typography variant="body_short">{this.getTotalMass()} kg</Typography>
                </Grid>
                :
                ""
                }
          </Wrapper>
          <Wrapper>
          <Typography variant="h6">Performance:</Typography>
          </Wrapper> 
          <Wrapper>  
            <Grid>
            <Typography variant="body_short">Iterations:</Typography>
            <Typography variant="body_short">{(this.props.fetched && this.props.optimizationData) ? this.props.optimizationData.iterations : ""}</Typography>
            <Typography variant="body_short">Time:</Typography>
            <Typography variant="body_short">{(this.props.fetched && this.props.optimizationData && this.props.optimizationData.execution_time) ? (this.props.optimizationData.execution_time).toFixed(2) : ""} sec</Typography>
            </Grid>
          </Wrapper>
          <ExportButton
            fetched = {this.props.fetched}
            loading = {this.props.loading}
            optimizationData = {this.props.optimizationData} 
            productMap = {this.props.productMap}
          />
         </div>
      );
    }
  }
}
export default SolutionData