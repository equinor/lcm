import { type Id, toast } from 'react-toastify'

export function ErrorToast(msg: string, code?: number): Id {
  const config = { autoClose: 7000 }

  if (code === 401) return toast.error('Session Expired, please reload page', config)
  return toast.error(msg, config)
}
