"use client"; // Ensure this is at the top for client components
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' for routing in the app directory
import { supabase } from '@/utils/supabaseClient'; // Ensure this path is correct
import InputField from '@/components/InputField'; // Assuming you have this component

const EditVenue = () => {
  const router = useRouter();
  const [venueData, setVenueData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [venueId, setVenueId] = useState(null); // Initialize venueId

  useEffect(() => {
    // Check if the router is ready before accessing query
    const fetchVenueData = async () => {
      if (!router.isReady) return; // Wait for the router to be ready

      const { venueId } = router.query; // Destructure venueId from router query
      if (!venueId) return; // Exit if venueId is not available

      setVenueId(venueId); // Set the venueId state

      console.log(`Fetching venue with ID: ${venueId}`); // Debug log

      // Fetch the venue data from Supabase
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (error) {
        setError(error.message);
        console.error("Fetch error:", error); // Debug log for errors
      } else {
        console.log("Fetched venue data:", data); // Debug log for fetched data

        // Constructing the public URL for images
        const imageBucket = 'assets'; // Replace with your actual bucket name
        if (data.image_url && Array.isArray(data.image_url)) {
          data.image_url = data.image_url.map(imagePath => {
            return `https://your-supabase-url/storage/v1/object/public/${imageBucket}/${imagePath}`;
          });
        }
        setVenueData(data);
      }
    };

    fetchVenueData();
  }, [router]); // Only re-run if the router changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVenueData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('venues')
      .update(venueData)
      .eq('id', venueId);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Venue updated successfully!');
      setError(null); // Clear any previous errors
    }
  };

  if (!venueData) return <div>Loading...</div>; // Show loading while fetching data

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Edit Venue</h1>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Name"
          name="name"
          value={venueData.name}
          onChange={handleChange}
          required
        />
        <InputField
          label="Location"
          name="location"
          value={venueData.location}
          onChange={handleChange}
          required
        />
        {/* Display images if available */}
        {venueData.image_url && venueData.image_url.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Images:</h3>
            <div className="flex gap-2">
              {venueData.image_url.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="h-20 w-20 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}
        {/* Add more fields as necessary */}
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Update Venue
        </button>
      </form>
    </div>
  );
};

export default EditVenue;
