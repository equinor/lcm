import React, { PureComponent } from "react";
import styled from "styled-components";
import { Typography, StarProgress } from "@equinor/eds-core-react";
import PillInput from "./PillInput.js";
import WeightOptions from "./WeightOptions.js";
import SolutionData from "./SolutionData.js";
import SolutionVisualisations from "./SolutionVisualisations.js";
import { OptimizerAPI } from "../../Api"

const WrapperHeader = styled.div`
  padding-bottom: 2rem;
`;

const WrapperOptimizer = styled.div`
  padding-top: 4rem;
`;

const Wrapper = styled.div`
  padding-top: 4rem;
`;

const Grid = styled.div`
  height: auto;
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 260px);
  grid-gap: 32px 32px;
`;

export default class OptimizationContainer extends PureComponent {
  constructor() {
    super()
    this.state = {
      loading: false,
      fetched: false,
      optimizationData: null
    }
    this.pillInputElement = React.createRef()
    this.weightOptionElement = React.createRef()

    this.getOptimalBlend = this.getOptimalBlend.bind(this)
  }

  getOptimalBlend() {
    this.setState({
      optimizationData: null,
      loading: true,
      fetched: false
    })
    var mass = this.pillInputElement.current.getPillMass()
    var option = this.props.mode()
    var value = this.props.getBridgeValue()
    var environmental = this.weightOptionElement.current.getEnvironmental()
    var productIds = []
    this.props.productMap.forEach((product, key) => {
      if (product.enabled) {
        productIds.push(product.id)
      }
    })
    // Check if there are any selected products
    if (productIds.length === 0) {
      alert("Please select atleast 1 product before running the optimizer")
      this.setState({
        loading: false,
        fetched: true
      });
      return
    }
    var weights = this.weightOptionElement.current.getWeightPercentages()

    console.log(JSON.stringify({
      request: "OPTIMAL_MIX",
      name: "Optimal Blend",
      value: value,
      option: option,
      mass: mass,
      enviromental: environmental,
      products: productIds,
      weights: weights
    }))
    OptimizerAPI.postOptimizerApi({
        request: "OPTIMAL_MIX",
        name: "Optimal Blend",
        value: value,
        option: option,
        mass: mass,
        enviromental: environmental,
        products: productIds,
        weights: weights
      })
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        return responseData;
      })
      .then((data) => {
        // Send optimization data
        
        if (data && data.products && data.products.length !== 0){

          this.setState({
            optimizationData: data, 
            loading: false,
            fetched: true,
          });

          // Add the optimized solution to sack combinations
          var tempValues = new Map()
          var products = data.products
          // Find total mass sum
          var massSum = 0
          if (products.length !== 0) {
            products.map((component) => {
              massSum += component.sacks * (this.props.products.get(component.id)).sack_size
            })
            products.map((component) => {
              if (component.sacks !== 0) {
                console.log(component);
                var tempValue = {}
                tempValue.id = component.id
                tempValue.value = component.sacks
                tempValue.percentage = 100*((component.sacks * (this.props.products.get(component.id)).sack_size) / massSum)
                tempValues.set(tempValue.id, tempValue) 
              } 
            })
            }
            // Find available name 
            var n = 1
            var taken = true
            var next = false;

            while (taken) {
              next = false
              var currentName = "Optimized " + n
              this.props.combinationMap.forEach((combination, key) => {
                if (combination.name === currentName) {
                  n++
                  next = true
                }
              })
              if (!next) {
                taken = false
              }
            }
            this.props.addCombination(currentName, true, tempValues)
          } else {
            this.setState({
              optimizationData: null, 
              loading: false,
              fetched: true,
            });
            alert("No optimized solution found")
          }
        return data;
      })
      .catch((err) => {
        console.log("fetch error" + err);
        this.setState({
          loading: false,
          fetched: true,
        });
      });
  }
  render() {
    /*if (!this.state.fetched&&!this.state.loading) {
    }*/
    return (
      <div>
        <Grid>
          <div>
            <WrapperHeader>
              <Typography variant="h2">Optimizer</Typography>
            </WrapperHeader>
            <PillInput ref={this.pillInputElement} combinationMap={this.props.combinationMap} getOptimalBlend={this.getOptimalBlend} loading={this.state.loading}/>
            <Wrapper>
            {(this.state.loading) ? <StarProgress /> : console.log("Not loading")}
            </Wrapper>
          </div>
          <div>
            <WeightOptions ref={this.weightOptionElement} loading={this.state.loading}/>
          </div> 
          
        </Grid>
        {(this.state.fetched) ? 
          (this.state.optimizationData) ?
          (<WrapperOptimizer > {/*Add constraint her - needs this section not to be shown before we run the optimizer */}
            <Grid>
              <SolutionData products={this.props.products} combinationMap={this.props.combinationMap} loading={this.state.loading} fetched={this.state.fetched} optimizationData={this.state.optimizationData} addCombination={this.props.addCombination} />
              <div>
                <SolutionVisualisations  products={this.props.products}  loading={this.state.loading} fetched={this.state.fetched} optimizationData={this.state.optimizationData} />
              </div>
            </Grid>
          </WrapperOptimizer>)
          : <p>No solution found. Please alter the products, weights and environmental constraints</p>
        :
        ""
        }
      </div>
    );
  }
}