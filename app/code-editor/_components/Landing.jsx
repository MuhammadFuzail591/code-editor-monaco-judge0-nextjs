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
import OutputDetails from './OutputDetails'

import {
   ResizableHandle,
   ResizablePanel,
   ResizablePanelGroup
} from '@/components/ui/resizable'

import MdxProvider from './MdxRenderer'

const javascriptDefault = `// This is javascript hello`


const Landing = ({ mdxContent }) => {
   const [code, setCode] = useState(javascriptDefault)
   const [solutionCode, setSolutionCode] = useState('//Default Solution code')
   const [customInput, setCustomInput] = useState('')
   const [outputDetails, setOutputDetails] = useState(null)
   const [processing, setProcessing] = useState(null)
   const [theme, setTheme] = useState('cobalt')
   const [language, setLanguage] = useState(languageOptions[0])
   const [showSolution, setShowSolution] = useState(false)
   const [content, setContent] = useState(
      `
# Hello world!

This is the content of an MDX file.

- Yes
- it
- is
  `
   )

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

   const handleThemeChange = th => {
      const theme = th
      console.log('theme...', theme)

      if (['light', 'vs-dark'].includes(theme.value)) {
         setTheme(theme)
      } else {
         defineTheme(theme.value).then(_ => setTheme(theme))
      }
   }

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
      <div className='h-[93vh]'>
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
         <div className='flex flex-row border'>
            <div className='px-4 py-2'>
               <LanguageDropdown onSelectChange={onSelectChange} />
            </div>
            <div className='px-4 py-2'>
               <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
            </div>
         </div>
         <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel>
               <div className='h-full px-1 bg-gray-500 '>
                  {mdxContent}
               </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
               <ResizablePanelGroup direction='vertical'>
                  <ResizablePanel>
                     <div className='flex h-full border border-y-0'>
                        <div className={`${showSolution ? 'w-[50%]' : 'w-[100%]'}`}>
                           <CodeEditorWindow
                              code={code}
                              onChange={onChange}
                              language={language.value}
                              theme={theme.value}
                           />
                        </div>
                        {showSolution && (
                           <div className='w-[50%] border border-y-0'>
                              <CodeEditorWindow
                                 code={solutionCode}
                                 onChange={onChange}
                                 language={language.value}
                                 theme={theme.value}
                              />
                           </div>
                        )}
                     </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel>
                     <div className='h-full border '>
                        <div className='flex items-center h-12 gap-2 pl-2 text-sm font-bold border'>
                           <button
                              title='submit'
                              className='z-10 px-4 py-1 text-black bg-yellow-300 border-2 border-black rounded-full hover:shadow'
                           >
                              Submit
                           </button>
                           <button
                              title='ctrl + enter'
                              onClick={handleCompile}
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
                        <div className='w-full h-full'>
                           <OutputWindow outputDetails={outputDetails} />
                        </div>
                     </div>
                  </ResizablePanel>
               </ResizablePanelGroup>
            </ResizablePanel>
         </ResizablePanelGroup>
      </div>
   )
}

export default Landing
