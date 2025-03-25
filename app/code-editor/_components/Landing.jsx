"use client"
import { useEffect, useState } from 'react'
import { languageOptions } from '../_constants/languageOptions'
import useKeyPress from '../hooks/useKeyPress'
import { toast, ToastContainer } from 'react-toastify'
import CustomInput from './CustomInput'
import ThemeDropdown from './ThemeDropdown'
import CodeEditorWindow from './CodeEditorWindow'
import LanguageDropdown from './LanguageDropdown'
import OutputWindow from './OutputWindow'
import { classnames } from '../utils/general'
import { defineTheme } from '../lib/defineTheme'
import axios from 'axios'
import { FaRegLightbulb } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";


import OutputDetails from './OutputDetails'
import styles from '../css/content.module.css'
import { RiTimerLine } from "react-icons/ri";
import { IoMdDoneAll } from "react-icons/io";
import { ImCross } from "react-icons/im";




import {
   ResizableHandle,
   ResizablePanel,
   ResizablePanelGroup
} from '@/components/ui/resizable'

import { twoSumProblem } from '../utils/problems/two-sum'

const encodeBase64 = str => btoa(unescape(encodeURIComponent(str)))
const decodeBase64 = str => decodeURIComponent(escape(atob(str)))

const Landing = ({ mdxContent, frontMatter }) => {
   const [code, setCode] = useState(twoSumProblem.defaultCode)
   const [solutionCode, setSolutionCode] = useState(twoSumProblem.solutionCode)
   const [customInput, setCustomInput] = useState('')
   const [outputDetails, setOutputDetails] = useState(null)
   const [processing, setProcessing] = useState(null)
   const [theme, setTheme] = useState('Night Owl')
   const [language, setLanguage] = useState(languageOptions[0])
   const [showSolution, setShowSolution] = useState(false)
   const [results, setResults] = useState(null)
   const [activeTestCase, setActiveTestCase] = useState(null)
   const [isDark, setIsDark] = useState(false)

   const enterPress = useKeyPress('Enter')
   const ctrlPress = useKeyPress('Control')

   const onSelectChange = sl => {
      console.log('Selected option', sl)
      setLanguage(sl)
   }


   useEffect(() => {
      if (enterPress && ctrlPress) {
         console.log('enterPress', enterPress)
         console.log('ctrlPress', ctrlPress)

         handleCompile()
      }
   }, [enterPress, ctrlPress])

   const onChange = (action, data) => {
      switch (action) {
         case 'code': {
            setCode(data)
            break
         }
         default: {
            console.warn('case not handled!', action, data)
         }
      }
   }

   const runCode = async () => {
      setProcessing(true)

      console.log(twoSumProblem.generateTestCode(code))
      try {
         const testResults = await runCodeWithTestCases(
            twoSumProblem.generateTestCode(code),
            twoSumProblem.language,
            twoSumProblem.testCases
         )

         setResults(testResults)

      } catch (error) {
         console.log('Error Running Code', error)
         setResults({ error: 'Failed to run code' },)
      } finally {
         setProcessing(false)
      }
   }

   const runCodeWithTestCases = async (sourceCode, languageId, testCases) => {

      const submissions = []

      for (const [index, testCase] of testCases.entries()) {

         const options = {
            method: 'POST',
            url: process.env.NEXT_PUBLIC_RAPID_API_URL,
            params: { base64_encoded: 'true', fields: '*', wait: 'true' },
            headers: {
               'Content-Type': 'application/json',
               'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST,
               'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY
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
            setOutputDetails(response.data)
            submissions.push({
               testCase: index + 1,
               input: testCase.input,
               expectedOutput: testCase.expectedOutput,
               actualOutput: response.data.stdout ? decodeBase64(response.data.stdout) : '',
               status: response.data.status,
               passed: response.data.status.id === 3,
               details: response.data
            })
         } catch (error) {
            console.log('Error creating submission', error)
            submissions.push({
               testCase: index + 1,
               input: testCase.input,
               expectedOutput: testCase.expectedOutput,
               error: 'failed to execute test',
               passed: false
            })
         }
      }

      const summary = {
         totalTestCases: testCases.length,
         passedTestCases: submissions.filter(r => r.passed).length,
         failedTestCases: submissions.filter(r => !r.passed).length,
         testCaseResults: submissions
      }

      return summary
   }
   const handleCompile = () => {
      setProcessing(true)

      const formData = {
         language_id: language.id,

         source_code: btoa(code),
         stdin: btoa(customInput)
      }

      const options = {
         method: 'POST',
         url: process.env.NEXT_PUBLIC_RAPID_API_URL,
         params: { base64_encoded: 'true', fields: '*', wait: 'false' },
         headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST,
            'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY
         },
         data: formData
      }

      axios
         .request(options)
         .then(function (response) {
            console.log('res.data', response.data)
            const token = response.data.token
            checkStatus(token)
         })
         .catch(err => {
            let error = err.response ? err.response.data : err
            setProcessing(false)
            console.log(error)
         })
   }

   const checkStatus = async token => {
      const options = {
         method: 'GET',
         url: process.env.NEXT_PUBLIC_RAPID_API_URL + '/' + token,
         params: { base64_encoded: 'true', fields: '*' },
         headers: {
            'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY,
            'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST
         }
      }

      try {
         let response = await axios.request(options)
         let statusId = response.data.status?.id

         if (statusId === 1 || statusId === 2) {
            setTimeout(() => {
               checkStatus(token)
            }, 2000)
            return
         } else {
            setProcessing(false)
            setOutputDetails(response.data)
            showSuccessToast(`Compiled Successfully`)
            console.log('response.data', response.data)
            return
         }
      } catch (err) {
         console.log('err', err)
         setProcessing(false)
         showErrorToast()
      }
   }

   // const handleThemeChange = th => {
   //    const theme = th
   //    console.log('theme...', theme)

   //    if (['light', 'vs-dark'].includes(theme.value)) {
   //       setTheme(theme)
   //    } else {
   //       defineTheme(theme.value).then(_ => setTheme(theme))
   //    }
   // }

   // console.log(results)
   useEffect(() => {
      defineTheme('oceanic-next').then(_ =>
         setTheme({ value: 'oceanic-next', label: 'Oceanic Next' })
      )
   }, [])

   const showSuccessToast = msg => {
      toast.success(msg || `Compiled Successfully!`, {
         position: 'top-right',
         autoClose: 1000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
         progress: undefined
      })
   }
   const showErrorToast = msg => {
      toast.error(msg || `Something went wrong! Please try again.`, {
         position: 'top-right',
         autoClose: 1000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
         progress: undefined
      })
   }
   return (
      <div className={`h-[98%] ${isDark ? 'text-secondary bg-primary' : 'text-primary bg-secondary'}`}>
         <ToastContainer
            position='top-right'
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
         />
         <div className='flex flex-row items-center justify-end gap-10 border'>
            <button
               onClick={() => setIsDark(!isDark)}
               className={` p-2 rounded-sm ${isDark ? 'bg-primary' : 'bg-secondary'}`}>
               {isDark ? <FaRegLightbulb /> : <MdDarkMode />}
            </button>
            <div className='px-4 py-2'>
               <LanguageDropdown onSelectChange={onSelectChange} />
            </div>
            {/* <div className='px-4 py-2'>
               <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
            </div> */}
         </div>
         <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel>
               <div className='h-full px-4 overflow-scroll'>
                  <h1 className={`my-2 text-4xl font-bold ${isDark ? 'text-secondary' : 'text-primary'}`}>Lesson</h1>
                  <h1 className='text-2xl font-bold'>{frontMatter.title}</h1>
                  <section className='markdown'>{mdxContent}</section>
               </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
               <ResizablePanelGroup direction='vertical'>
                  <ResizablePanel>
                     <div className='flex h-full border border-y-0'>

                        <div className={`${showSolution ? 'w-[50%]' : 'w-[100%]'} flex flex-col`}>
                           <h1 className='my-2 ml-8 text-2xl font-bold '>Code Editor</h1>
                           <CodeEditorWindow
                              code={code}
                              onChange={onChange}
                              language={language.value}
                              theme={isDark ? 'merbivore-soft' : 'eiffel'}
                           />
                        </div>
                        {showSolution && (
                           <div className='w-[50%] border border-y-0 flex flex-col'>
                              <h1 className='my-2 ml-8 text-2xl font-bold '>Solution Code</h1>
                              <CodeEditorWindow
                                 code={solutionCode}
                                 language={language.value}
                                 theme={isDark ? 'merbivore-soft' : 'eiffel'} />
                           </div>
                        )}
                     </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel>
                     <div className='h-full border'>
                        <div className='flex items-center h-12 gap-2 pl-2 text-sm font-bold border'>
                           <button
                              title='submit'
                              className='z-10 px-4 py-1 text-black bg-yellow-300 border-2 border-black rounded-full hover:shadow'
                           >
                              Submit
                           </button>
                           <button
                              title='ctrl + enter'
                              onClick={runCode}
                              disabled={!code}
                              className={classnames(
                                 ' bg-gray-100 border-2 border-black text-black z-10 rounded-full px-4 py-1 hover:shadow',
                                 !code ? 'opacity-50' : ''
                              )}
                           >
                              {processing ? 'Processing...' : 'Run'}
                           </button>
                           <button
                              title='solution'
                              onClick={() => setShowSolution(!showSolution)}
                              className={`z-10 px-4 py-1 text-black ${showSolution ? 'bg-yellow-300' : 'bg-white'
                                 } border-2 border-black rounded-full hover:shadow`}
                           >
                              Solution
                           </button>
                        </div>
                        <div className='w-full border h-[40%] '>
                           <OutputWindow outputDetails={outputDetails} />
                        </div>
                        <div>

                           <div className=' h-[50%] flex items-start gap-4 p-4 border'>
                              {
                                 results ? results.testCaseResults?.map((res, index) => (

                                    <div key={index} className=' w-[3/12] rounded-md  flex flex-col items-center justify-between'>
                                       <button className={`font-bold text-center px-2 rounded-md py-2 ${isDark ? 'bg-stone-800' : 'bg-slate-400'}`} onClick={() => setActiveTestCase(res)}>Test Case {index + 1}</button>
                                       {/* <p className='mb-4 text-2xl'>{res.passed ? <IoMdDoneAll className='font-bold text-green-800' /> : <ImCross className='text-red-700' />}</p> */}
                                    </div>

                                 )) : ''
                              }
                           </div>
                           <div className={`${activeTestCase ? "p-4" : "hidden"}`}>
                              <ShowTestDetails testCase={activeTestCase} isDark={isDark} />
                           </div>
                        </div>
                     </div>
                  </ResizablePanel>
               </ResizablePanelGroup>
            </ResizablePanel>
         </ResizablePanelGroup>
      </div>
   )
}

const ShowTestDetails = ({ testCase, isDark }) => {
   console.log(testCase)
   // className={`flex flex-col gap-2 ${isDark ? 'text-secondary bg-primary' : 'text-primary bg-secondary'}`}
   return (
      <div className={`flex flex-col gap-2 ${isDark ? 'text-secondary' : 'text-primary bg-secondary'}`}>
         <p><span className='font-bold'>Input: </span><span className='px-2 py-1 rounded-md'> {testCase?.input || 'N/A'}</span></p>
         <p><span className='font-bold'>Actual Output: </span><span className='px-2 py-1 rounded-md'> {testCase?.actualOutput || 'N/A'}</span></p>
         <p><span className='font-bold'>Expected Output: </span><span className='px-2 py-1 rounded-md'> {testCase?.expectedOutput || 'N/A'}</span></p>

      </div>
   )
}

export default Landing
