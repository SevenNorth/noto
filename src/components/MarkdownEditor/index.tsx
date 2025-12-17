import { FC } from 'react'
import MDEditor, { commands } from '@uiw/react-md-editor'

export interface MarkdownEditorProps {
  value?: string
  onChange?: (value?: string) => void
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
}


const MarkdownEditor: FC<MarkdownEditorProps> = ({
  value = '',
  onChange,
  placeholder,
  disabled = false,
  readonly = false
}) => {
  return (
    <div data-color-mode="light" className='h-full'>
      <MDEditor
        value={value}
        height="100%"
        onChange={readonly ? undefined : onChange}
        preview={readonly ? 'preview' : 'live'}
        hideToolbar={readonly}
        textareaProps={{
          placeholder,
          disabled,
        }}
        commands={[
          commands.bold,
          commands.italic,
          commands.divider,
          commands.link,
          commands.code,
          commands.codeBlock,
          commands.divider,
          commands.unorderedListCommand,
          commands.orderedListCommand,
        ]}
        previewOptions={{
          skipHtml: true,
        }}
      />
    </div>
  )
}

export default MarkdownEditor
