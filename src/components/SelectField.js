import React from 'react';
import { Label } from './ui/label';
import { Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue, } from './ui/select';

const SelectField = ({ label, value, onChange, options, required }) => (
  <div className="flex flex-col gap-2">
    

    <Select>
      <SelectTrigger className="w-[180px]">
      <Label htmlFor={`select-${label}`} className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
        {/* <SelectValue placeholder="Select a fruit" /> */}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
        {options.map((option) => (
          <SelectLabel 
            key={option.location_id ? option.location_id : option.id} // Ensure this is unique
            value={option.location_id ? option.location_id : option.id}
            className="cursor-pointer hover:bg-blue-100 transition duration-200 px-4 py-2 text-gray-900"
          >
            {option.name}
          </SelectLabel>
        ))}
        </SelectGroup>
      </SelectContent>
    </Select>
    {/* <Select value={value} onChange={onChange} required={required}>
      <SelectTrigger className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200">
        <SelectValue placeholder={`Select a ${label}`} />
      </SelectTrigger>
      <SelectGroup>
        {options.map((option) => (
          <SelectLabel 
            key={option.location_id ? option.location_id : option.id} // Ensure this is unique
            value={option.location_id ? option.location_id : option.id}
            className="cursor-pointer hover:bg-blue-100 transition duration-200 px-4 py-2 text-gray-900"
          >
            {option.name}
          </SelectLabel>
        ))}
      </SelectGroup>
    </Select> */}
  </div>
);

export default SelectField;
