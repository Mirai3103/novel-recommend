import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getCurrentUserInfoApiUsersMeGet } from './client/users'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function getCurrentUser() {
  const accessToken = localStorage.getItem('access_token')
  if (!accessToken) {
    return null
  }
  const response = await getCurrentUserInfoApiUsersMeGet({
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  return response ?? null
}