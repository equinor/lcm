import React from "react";
import styled from "styled-components";
import { Accordion, SideSheet, Button, TopBar, Icon } from "@equinor/eds-core-react";
import { account_circle, accessible, notifications, fullscreen, grid_on } from "@equinor/eds-icons";
import SelectProducts from "../Components/Optimization/SelectProducts.js";
import BridgeContainer from "../Components/Bridging/BridgeContainer.js";
import CardContainer from "../Components/Blending/CardContainer.js";
import RefreshButton from "./RefreshButton.js";
import OptimizationContainer from "../Components/Optimization/OptimizationContainer.js";

const { AccordionItem, AccordionHeader, AccordionPanel } = Accordion;

const icons = {
  account_circle,
  accessible,
  notifications,
  fullscreen,
  grid_on,
};

const Wrapper = styled.div`
  height: 100vh;
  overflow: auto;
`

const Body = styled.div`
  position: relative;
  height: "fit-content";
  background: #ebebeb;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  font-family: "Equinor";
`

Icon.add(icons);

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toggle: true,
      mixMap: new Map(),
      loadingMix: false,
      fetchedMix: true,
      bridgeRefreshCount: 0,
      productMap: new Map(),
      optimizationData: null,
      combinationMap: new Map([
        [
          1,
          { id: 1, name: "Sack combination 1", sacks: true, values: new Map() },
        ],
        [
          2,
          {
            id: 2,
            name: "Manual combination 1",
            sacks: false,
            values: new Map(),
          },
        ],
      ]),
      combinationIdCount: 3,
      fetched: false,
      loading: false,
    };
    this.bridgeContainerElement = React.createRef()


    this.updateProductById = this.updateProductById.bind(this);
    this.getAllProducts = this.getAllProducts.bind(this);
    this.updateCombination = this.updateCombination.bind(this);
    this.addCombination = this.addCombination.bind(this);
    this.removeCombination = this.removeCombination.bind(this);
    this.getProductById = this.getProductById.bind(this);
    this.getCombinationById = this.getCombinationById.bind(this);
    this.getBridgeOption = this.getBridgeOption.bind(this);
    this.getBridgeValue = this.getBridgeValue.bind(this);
    this.addOptimizationData = this.addOptimizationData.bind(this);
    this.updateCombinationName = this.updateCombinationName.bind(this);
  }

  updateProductById(productId) {
    var tempProductMap = this.state.productMap;
    var product = this.getProductById(productId);
    product.enabled = !product.enabled;
    tempProductMap.set(product.id, product);
    // TODO Look for combinations with this product
    var changedCombination = false;
    var tempCombinationMap = this.state.combinationMap;
    this.state.combinationMap.forEach((combination, key) => {
      var tempCombination = combination;
      if (tempCombination.values.has(productId)) {
        tempCombination.values.delete(productId);
        tempCombinationMap.set(tempCombination.id, tempCombination);
        changedCombination = true;
        this.getMix(tempCombination.id);
      }
    });

    if (changedCombination) {
      this.setState({
        productMap: tempProductMap,
        combinationMap: tempCombinationMap,
      });
    } else {
      this.setState({
        productMap: tempProductMap,
      });
    }
  }

  updateCombinationName(combinationId, name) {
    var tempCombinationMap = this.state.combinationMap
    var tempCombination = this.getCombinationById(combinationId)
    //Check if name is already taken
    tempCombinationMap.forEach((combination, key) => {
      if (combination.name === name) {
        alert("Name of combination already taken. Please select another one")
        return
      }
    })
    tempCombination.name = name
    this.setState({
      combinationMap: tempCombinationMap
    })
    // Update the graph
    this.setState({
      bridgeRefreshCount: this.state.bridgeRefreshCount+1
    })
  }
  removeCombination(combinationId) {
    if (this.state.combinationMap.has(combinationId)) {
      var tempCombinations = this.state.combinationMap;
      tempCombinations.delete(combinationId);
      this.setState({
        bridgeRefreshCount: this.state.bridgeRefreshCount+1,
        combinationMap: tempCombinations
      });
    }
  }

  getBridgeOption() {
    return this.bridgeContainerElement.current.getOption()
  }

  getBridgeValue() {
    return this.bridgeContainerElement.current.getValue()
  }

  updateCombination(combinationId, productId, value) {
    var tempCombinations = this.state.combinationMap;
    var tempCombination = tempCombinations.get(combinationId);
    var tempValues = tempCombination.values;
    if (tempValues.has(productId)) {
      // Update existing
      var tempValue = tempValues.get(productId);
      //tempValue.id = value.id
      if (!value || value === 0 || isNaN(value)) {
        // Remove entry
        tempValues.delete(productId);
      } else {
        // Update
        tempValue.value = value;
        tempValues.set(tempValue.id, tempValue);
      }
    } else {
      // Create new entry
      tempValues.set(productId, { id: productId, value: value });
    }
    // Debug
    /*tempValues.forEach((value, key) => {
      alert("Value: " + value.value + ", id:" + value.id)
    })*/

    tempCombination.values = tempValues;

    // Set percentages
    var tempValues = tempCombination.values;
    var massSum = 0;
    tempValues.forEach((value, key) => {
      // Sum up the total mass
      massSum +=
        value.value *
        (tempCombination.sacks ? this.getProductById(value.id).sack_size : 1);
    });
    // Set the percentages to the value object for combination
    tempValues.forEach((value, key) => {
      value.percentage =
        100 *
        ((value.value *
          (tempCombination.sacks
            ? this.getProductById(value.id).sack_size
            : 1)) /
          massSum);
      tempValues.set(value.id, value);
    });

    // Remove the cumulative distribution if all empty
    if (massSum === 0 || massSum === 0.0) {
      if (tempCombination.hasOwnProperty("cumulative")) {
        delete tempCombination.cumulative;
      }
    }
    tempCombination.values = tempValues;

    tempCombinations.set(tempCombination.id, tempCombination);
    this.setState({
      //lastChangedCombinationId: combinationId,
      //fetchedMix: false,
      combinationMap: tempCombinations,
    });
    this.getMix(tempCombination.id);
  }

  addOptimizationData(optimizationData) {

  }

  addCombination(name, sacks, values) {
    // Values are optional
    values = values || new Map()
    var count = 0;
    this.state.combinationMap.forEach((combination, key) => {
      if (combination.sacks === sacks) {
        count++;
      }
    });
    if (count >= 5) {
      alert(
        "Too many combinations. Please remove atleast one before adding a new one."
      );
      return;
    }

    let combination = {
      id: this.state.combinationIdCount,
      name: name,
      sacks: sacks,
      values: values,
    };

    var tempCombinations = this.state.combinationMap;

    tempCombinations.set(combination.id, combination);

    this.setState({
      bridgeRefreshCount: this.state.bridgeRefreshCount+1,
      combinationMap: tempCombinations,
      combinationIdCount: this.state.combinationIdCount + 1,
    });
    this.getMix(combination.id)
  }

  getProductById(productId) {
    return this.state.productMap.get(productId);
  }

  getCombinationById(combinationId) {
    return this.state.combinationMap.get(combinationId);
  }

  getMix(combinationId) {
    //alert("Get mix " + combinationId)
    var tempCombination = this.getCombinationById(combinationId);
    var tempCombinationMap = this.state.combinationMap;
    this.setState({
      fetchedMix: false,
      loadingMix: true,
    });
    // Convert to API accepted input
    var tempProducts = [];
    tempCombination.values.forEach((value, key) => {
      tempProducts.push({ id: value.id, percents: value.percentage });
    });

    fetch("https://lcm-blend-backend-test.azurewebsites.net/api/BackendAPI", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: "MIX_PRODUCTS",
        products: tempProducts,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        return responseData;
      })
      .then((data) => {
        tempCombination.cumulative = data.cumulative;
        tempCombinationMap.set(tempCombination.id, tempCombination);
        this.setState({
          combinationMap: tempCombinationMap,
          loadingMix: false,
          fetchedMix: true,
        });
        return data;
      })
      .catch((err) => {
        console.log("fetch error" + err);
        this.setState({
          loadingMix: false,
          fetchedMix: true,
        });
      });
  }

  getAllProducts() {
    this.setState({
      loading: true,
    });
    fetch("https://lcm-blend-backend-test.azurewebsites.net/api/BackendAPI", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: "PRODUCT_LIST",
        metadata: ["SACK_SIZE"],
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        return responseData;
      })
      .then((data) => {
        var productMap = new Map();
        for (var i = 0; i < data.length; i++) {
          // Add enabled value to all products
          data[i]["enabled"] = true;
          // Create a Map of products with id as key
          productMap.set(data[i].id, data[i]);
        }
        this.setState({
          productMap: productMap,
          loading: false,
          fetched: true,
        });
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
    if (!this.state.fetched && !this.state.loading) {
      this.getAllProducts();
    }
    return (
      <Wrapper>
        <TopBar style={{height:'fit-content'}}>
          <RefreshButton />
          <div>
            <Button
              variant="outlined"
              onClick={() => this.setState({ toggle: !this.state.toggle })}
            >
              Select products
            </Button>
          </div>
        </TopBar>

        <Body>
          <SideSheet
            variant="medium"
            title="Select products:"
            open={this.state.toggle}
            onClose={() => this.setState({ toggle: false })}
          >
            {/*<SearchProducts />*/}
            <SelectProducts
              fetched={this.state.fetched}
              loading={this.state.loading}
              productMap={this.state.productMap}
              //products={this.state.products}
              updateProductById={this.updateProductById}
            />
          </SideSheet>

          <BridgeContainer
            ref={this.bridgeContainerElement}
            bridgeRefreshCount={this.state.bridgeRefreshCount}
            combinationMap={this.state.combinationMap}
            loadingMix={this.state.loadingMix}
            fetchedMix={this.state.fetchedMix}
          />

          <Accordion>
            <AccordionItem>
              <AccordionHeader>Sack combinations</AccordionHeader>
              <AccordionPanel>
                <CardContainer
                  sacks={true}
                  combinationMap={this.state.combinationMap}
                  loading={this.state.loading}
                  fetched={this.state.fetched}
                  productMap={this.state.productMap}
                  addCombination={this.addCombination}
                  removeCombination={this.removeCombination}
                  updateCombination={this.updateCombination}
                  updateCombinationName={this.updateCombinationName}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionHeader>Manual combinations</AccordionHeader>
              <AccordionPanel>
                <CardContainer
                  sacks={false}
                  combinationMap={this.state.combinationMap}
                  loading={this.state.loading}
                  fetched={this.state.fetched}
                  productMap={this.state.productMap}
                  addCombination={this.addCombination}
                  removeCombination={this.removeCombination}
                  updateCombination={this.updateCombination}
                  updateCombinationName={this.updateCombinationName}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <OptimizationContainer 
            productMap={this.state.productMap}
            combinationMap={this.state.combinationMap}
            getBridgeOption={this.getBridgeOption}
            getBridgeValue={this.getBridgeValue}
            addCombination={this.addCombination}
          />
          {/*<WrapperOptimizer>
            <Grid>
              <div>
                <WrapperHeader>
                  <Typography variant="h2">Optimizer</Typography>
                </WrapperHeader>

                <PillInput />
              </div>
              <div>
                <WeightOptions />
              </div>
            </Grid>
          </WrapperOptimizer>
          <Grid>
            <SolutionData />
            <div>
              <SolutionInfo />
            </div>
          </Grid>*/}
        </Body>
      </Wrapper>
    );
  }
}
