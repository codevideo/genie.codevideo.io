import dynamic from 'next/dynamic'
import { useSelector, useDispatch } from 'react-redux'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import type { RootState, AppDispatch } from '@/store'
import { advanceActionIndex, markComplete } from '@/store/genieSlice'

// Monaco is browser-only — never SSR the IDE (the ide-react README's SSR warning)
const CodeVideoIDE = dynamic(
  () => import('@fullstackcraftllc/codevideo-ide-react').then((m) => m.CodeVideoIDE),
  { ssr: false }
)

/**
 * Renders the live, streaming IDE while genie generates. Uses the published
 * isStreaming contract: actions are appended to a growing array, the parent
 * owns currentActionIndex (advanced from actionFinishedCallback), and playback
 * idles ("buffering") when it outruns generation, resuming on the next append.
 * When generation finishes, isStreaming flips false so playback completes.
 */
export default function GenieResult() {
  const dispatch = useDispatch<AppDispatch>()
  const { generatedActions, currentActionIndex, isGenerating, isComplete, lessonName } = useSelector(
    (s: RootState) => s.genie
  )

  if (generatedActions.length === 0 && !isGenerating) return null

  const delivered = generatedActions.length
  const playing = Math.min(currentActionIndex + 1, Math.max(delivered, 1))
  const buffering = isGenerating && currentActionIndex >= delivered

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-900/50">
      {/* status strip */}
      <div className="flex items-center gap-3 px-4 py-2 text-sm font-mono border-b border-gray-700">
        <span className="text-gray-300">{lessonName || 'Generating…'}</span>
        <span className="text-gray-500">
          {delivered} action{delivered === 1 ? '' : 's'} · playing #{playing}
        </span>
        {isGenerating && <span className="text-green-400">streaming</span>}
        {buffering && <span className="text-yellow-400">buffering</span>}
        {isComplete && <span className="text-blue-400">complete</span>}
      </div>

      <div style={{ height: '70vh', width: '100%' }}>
        {/* Theme must fill the 70vh box: it renders a height:auto div that would
            otherwise collapse, squashing the IDE's height:100% root inside it. */}
        <Theme
          accentColor="purple"
          appearance="dark"
          panelBackground="translucent"
          radius="large"
          style={{ height: '100%', width: '100%' }}
        >
          <CodeVideoIDE
            theme="dark"
            project={generatedActions}
            mode="replay"
            isStreaming={isGenerating}
            allowFocusInEditor={false}
            defaultLanguage="typescript"
            isExternalBrowserStepUrl={null}
            currentActionIndex={currentActionIndex}
            currentLessonIndex={null}
            isSoundOn={false}
            withCaptions={true}
            speakActionAudios={[]}
            actionFinishedCallback={() => dispatch(advanceActionIndex())}
            playBackCompleteCallback={() => dispatch(markComplete())}
            fontSizePx={16}
            keyboardTypingPauseMs={30}
            standardPauseMs={400}
            longPauseMs={1000}
            resolution="1080p"
          />
        </Theme>
      </div>
    </div>
  )
}
