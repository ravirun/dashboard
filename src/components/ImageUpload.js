import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';

const ImageUpload = ({ venueId, onUploadSuccess }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [imageUrls, setImageUrls] = useState([]); // Added to store image URLs

  useEffect(() => {
    const fetchExistingImages = async () => {
      const { data, error } = await supabase.storage
        .from('assets')
        .list(`venues/${venueId}`, {
          prefix: '',
          delimiter: '/',
          startAfter: '',
        });

      if (error) {
        setError(error.message);
      } else {
        const existingImages = data.map(image => image.name);
        setSelectedImages(existingImages.map(imageName => ({
          name: imageName,
          status: 'existing',
        })));

        // Fetch and set previews for existing images
        const promises = existingImages.map(async (imageName) => {
          const { data: imageData, error: imageError } = await supabase.storage
            .from('assets')
            .download(`venues/${venueId}/${imageName}`);
          if (imageError) {
            setError(imageError.message);
          } else {
            const url = URL.createObjectURL(imageData); // Create a URL for the image data
            return { name: imageName, url };
          }
        });
        
        Promise.all(promises).then((previews) => {
          const previewsObj = previews.reduce((acc, curr) => {
            acc[curr.name] = curr.url;
            return acc;
          }, {});
          setImagePreviews(previewsObj);
          setImageUrls(existingImages.map(name => `venues/${venueId}/${name}`)); // Store URLs for existing images
        });
      }
    };

    fetchExistingImages();
  }, [venueId]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    setError(null); // Clear any previous error

    const newImageUrls = []; // Store URLs of new images

    for (const file of files) {
      setUploadStatus(prevState => ({
        ...prevState,
        [file.name]: 'uploading'
      }));

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(`venues/${venueId}/${file.name}`, file);

      if (error) {
        setError(error.message);
        setUploadStatus(prevState => ({
          ...prevState,
          [file.name]: 'failed'
        }));
        continue;
      }

      setUploadStatus(prevState => ({
        ...prevState,
        [file.name]: 'success'
      }));

      const imageUrl = `venues/${venueId}/${file.name}`; // Construct the image URL
      newImageUrls.push(imageUrl); // Add the new image URL to the list
      onUploadSuccess(newImageUrls); // Call the callback with the new image URLs

      // Set preview for the uploaded image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prevState => ({
          ...prevState,
          [file.name]: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }

    setUploading(false);
    setSelectedImages(prevState => [...prevState, ...files.map(file => ({
      name: file.name,
      status: 'success',
    }))]);

    // Update the state with the new image URLs
    setImageUrls(prevState => [...prevState, ...newImageUrls]);
  };

  const handleDeleteImage = async (file) => {
    const { error } = await supabase.storage
      .from('assets')
      .remove(`venues/${venueId}/${file.name}`);

    if (error) {
      setError(error.message);
    } else {
      setSelectedImages(prevState => prevState.filter(image => image.name !== file.name));
      setUploadStatus(prevState => {
        const { [file.name]: _, ...rest } = prevState;
        return rest;
      });
      // Remove preview for the deleted image
      setImagePreviews(prevState => {
        const { [file.name]: _, ...rest } = prevState;
        return rest;
      });

      // Update the image URLs state after deletion
      setImageUrls(prevState => prevState.filter(url => !url.includes(file.name)));
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">Upload Venue Images</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        multiple
        className="mb-4"
      />
      {selectedImages.map((file) => (
        <div key={file.name} className="mt-2 flex items-center">
          <img src={imagePreviews[file.name] || ''} alt={file.name} className="w-10 h-10 object-cover mr-2" />
          <span>{file.name}: </span>
          <span>{file.status || 'pending'}</span>
          {file.status === 'success' || file.status === 'existing' ? (
            <div className="ml-2">
              <button
                onClick={() => handleDeleteImage(file)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      ))}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
