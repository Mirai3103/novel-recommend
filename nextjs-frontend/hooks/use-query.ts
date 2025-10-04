import React, { useEffect, useState } from 'react'
interface IUseQueryProps<T,R> {
  queryFn: (variables: T) => Promise<R>
   variables: T
   key: string[] | string
}
export default function useQuery<T, R>(props: IUseQueryProps<T,R>) {
  const { queryFn, variables, key } = props
  const [data, setData] = useState<R | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    setIsLoading(true)
    queryFn(variables).then(setData).catch(setError).finally(() => setIsLoading(false))
  }, [ key])
  return { data, error, isLoading }
}
