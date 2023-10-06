import React from "react"

const InputField = ({onChange, style, name, propClass, divPropClass, placeholder, defaultValue, disable, value,id}) => {
    return<div className={divPropClass}>
        <input 
            id={id}
            type="text" 
            className={`business-plan-input max-width-768-w-100per ${propClass}`} 
            onChange={(e)=>onChange(e)} style={style} 
            name={name} placeholder={placeholder} 
            defaultValue={defaultValue} 
            disabled={disable} 
            value={value} 
        />
    </div>
}

export default InputField