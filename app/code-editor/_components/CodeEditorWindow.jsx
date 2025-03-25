import { Editor } from '@monaco-editor/react';
import React, { useState } from 'react'
import { defineTheme } from '../lib/defineTheme';

function CodeEditorWindow({ onChange, language, code, theme }) {

  const [value, setValue] = useState(code || "// Hi this is code")
  const [themeValue, setThemeValue] = useState(null)

  if(theme){
    defineTheme(theme).then(_ => setThemeValue(theme))
  }
  console.log(theme)
  const handleEditorChange = (value) => {
    setValue(value);
    onChange("code", value)
  }

  return (
    <Editor
      language={language || "javascript"}
      value={value}
      theme={themeValue}
      defaultValue='// some comment'
      onChange={handleEditorChange}
    />
  )
}

export default CodeEditorWindow