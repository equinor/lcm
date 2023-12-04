import styled from 'styled-components'
import React, { ReactElement } from 'react'
// @ts-ignore
import { Tooltip as EDSTooltip, Icon } from '@equinor/eds-core-react'
import { help_outline} from '@equinor/eds-icons'
import { COLORS } from '../../Enums'

const Wrapper = styled.div`
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: help;
  }
`

const TooltipWrapper = styled.div`
  display: flex;
  align-items: center;
`

interface TooltipProps {
  text: string
  children: ReactElement
}

export const Tooltip = ({ text, children }: TooltipProps): ReactElement => {
  return (
    <TooltipWrapper>
      {children}
      <EDSTooltip title={text} placement={'top-end'}>
        <Wrapper>
        <Icon data={help_outline} size={18} style={{color: COLORS.secondary}}/>
        </Wrapper>
      </EDSTooltip>
    </TooltipWrapper>
  )
}
