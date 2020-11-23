import { toast } from 'react-toastify'
import React from 'react'

export const InfoToast = (msg: string) => toast.info(msg)
export const WarningToast = (msg: string) => toast.warning(msg)
export const ErrorToast = (msg: string, code?: number): any => {
  const title = <p>Error</p>
  const config: Object = { autoClose: 7000 }

  if (code === 401)
    return toast.error(
      <>
        {title}
        <p>Session Expired</p>
        <p>Please reload page</p>
        <div style={{ textAlign: 'right' }}>
          <small>{code}</small>
        </div>
      </>,
      config
    )
  else {
    return toast.error(
      <>
        {title}
        <p>{msg}</p>
        <div style={{ textAlign: 'right' }}>
          <small>{code}</small>
        </div>
      </>,
      config
    )
  }
}
