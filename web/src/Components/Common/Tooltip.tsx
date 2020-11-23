import styled from 'styled-components'
import React, { ReactElement } from 'react'
// @ts-ignore
import { Tooltip as EDSTooltip } from '@equinor/eds-core-react'
import { COLORS } from '../../Enums'

const StyledTooltipIcon = styled.div`
  background-color: white;
  height: 18px;
  margin: 5px 0;
  width: 18px;
  border-radius: 20px;
  border: #cccccc solid 1px;
  color: ${COLORS.secondary};
  display: flex;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: help;
  }
`

const TooltipWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`

interface TooltipProps {
  text: string
  children: ReactElement
}

export const Tooltip = ({ text, children }: TooltipProps): ReactElement => {
  return (
    <TooltipWrapper>
      {children}
      <EDSTooltip title={text} placement='rightTop'>
        <StyledTooltipIcon>?</StyledTooltipIcon>
      </EDSTooltip>
    </TooltipWrapper>
  )
}
