import React from 'react';

const ColumnInput = ({ column }) => {
  return (
    <div className="mb-4">
      <label htmlFor={column.column_name} className="block mb-2 font-medium">{column.column_name}</label>
      <input
        id={column.column_name}
        name={column.column_name}
        type={column.data_type === 'text' ? 'text' : 'number'} // Adjust based on your data types
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
      />
    </div>
  );
};

export default ColumnInput;
