// app/venues/page.js

"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient'; // Adjust the import as needed
import Link from 'next/link';

const VenueList = () => {
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState(null);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [newImages, setNewImages] = useState([]); // State for multiple images
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0); // State for the featured image index
  const [filter, setFilter] = useState('all'); // State for filter option
  const [sortOption, setSortOption] = useState('name'); // State for sort option

  useEffect(() => {
    const fetchVenues = async () => {
      const { data, error } = await supabase.from('venues').select('*');
      if (error) {
        setError(error.message);
      } else {
        setVenues(data);
      }
    };

    fetchVenues();
  }, []);

  const handleAddImage = (venueId) => {
    setSelectedVenueId(venueId);
    setIsModalOpen(true);
  };

  const handleImageUpload = async () => {
    if (newImages.length === 0 || !selectedVenueId) {
      return;
    }

    try {
      const uploadedImageUrls = []; // To store the public URLs of uploaded images
      
      // Loop through each image and upload
      for (const image of newImages) {
        // Upload image to the specified bucket
        const { data, error } = await supabase.storage
          .from('assets') // Replace with your bucket name
          .upload(`venues/${selectedVenueId}/${image.name}`, image);

        if (error) throw new Error(error.message);

        // Construct the public URL for the uploaded image
        const { publicURL, error: urlError } = supabase.storage
          .from('assets')
          .getPublicUrl(`venues/${selectedVenueId}/${image.name}`);

        if (urlError) throw new Error(urlError.message);

        uploadedImageUrls.push(publicURL); // Store the public URL
      }

      // Update the venue record with the new image URLs
      const { data: updatedVenue, error: updateError } = await supabase
        .from('venues')
        .update({
          image_url: uploadedImageUrls // Update image_url with array of new URLs
        })
        .eq('id', selectedVenueId);

      if (updateError) throw new Error(updateError.message);

      // Reset state and fetch updated venue list
      setIsModalOpen(false);
      setNewImages([]);
      setFeaturedImageIndex(0); // Reset featured image index
      fetchVenues();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtered venues based on the selected filter
  const filteredVenues = venues.filter((venue) => {
    if (filter === 'with-image') {
      return venue.image_url && venue.image_url.length > 0;
    }
    if (filter === 'without-image') {
      return !venue.image_url || venue.image_url.length === 0;
    }
    return true; // Show all venues for 'all' filter
  });

  // Sort the filtered venues based on the selected sort option
  const sortedVenues = filteredVenues.sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === '') {
      return a.location.localeCompare(b.location);
    } else if (sortOption === 'id') {
      return a.id - b.id;
    }
    return 0; // Default case
  });

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Venue List</h1>
      
      {error && <p className="text-red-600">{error}</p>}

      {/* Filter options */}
      <div className="mb-4">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          className="border rounded p-2 mr-4"
        >
          <option value="all">All Venues</option>
          <option value="with-image">Venues with Images</option>
          <option value="without-image">Venues without Images</option>
        </select>

        {/* Sort options */}
        <select 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)} 
          className="border rounded p-2"
        >
          <option value="name">Sort by Name</option>
          <option value="location">Sort by Location</option>
          <option value="id">Sort by ID</option>
        </select>
      </div>
      
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border-b">ID</th>
            <th className="border-b">Name</th>
            {/* <th className="border-b">Location</th> */}
            <th className="border-b">Image</th>
            <th className="border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedVenues.map((venue) => (
            <tr key={venue.id}>
              <td className="border-b">{venue.id}</td>
              <td className="border-b">{venue.name}</td>
              <td className="border-b">{venue.location}</td>
              <td className="border-b">
                <div className="flex gap-2">
                  {venue.image_url && venue.image_url.length > 0 ? 
                    <img 
                      src={venue.image_url[0]} 
                      alt={`Image for ${venue.name}`} 
                      className="h-16 w-16 object-cover rounded" 
                    />
                  : 
                    <span>No image available</span>
                  }
                  <button 
                    onClick={() => handleAddImage(venue.id)} 
                    className="text-blue-600 hover:underline"
                  >
                    Add Image
                  </button>
                </div>
              </td>
              <td className="border-b">
                <Link href={`/venues/${venue.id}`}>
                  <button className="text-blue-600 hover:underline">
                    Edit
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for adding images */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Upload Images for Venue</h2>
            <input 
              type="file" 
              onChange={(e) => setNewImages(Array.from(e.target.files))} 
              accept="image/*" 
              multiple // Allow multiple file selection
              className="mb-4"
            />
            <div className="mb-4">
              <h3 className="font-semibold">Select Featured Image:</h3>
              <div className="flex flex-col gap-2">
                {newImages.map((image, index) => (
                  <div key={index} className="flex items-center">
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`Preview ${index}`} 
                      className="h-16 w-16 object-cover rounded mr-2"
                    />
                    <button 
                      onClick={() => setFeaturedImageIndex(index)} 
                      className={`border px-2 py-1 rounded ${featuredImageIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      {featuredImageIndex === index ? 'Featured' : 'Set as Featured'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleImageUpload} 
                className="mr-2 text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Upload
              </button>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueList;
