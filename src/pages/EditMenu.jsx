import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function EditMenu() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [badge, setBadge] = useState("none");
  const [available, setAvailable] = useState(true);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    api.get("/menu").then((res) => {
      const item = res.data.find((m) => m._id === id);

      if (item) {
        setName(item.name);
        setPrice(item.price);
        setSalePrice(item.salePrice || "");
        setDescription(item.description);
        setCategory(item.category || "");
        setFoodType(item.foodType || "veg");
        setBadge(item.badge || "none");
        setAvailable(item.available !== undefined ? item.available : true);

        setPreview(`http://localhost:5000/uploads/${item.image}`);
      }
    });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("salePrice", salePrice);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("foodType", foodType);
    formData.append("badge", badge);
    formData.append("available", available);

    if (image) {
      formData.append("image", image);
    }

    api.put(`/menu/${id}`, formData).then(() => {
      navigate("/admin/menu", {
        state: {
          toast: {
            message: "Item updated successfully ✏️",
            type: "success",
          },
        },
      });
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="p-8 space-y-4 bg-gray-800 rounded-xl w-96"
      >
        <h2 className="text-2xl font-bold text-center">Edit Menu Item</h2>

        <label className="block mb-4 cursor-pointer">
          <div className="flex items-center justify-center w-full h-40 transition bg-gray-900 border-2 border-gray-500 border-dashed rounded hover:border-blue-500">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="object-contain h-full"
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
          />
        </label>

        <p className="mt-1 text-xs text-center text-gray-400">
          Click image to change
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          placeholder="Item name"
        />

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          placeholder="Original price"
        />

        <input
          type="number"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          placeholder="Sale price (optional)"
        />

        <select
          className="w-full p-2 bg-gray-700 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Fast Food">Fast Food</option>
          <option value="Drinks">Drinks</option>
          <option value="Desserts">Desserts</option>
        </select>

        <select
          className="w-full p-2 bg-gray-700 rounded"
          value={foodType}
          onChange={(e) => setFoodType(e.target.value)}
        >
          <option value="veg">🟢 Veg</option>
          <option value="nonveg">🔴 Non-Veg</option>
        </select>

        <select
          className="w-full p-2 bg-gray-700 rounded"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
        >
          <option value="none">No Badge</option>
          <option value="chef">⭐ Chef's Pick</option>
          <option value="musttry">🔥 Must Try</option>
          <option value="bestseller">🏆 Best Seller</option>
          <option value="new">✨ New</option>
          <option value="limited">⏳ Limited</option>
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          placeholder="Description"
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          Available
        </label>

        <button
          type="submit"
          className="w-full py-2 mt-4 transition bg-blue-600 rounded hover:bg-blue-700"
        >
          Update Item
        </button>
      </form>
    </div>
  );
}

export default EditMenu;
