import { useEffect, useState } from "react"
import { languageOptions } from "../_constants/languageOptions"
import useKeyPress from "../hooks/useKeyPress"
import { toast, ToastContainer } from "react-toastify"
import CustomInput from "./CustomInput"
import ThemeDropdown from "./ThemeDropdown"
import CodeEditorWindow from "./CodeEditorWindow"
import LanguageDropdown from "./LanguageDropdown"
import OutputWindow from "./OutputWindow"
import { classnames } from "../utils/general"
import { defineTheme } from "../lib/defineTheme"
// import { headers } from "next/headers"
import axios from "axios"
import OutputDetails from "./OutputDetails"

const javascriptDefault = `// This is javascript hello`
const Landing = () => {
   const [code, setCode] = useState(javascriptDefault)
   const [customInput, setCustomInput] = useState("")
   const [outputDetails, setOutputDetails] = useState(null)
   const [processing, setProcessing] = useState(null)
   const [theme, setTheme] = useState("cobalt")
   const [language, setLanguage] = useState(languageOptions[0])

   const enterPress = useKeyPress("Enter");
   const ctrlPress = useKeyPress("Control");

   const onSelectChange = (sl) => {
      console.log("Selected option", sl)
      setLanguage(sl)
   }

   useEffect(() => {
      if (enterPress && ctrlPress) {
         console.log("enterPress", enterPress)
         console.log("ctrlPress", ctrlPress)

         handleCompile();
      }
   }, [enterPress, ctrlPress])

   const onChange = (action, data) => {
      switch (action) {
         case "code": {
            setCode(data)
            break;
         }
         default: {
            console.warn("case not handled!", action, data);
         }
      }
   }

   const handleCompile = () => {

      setProcessing(true);

      const formData = {
         language_id: language.id,

         source_code: btoa(code),
         stdin: btoa(customInput)
      }

      const options = {
         method: "POST",
         url: process.env.NEXT_PUBLIC_RAPID_API_URL,
         params: { base64_encoded: "true", fields: "*", wait: 'false' },
         headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPID_API_HOST,
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPID_API_KEY,
         },
         data: formData
      }

      axios
         .request(options)
         .then(function (response) {
            console.log("res.data", response.data);
            const token = response.data.token;
            checkStatus(token)
         })
         .catch((err) => {
            let error = err.response ? err.response.data : err;
            setProcessing(false);
            console.log(error)
         })

   }

   const checkStatus = async (token) => {

      const options = {
         method: "GET",
         url: process.env.NEXT_PUBLIC_RAPID_API_URL + "/" + token,
         params: { base64_encoded: "true", fields: "*" },
         headers: {
            'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPID_API_KEY,
            'x-rapidapi-host': process.env.NEXT_PUBLIC_RAPID_API_HOST
         }
      }

      try {
         let response = await axios.request(options);
         let statusId = response.data.status?.id;

         if (statusId === 1 || statusId === 2) {
            setTimeout(() => {
               checkStatus(token)
            }, 2000)
            return
         }else{
            setProcessing(false)
            setOutputDetails(response.data)
            showSuccessToast(`Compiled Successfully`)
            console.log('response.data', response.data)
            return
         }
      }
      catch (err){
         console.log("err", err);
         setProcessing(false)
         showErrorToast();
      }
   }

   const handleThemeChange = (th) => {

      const theme = th;
      console.log("theme...", theme);

      if (["light", "vs-dark"].includes(theme.value)) {
         setTheme(theme)
      } else {
         defineTheme(theme.value).then((_) => setTheme(theme))
      }
   }

   useEffect(() => {
      defineTheme("oceanic-next").then((_) =>
         setTheme({ value: "oceanic-next", label: "Oceanic Next" })
      );
   }, []);

   const showSuccessToast = (msg) => {
      toast.success(msg || `Compiled Successfully!`, {
         position: "top-right",
         autoClose: 1000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
         progress: undefined,
      });
   };
   const showErrorToast = (msg) => {
      toast.error(msg || `Something went wrong! Please try again.`, {
         position: "top-right",
         autoClose: 1000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
         progress: undefined,
      });
   };


   return (
      <>
         <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
         />

         <div className="w-full h-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"></div>
         <div className="flex flex-row">
            <div className="px-4 py-2">
               <LanguageDropdown onSelectChange={onSelectChange} />
            </div>
            <div className="px-4 py-2">
               <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
            </div>
         </div>
         <div className="flex flex-row items-start px-4 py-4 space-x-4">
            <div className="flex flex-col items-end justify-start w-full h-full">
               <CodeEditorWindow
                  code={code}
                  onChange={onChange}
                  language={language.value}
                  theme={theme.value}
               />
            </div>

            <div className="right-container flex flex-shrink-0 w-[30%] flex-col">
               <OutputWindow outputDetails={outputDetails} />
               <div className="flex flex-col items-end">
                  {/* <CustomInput
                     customInput={customInput}
                     setCustomInput={setCustomInput}
                  /> */}
                  <button
                     onClick={handleCompile}
                     disabled={!code}
                     className={classnames(
                        "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 flex-shrink-0",
                        !code ? "opacity-50" : ""
                     )}
                  >
                     {processing ? "Processing..." : "Compile and Execute"}
                  </button>
               </div>
               {outputDetails && <OutputDetails outputDetails={outputDetails} />}
            </div>
         </div>
      </>
   )
}


export default Landing