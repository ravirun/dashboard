import React, { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

const NewColumnInput = ({ fetchColumns }) => {
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const addNewColumn = async () => {
    const { error } = await supabase.rpc('add_column_to_table', {
      table_name: 'venues',
      column_name: newColumnName,
      column_type: newColumnType
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("New column added successfully!");
      setNewColumnName('');
      setNewColumnType('text');
      fetchColumns(); // Refresh column list
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">Add New Column</h2>
      <div className="mb-4">
        <label className="block mb-2">Column Name</label>
        <input
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Column Type</label>
        <select
          value={newColumnType}
          onChange={(e) => setNewColumnType(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          {/* Add more types as needed */}
        </select>
      </div>
      <button
        onClick={addNewColumn}
        className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
      >
        Add Column
      </button>
      {success && <p className="mt-2 text-green-600">{success}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
};

export default NewColumnInput;
