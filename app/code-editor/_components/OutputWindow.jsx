import React from "react";

const OutputWindow = ({ outputDetails }) => {
   const getOutput = () => {
      let statusId = outputDetails?.status?.id;

      if (statusId === 6) {
         // compilation error
         return (
            <pre className="px-2 py-1 text-xs font-normal text-red-500">
               {atob(outputDetails?.compile_output)}
            </pre>
         );
      } else if (statusId === 3) {
         return (
            <pre className="px-2 py-1 text-xs font-normal text-green-500">
               {atob(outputDetails.stdout) !== null
                  ? `${atob(outputDetails.stdout)}`
                  : null}
            </pre>
         );
      } else if (statusId === 5) {
         return (
            <pre className="px-2 py-1 text-xs font-normal text-red-500">
               {`Time Limit Exceeded`}
            </pre>
         );
      } else {
         return (
            <pre className="px-2 py-1 text-xs font-normal text-red-500">
               {atob(outputDetails?.stderr)}
            </pre>
         );
      }
   };
   return (
      <>
         <div className="w-full h-full overflow-y-auto text-sm font-normal bg-transparent">
            {outputDetails ? <>{getOutput()}</> : null}
         </div>
      </>
   );
};

export default OutputWindow;