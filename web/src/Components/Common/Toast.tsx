import { Id, toast } from 'react-toastify'

export const InfoToast = (msg: string) => toast.info(msg)
export const WarningToast = (msg: string) => toast.warning(msg)

export const ErrorToast = (msg: string, code?: number): Id => {
  const title = <p>Error</p>
  const config = { autoClose: 7000 }

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
