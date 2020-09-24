import React, {ReactElement} from 'react';
import styled from 'styled-components';
// @ts-ignore
import {TextField} from '@equinor/eds-core-react';

const Wrapper = styled.div`
  display: grid;
  grid-template-rows: min-width;
  padding: 0px;
  
  grid-gap: 2rem;
  position: relative;
  transition: all 0.36s;
  grid-template-columns: repeat(1, fit-content(100%));
`

export interface Pill {
    volume: number
    density: number
    mass: number
}


interface PillInputProps {
    isLoading: boolean
    pill: Pill
    setPill: Function
}

const PillInput = ({pill, setPill, isLoading}: PillInputProps): ReactElement => {

    const handleVolumeChange = (event: any) => {
        const volume = event.target.value
        const mass = volume * pill.density

        setPill({
            volume: volume,
            mass: mass,
            density: pill.density
        })
    }

    const handleDensityChange = (event: any) => {
        const density = event.target.value
        const mass = density * pill.volume

        setPill({
            volume: pill.volume,
            mass: mass,
            density: density
        })
    }

    return (
        <Wrapper>
            <legend style={{color: "#3D3D3D"}}>Enter pill volume in m<sup>3</sup> :</legend>
            <TextField
                type="number"
                id="pillvolume"
                value={pill.volume}
                meta="m3"
                onChange={(event: any) => handleVolumeChange(event)}
                disabled={isLoading}
            />
            <legend style={{color: "#3D3D3D"}}>Enter pill density in kg/m<sup>3</sup>:</legend>
            <TextField
                type="number"
                id="pilldensity"
                value={pill.density}
                meta="kg/m3"
                onChange={(event: any) => handleDensityChange(event)}
                disabled={isLoading}
            />
            <legend id="test" style={{color: "red"}}>Mass: {pill.mass}</legend>
        </Wrapper>
    )
}

export default PillInput