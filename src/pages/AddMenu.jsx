import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function AddMenu() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("image", image);

    api
      .post("/menu", formData)
      .then(() => {
        navigate("/admin/menu", {
          state: {
            toast: {
              message: "Item added successfully ✅",
              type: "success",
            },
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="p-8 space-y-4 bg-gray-800 rounded-xl w-96"
      >
        <h2 className="text-2xl font-bold text-center">Add Menu Item</h2>

        <input
          type="text"
          placeholder="Item name"
          className="w-full p-2 bg-gray-700 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          className="w-full p-2 bg-gray-700 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <select
          className="w-full p-2 bg-gray-700 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          <option value="Fast Food">Fast Food</option>
          <option value="Drinks">Drinks</option>
          <option value="Desserts">Desserts</option>
        </select>

        <textarea
          placeholder="Description"
          className="w-full p-2 bg-gray-700 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="cursor-pointer">
          <div className="flex items-center justify-center w-full h-40 bg-gray-900 border-2 border-gray-500 border-dashed rounded">
            {preview ? (
              <img
                src={preview}
                className="object-contain h-full"
                alt="preview"
              />
            ) : (
              <span className="text-gray-400">Click to upload image</span>
            )}
          </div>

          <input
            type="file"
            hidden
            onChange={(e) => {
              setImage(e.target.files[0]);
              setPreview(URL.createObjectURL(e.target.files[0]));
            }}
            required
          />
        </label>

        <button
          type="submit"
          className="w-full py-2 mt-4 transition bg-green-600 rounded hover:bg-green-700"
        >
          Add Item
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/menu")}
          className="text-gray-400"
        >
          ← Back
        </button>
      </form>
    </div>
  );
}

export default AddMenu;
