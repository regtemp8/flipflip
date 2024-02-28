import { useRef } from 'react'

export default function useTrackVariableChanges<T>(
  variables: Record<string, T>
) {
  const _prevVariables = useRef<Record<string, T>>()

  const component = new Error().stack?.split('\n')[1].split('@')[0]
  Object.keys(variables).forEach((name) => {
    if (
      _prevVariables.current != null &&
      _prevVariables.current[name] !== variables[name]
    ) {
      console.log(`${component}: ${name} CHANGED`)
    }
  })

  _prevVariables.current = variables
}
