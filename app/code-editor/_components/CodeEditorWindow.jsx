import { Editor } from '@monaco-editor/react';
import React, { useState } from 'react'

function CodeEditorWindow({ onChange, language, code, theme }) {

  const [value, setValue] = useState(code || "// Hi this is code")

  const handleEditorChange = (value) => {
    setValue(value);
    onChange("code", value)
  }

  return (
    <Editor
      language={language || "javascript"}
      value={value}
      theme={theme}
      defaultValue='// some comment'
      onChange={handleEditorChange}
    />
  )
}

export default CodeEditorWindow