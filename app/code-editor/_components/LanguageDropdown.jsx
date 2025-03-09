import React from 'react'
import Select from 'react-select'
import { languageOptions } from '../_constants/languageOptions'
import { customStyles } from '../_constants/customStyles'
function LanguageDropdown({ onSelectChange }) {
   return (
      <div>
         <Select
            placeholder={"Filter by Category"}
            options={languageOptions}
            defaultValue={languageOptions[0]}
            styles={customStyles}
            onChange={(selectedOption) => onSelectChange(selectedOption)}
         />
      </div>
   )
}

export default LanguageDropdown