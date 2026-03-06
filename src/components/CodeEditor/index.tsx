import { FC, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import 'monaco-editor/min/vs/editor/editor.main.css';


interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  height?: string | number;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
}

export const CodeEditor: FC<CodeEditorProps> = ({
  value,
  language = 'javascript',
  onChange,
  height = '400px',
  readOnly = false,
  theme = 'light'
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // 配置编辑器选项
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
    });
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;