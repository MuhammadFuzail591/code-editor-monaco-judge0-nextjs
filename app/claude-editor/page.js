'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader } from 'lucide-react'

// Function to encode/decode base64
const encodeBase64 = str => btoa(unescape(encodeURIComponent(str)))
const decodeBase64 = str => decodeURIComponent(escape(atob(str)))

const CodeEditor = () => {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState(63) // Default to JavaScript
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('description')

  // Sample problem
  const problem = {
    title: 'Sum of Two Numbers',
    description: `
# Sum of Two Numbers

Write a function that accepts two numbers and returns their sum.

## Input Format
Two integers a and b separated by a space.

## Output Format
A single integer representing the sum of a and b.

## Constraints
-10^9 ≤ a, b ≤ 10^9

## Example
Input: 3 5
Output: 8
    `,
    defaultCode: {
      71: `def add_numbers(a, b):
    # Your code here
    return a + b

if __name__ == "__main__":
    a, b = map(int, input().split())
    print(add_numbers(a, b))`,
      62: `#include <iostream>
using namespace std;

int add_numbers(int a, int b) {
    // Your code here
    return a + b;
}

int main() {
    int a, b;
    cin >> a >> b;
    cout << add_numbers(a, b) << endl;
    return 0;
}`,
      63: `function addNumbers(a, b) {
    // Your code here
    return a + b;
}

// For Node.js environment
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.on('line', (line) => {
    const [a, b] = line.split(' ').map(Number);
    console.log(addNumbers(a, b));
    readline.close();
});`
    },
    testCases: [
      { input: '1 2', expectedOutput: '3' },
      { input: '5 7', expectedOutput: '12' },
      { input: '0 0', expectedOutput: '0' },
      { input: '-1 1', expectedOutput: '0' }
    ]
  }

  // Initialize code from problem default
  useEffect(() => {
    if (problem.defaultCode[language]) {
      setCode(problem.defaultCode[language])
    }
  }, [language])

  const languages = [
    { id: 71, name: 'Python (3.8.1)' },
    { id: 62, name: 'C++ (GCC 9.2.0)' },
    { id: 63, name: 'JavaScript (Node.js 12.14.0)' }
  ]

  const runCode = async () => {
    setIsSubmitting(true)
    setResults(null)

    try {
      const testResults = await runCodeWithTestCases(
        code,
        language,
        problem.testCases
      )
      setResults(testResults)
    } catch (error) {
      console.log('Error running code:', error)
      setResults({ error: 'Failed to run code' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const runCodeWithTestCases = async (sourceCode, languageId, testCases) => {
    const apiKey = 'df0ecc66f6msh2efa1c1824c8b48p15df0cjsn947d9710b419'
    const apiHost = 'judge029.p.rapidapi.com'

    // Array to store submission tokens
    const submissions = []

    // Create a submission for each test case
    for (const [index, testCase] of testCases.entries()) {
      const options = {
        method: 'POST',
        url: 'https://judge029.p.rapidapi.com/submissions',
        params: {
          base64_encoded: 'true',
          wait: 'true', // Set to true to wait for result
          fields: '*'
        },
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': apiHost,
          'Content-Type': 'application/json'
        },
        data: {
          source_code: encodeBase64(sourceCode),
          language_id: languageId,
          stdin: encodeBase64(testCase.input),
          expected_output: encodeBase64(testCase.expectedOutput)
        }
      }

      try {
        const response = await axios.request(options)
        submissions.push({
          testCase: index + 1,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: response.data.stdout
            ? decodeBase64(response.data.stdout)
            : '',
          status: response.data.status,
          passed: response.data.status.id === 3, // 3 is "Accepted" status
          details: response.data
        })
      } catch (error) {
        console.error('Error creating submission:', error)
        submissions.push({
          testCase: index + 1,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          error: 'Failed to execute test',
          passed: false
        })
      }
    }

    // Calculate summary
    const summary = {
      totalTestCases: testCases.length,
      passedTestCases: submissions.filter(r => r.passed).length,
      failedTestCases: submissions.filter(r => !r.passed).length,
      testCaseResults: submissions
    }

    console.log(summary)

    return summary
  }

  return (
    <div className='flex flex-col h-screen max-h-screen'>
      <div className='p-4 text-white bg-gray-800'>
        <h1 className='text-xl font-bold'>{problem.title}</h1>
      </div>

      <div className='flex flex-1 overflow-hidden'>
        {/* Left panel: Problem description & test cases */}
        <div className='flex flex-col w-1/2 border-r border-gray-300'>
          <div className='bg-gray-100 border-b border-gray-300'>
            <div className='flex'>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'description'
                    ? 'bg-white border-b-2 border-blue-500'
                    : ''
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`px-4 py-2 ${
                  activeTab === 'results'
                    ? 'bg-white border-b-2 border-blue-500'
                    : ''
                }`}
                onClick={() => setActiveTab('results')}
              >
                Results
              </button>
            </div>
          </div>

          <div className='flex-1 p-4 overflow-auto'>
            {activeTab === 'description' && (
              <div className='prose'>
                <div
                  dangerouslySetInnerHTML={{
                    __html: problem.description
                      .replace(/\n/g, '<br />')
                      .replace(/#{1,6} (.*)/g, '<h3>$1</h3>')
                  }}
                ></div>
              </div>
            )}

            {activeTab === 'results' && results && (
              <div>
                <div className='mb-4'>
                  <h3 className='mb-2 text-lg font-semibold'>Summary</h3>
                  <div className='p-3 bg-gray-100 rounded'>
                    <p>
                      <strong>Total Test Cases:</strong>{' '}
                      {results.totalTestCases}
                    </p>
                    <p className='text-green-600'>
                      <strong>Passed:</strong> {results.passedTestCases}
                    </p>
                    <p className='text-red-600'>
                      <strong>Failed:</strong> {results.failedTestCases}
                    </p>
                    <div className='h-4 mt-2 bg-gray-200 rounded-full'>
                      <div
                        className='h-4 bg-green-500 rounded-full'
                        style={{
                          width: `${
                            (results.passedTestCases / results.totalTestCases) *
                            100
                          }%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <h3 className='mb-2 text-lg font-semibold'>Details</h3>
                {results.testCaseResults?.map((result, index) => (
                  <div
                    key={index}
                    className={`mb-3 p-3 rounded border ${
                      result.passed
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className='flex justify-between'>
                      <strong>Test Case {result.testCase}</strong>
                      <span
                        className={`font-semibold ${
                          result.passed ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className='mt-2 text-sm'>
                      <div>
                        <strong>Input:</strong>{' '}
                        <code className='px-1 py-1 bg-gray-100 rounded'>
                          {result.input}
                        </code>
                      </div>
                      <div>
                        <strong>Expected:</strong>{' '}
                        <code className='px-1 py-1 bg-gray-100 rounded'>
                          {result.expectedOutput}
                        </code>
                      </div>
                      <div>
                        <strong>Actual:</strong>{' '}
                        <code className='px-1 py-1 bg-gray-100 rounded'>
                          {result.actualOutput || result.error || 'No output'}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: Code editor & controls */}
        <div className='flex flex-col w-1/2'>
          <div className='flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300'>
            <div>
              <select
                className='p-1 border rounded'
                value={language}
                onChange={e => setLanguage(parseInt(e.target.value))}
              >
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className={`px-4 py-1 rounded text-white ${
                isSubmitting ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={runCode}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className='flex items-center'>
                  <Loader className='w-4 h-4 mr-2 animate-spin' /> Running...
                </span>
              ) : (
                'Run Tests'
              )}
            </button>
          </div>

          <div className='flex-1 overflow-hidden'>
            <textarea
              className='w-full h-full p-4 font-mono text-sm text-gray-100 bg-gray-900 outline-none resize-none'
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck='false'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
