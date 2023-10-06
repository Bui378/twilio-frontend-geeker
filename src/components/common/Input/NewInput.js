// import { text } from "@fortawesome/fontawesome-svg-core"
import React from "react"
import '../../../style.css'
import styled from 'styled-components';
import FormItem from 'components/FormItem';
import Input from 'components/AuthLayout/Input';

const NewInput = ({type, name, placeHolder, onChange, value, password, marginTop, disable}) => {

    const reValidationObject = {firstName:/^[a-zA-Z ]*$/,
                                lastName:/^[a-zA-Z ]*$/,
                                nameOnCard: /^[a-zA-Z ]*$/,
                                password:/^(?=.*[a-z])(?=.*[0-9])(?=.*[\^$*.\[\]{}()?\-“!@#%&/,><’:;|_~`])\S{6,99}$/,
                                city: /^[a-zA-Z ]*$/,                                
                                state: /^[a-zA-Z ]*$/,
                                zip: /^[0-9]*$/,
                                // zip: /^[0-9]{10}$/ limit zip to 10 numbers 
                            }

    
    const validationMessages = {firstName:'No numbers or special characters are allowed',
                                lastName:'No numbers or special characters are allowed',
                                nameOnCard:'No numbers or special characters are allowed',
                                city:'No numbers or special characters are allowed',
                                state:'No numbers or special characters are allowed',
                                email:'Check the format of the email you entered',
                                password:'Passwords must include at least six numbers, letters, and special characters (like ! and &)',
                                confirmPassword: 'The two passwords that you entered do not match!',
                                zip: 'No characters or special characters are allowed'
                            }

    const nameForValidationMessage ={firstName: 'First Name',
                                     lastName: "Last Name",
                                     email:'E-Mail',
                                     password: 'Password',
                                     confirmPassword: 'Confirm Password',
                                     nameOnCard: 'Name on card',
                                     address: 'Address',
                                     city: 'City',
                                     state: 'State',
                                     zip:'Zip',
                                    }

    const lengthValidation = {firstName: 30,
                              lastName: 30,
                              nameOnCard: 30,
                              city:20,
                              state:20,
                              email: 70,}

    return (
    <RegForm

        name={name}
        rules={name !== 'extension' ? [
            {
                required: true,
                message: `Please input your ${nameForValidationMessage[name]}`,
            },
            name === 'email' &&
            {
                type: 'email',
                message: 'Check the format of the email you entered',
            },
            
            () => ({                
                validator(_, value) {
                    const re = reValidationObject[name];
                    if(re !== undefined && value !== undefined ){
                        if (!re.test(String(value))) {
                            return Promise.reject(
                                validationMessages[name],
                                );
                        }
                    }

                    if(name === 'firstName' || 'lastName' || 'email' || 'nameOnCard' || 'city' || 'state'){
                        if (value && value.length > lengthValidation[name]) {
                            return Promise.reject(`Maximum length is ${String(lengthValidation[name])} characters`);
                        }
                    }
                    if(password && password !== ''){
                        if(password !== value){
                            return Promise.reject('The two passwords that you entered do not match!')
                        }
                    }
                    return Promise.resolve(); 
                },
            }),
        ] : ""}
    >
        <RegInput
            type={type}
            name={name}
            size="small"
            placeholder={placeHolder}
            value={value}
            onChange= {onChange}
            className= {"newInput " + (disable ? "opacity-point-5" : "")}
            style={{marginTop}}
            disabled={disable}
            autoComplete="off"
        />
 
    </RegForm>)

}

export default NewInput

const RegForm = styled(FormItem)`
	&.ant-form-item-has-error {
		margin-bottom: 6px;
	}

`;

const RegInput = styled(Input)`
    background: #FFFFFF 0% 0% no-repeat padding-box !important;
    box-shadow: inset 0px 10px 10px #EEF5FA !important;
    border: 1px solid #DCE6ED !important;
    border-radius: 8px !important;
    opacity: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 75px !important;
    width: 100% !important;
    box-sizing: border-box;
    padding: 0 20px !important;
`;