import React from "react";

import "./App.css";
import {v4 as uuidv4} from 'uuid';
import Main from "./Pages/Main"
import "./Components/icons"

const defaultState = new Map()

const sackCombination = {
    id: uuidv4(),
    name: "Sack combination 1",
    sacks: true,
    values: new Map(),
    cumulative: null
}
defaultState.set(sackCombination.id, sackCombination)

const manualCombination = {
    id: uuidv4(),
    name: "Manual combination 1",
    sacks: false,
    values: new Map(),
    cumulative: null
}

defaultState.set(manualCombination.id, manualCombination)

function App(){
    return <Main  defaultState={defaultState}/>
}

export default App