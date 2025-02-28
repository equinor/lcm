import { type Id, toast } from 'react-toastify'

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
