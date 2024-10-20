"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import ImageUpload from '@/components/ImageUpload';
import InputField from '@/components/InputField';
import SelectField from '@/components/SelectField';

export default function Home() {
  const [formData, setFormData] = useState({});
  const [columns, setColumns] = useState([]);
  const [columnTypes, setColumnTypes] = useState({}); // Store column types
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [category, setCategory] = useState(1);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [maxVenueId, setMaxVenueId] = useState(0);
  const [venueTypes, setVenueTypes] = useState([]);
  const [selectedVenueType, setSelectedVenueType] = useState([]); // Initialize as an empty array
  const [imageUrls, setImageUrls] = useState([]);
  const [errorField, setErrorField] = useState(null); // Added to track the field with error

  useEffect(() => {
    fetchLocations();
    fetchMaxVenueId();
    fetchVenueTypes();
    fetchColumns();
    fetchColumnTypes(); // Fetch column types
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) setError(`Error fetching locations: ${error.message}`);
      else setLocations(data);
    } catch (error) {
      setError(`Error fetching locations: ${error.message}`);
    }
  };

  const fetchMaxVenueId = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      if (error) setError(`Error fetching max venue ID: ${error.message}`);
      else setMaxVenueId(data[0]?.id || 0);
    } catch (error) {
      setError(`Error fetching max venue ID: ${error.message}`);
    }
  };

  const fetchVenueTypes = async () => {
    try {
      const { data, error } = await supabase.from('venue_types').select('*');
      if (error) setError(`Error fetching venue types: ${error.message}`);
      else setVenueTypes(data);
    } catch (error) {
      setError(`Error fetching venue types: ${error.message}`);
    }
  };

  const fetchColumns = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .limit(1);
      if (error) setError(`Error fetching columns: ${error.message}`);
      else setColumns(Object.keys(data[0] || {}));
    } catch (error) {
      setError(`Error fetching columns: ${error.message}`);
    }
  };

  const fetchColumnTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*, id(*)')
        .limit(1);
      if (error) setError(`Error fetching column types: ${error.message}`);
      else {
        const columnTypes = data[0] ? Object.keys(data[0]).reduce((acc, key) => {
          const type = typeof data[0][key];
          acc[key] = type;
          return acc;
        }, {}) : {};
        setColumnTypes(columnTypes);
      }
    } catch (error) {
      setError(`Error fetching column types: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorField(null); // Clear error field on change
  };

  const generateSlug = async (name) => {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      let uniqueSlug = slug;

      const { data: existingVenues, error } = await supabase
        .from('venues')
        .select('slug')
        .ilike('slug', `${slug}%`);

      if (error) {
        throw new Error(`Error generating slug: ${error.message}`);
      }

      if (existingVenues.length > 0) {
        let count = 1;
        while (existingVenues.some(venue => venue.slug === uniqueSlug)) {
          uniqueSlug = `${slug}-${count}`;
          count++;
        }
      }

      return uniqueSlug;
    } catch (error) {
      setError(`Error generating slug: ${error.message}`);
      throw error; // Rethrow the error to be caught by the handleSubmit function
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const venueId = maxVenueId + 1;

    // Check if the name is provided
    if (!formData.name) {
      setError('Name is required');
      setErrorField('name'); // Highlight the name field if error
      return; // Stop submission if name is not provided
    }

    console.log("Form Data Submitted:", formData); // Log form data

    try {
      const slug = await generateSlug(formData.name); // Use formData.name

      const { error: venueError } = await supabase
        .from('venues')
        .insert([{ 
          ...formData, // Use the whole formData object
          id: venueId,
          locations: selectedLocation,
          category,
          slug,
          image_url: imageUrls,
          created_at: new Date().toISOString(),
        }]);

      if (venueError) throw new Error(`Error inserting venue: ${venueError.message}`);

      // Ensure selectedVenueType is an array of integers
      const venueTypeInserts = Array.isArray(selectedVenueType) // Ensure selectedVenueType is an array
        ? selectedVenueType.map((typeId) => ({
            venue_id: venueId,
            venue_type_id: parseInt(typeId, 10), // Ensure typeId is an integer
          }))
        : []; // Fallback to an empty array if not

      const { error: venueTypeError } = await supabase
        .from('venues_venue_types')
        .insert(venueTypeInserts);

      if (venueTypeError) throw new Error(`Error inserting venue types: ${venueTypeError.message}`);

      setSuccess("Venue and venue type added successfully!");
      clearForm();
    } catch (err) {
      setError(`Error submitting form: ${err.message}`);
      setErrorField(err.message.split(':')[0]); // Highlight the field with error
    }
  };

  const clearForm = () => {
    setFormData({});
    setSelectedLocation('');
    setCategory(1);
    setSelectedVenueType([]); // Clear selected venue types
    setImageUrls([]); // Clear image URLs
    setErrorField(null); // Clear error field on form clear
  };
  const handleUploadSuccess = (newImageUrls) => {
    setImageUrls(newImageUrls);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 border-2 rounded p-4 border-gray-300">
      <form onSubmit={handleSubmit} className="space-y-4 md:flex items-center justify-between">
       <div className=' '>

       <div >
        <InputField
          label="Name" // Ensure you have a name field
          name="name"
          value={formData.name || ''} // Ensure it's an empty string if undefined
          onChange={handleChange}
          required
          focus={errorField === 'name'} // Highlight the input box by adding a focus state if error
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ID <span className="text-red-500">*</span>
          </label>
          <InputField
            name="id"
            value={maxVenueId + 1}
            onChange={handleChange}
            disabled
          />
        </div>

        {columns.map((column) => {
          if (['id','name', 'created_at', "locations", 'category', 'longitude', 'latitude', 'faqs', 'slug', 'image_url'].includes(column)) return null;

          const isRequired = column !== 'optional_column_name'; 
          const defaultValue = column === 'status' ? 'true' : '';
          const Component = columnTypes[column] === 'number' ? InputField : InputField; // Dynamically choose component based on column type
          return (
            <Component
              key={column}
              label={column.charAt(0).toUpperCase() + column.slice(1)}
              name={column}
              value={formData[column] || defaultValue}
              onChange={handleChange}
              required={isRequired}
              disabled={['created_at'].includes(column)} 
              focus={errorField === column} // Highlight the input box by adding a focus state if error
            />
          );
        })}

        <SelectField 
          label="Locations" 
          value={selectedLocation} 
          onChange={setSelectedLocation} 
          options={locations} 
          required 
          focus={errorField === 'selectedLocation'} // Highlight the select box by adding a focus state if error
        />
        <InputField label="Category" type="number" value={category} onChange={(e) => setCategory(e.target.value)} required focus={errorField === 'category'} />
        
        <SelectField 
          label="Venue Type" 
          value={selectedVenueType} 
          onChange={setSelectedVenueType} 
          options={venueTypes} 
          required 
          focus={errorField === 'selectedVenueType'} // Highlight the select box by adding a focus state if error
        />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Add Venue
        </button>
       </div>
<ImageUpload venueId={maxVenueId + 1} onUploadSuccess={handleUploadSuccess} />
       
      </form>

      

      {success && <p className="mt-2 text-green-600">{success}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
