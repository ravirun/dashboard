import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';

const InputField = ({ label, value, onChange, required, type = 'text', disabled = false, name, placeHolder}) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor={name} className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      id={name} // Add the id attribute for accessibility
      name={name} // Add the name attribute for identification
      type={type}
      value={value}
      onChange={onChange} // This should be handled in the parent component
      required={required}
      disabled={disabled}
      className={`mt-1 block w-full ${disabled ? 'border-gray-300' : 'border-gray-300 hover:border-gray-400'} rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none`}
      aria-required={required}
      aria-disabled={disabled}
      placeHolder={placeHolder }
    />
  </div>
);

export default InputField;
