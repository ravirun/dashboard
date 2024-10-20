"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function AddVenue() {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: venueData, error: venueError } = await supabase
        .from("venues")
        .select("name");
      if (venueError) {
        console.error(venueError.message);
        setError(venueError.message);
      } else {
        setFormData({ name: venueData[0].name }); // Assuming we want the name of the first venue
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Assuming we want to update the name of the first venue
    const { error: updateError } = await supabase
      .from("venues")
      .update({ name: formData.name })
      .eq("id", 1); // Assuming we want to update the first venue

    if (updateError) {
      setError(updateError.message);
      console.error("Update Venue Error:", updateError.message);
    } else {
      setSuccess("Venue name updated successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 font-medium">Name</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          disabled={loading}
        >
          {loading ? "Updating Venue..." : "Update Venue"}
        </button>

        {error && <p className="mt-4 text-red-500">{error}</p>}
        {success && <p className="mt-4 text-green-500">{success}</p>}
      </form>
    </div>
  );
}
