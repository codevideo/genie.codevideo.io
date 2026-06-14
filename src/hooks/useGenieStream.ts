import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import {
  startGeneration,
  setLessonName,
  setLessonDescription,
  appendLessonAction,
  finishGeneration,
  markComplete,
} from '@/store/genieSlice'

const WS_URL = process.env.NEXT_PUBLIC_GENIE_WS_URL || 'ws://localhost:9000'
const API_URL = process.env.NEXT_PUBLIC_GENIE_API_URL || 'http://localhost:3000'

/**
 * Connects to the codevideo-genie backend and streams generated actions into
 * the Redux store. The WebSocket (:9000) is the backend's broadcast output
 * channel; generation is triggered over HTTP (POST /codevideo-mcp/agent).
 *
 * The WS connects on mount so the client is registered before any generate()
 * call — broadcasts only reach already-connected clients.
 */
export const useGenieStream = () => {
  const dispatch = useDispatch<AppDispatch>()
  const socketRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ws = new WebSocket(WS_URL)
    socketRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setError(`Could not reach the generator at ${WS_URL}`)
    ws.onmessage = (event) => {
      let msg: any
      try {
        msg = JSON.parse(event.data as string)
      } catch {
        return
      }
      switch (msg.type) {
        case 'setLessonName':
          dispatch(setLessonName(msg.lessonName))
          break
        case 'setLessonDescription':
          dispatch(setLessonDescription(msg.lessonDescription))
          break
        case 'appendLessonAction':
          // backend already drops empty values; guard anyway for the strict validator
          if (msg.lessonAction?.name && msg.lessonAction?.value) {
            dispatch(appendLessonAction({ name: msg.lessonAction.name, value: msg.lessonAction.value }))
          }
          break
        case 'generationComplete':
          dispatch(finishGeneration())
          dispatch(markComplete())
          break
        case 'error':
          setError(msg.message || 'Generation failed')
          dispatch(finishGeneration())
          break
      }
    }

    return () => {
      ws.onmessage = null
      ws.close()
      socketRef.current = null
    }
  }, [dispatch])

  const generate = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return
      setError(null)
      dispatch(startGeneration(prompt))
      try {
        const res = await fetch(`${API_URL}/codevideo-mcp/agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
        if (!res.ok) throw new Error(`Generator responded ${res.status}`)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to start generation')
        dispatch(finishGeneration())
      }
    },
    [dispatch]
  )

  return { generate, connected, error }
}
