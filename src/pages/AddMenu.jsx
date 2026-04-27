import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function AddMenu() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");
  const [categoryIconSvg, setCategoryIconSvg] = useState("");

  const [foodType, setFoodType] = useState("veg");
  const [badge, setBadge] = useState("none");
  const [available, setAvailable] = useState(true);

  const [categories, setCategories] = useState([]);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.log("Category fetch error:", err);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("price", price);
    formData.append("salePrice", salePrice);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("categoryIconSvg", categoryIconSvg);
    formData.append("foodType", foodType);
    formData.append("badge", badge);
    formData.append("available", available);
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
    <div className="flex items-center justify-center min-h-screen px-4 py-10 text-white bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 space-y-4 bg-gray-800 rounded-xl"
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
          placeholder="Original Price"
          className="w-full p-2 bg-gray-700 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Sale Price (optional)"
          className="w-full p-2 bg-gray-700 rounded"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
        />

        {/* CATEGORY SELECT */}
        <select
          className="w-full p-2 bg-gray-700 rounded"
          value={category}
          onChange={(e) => {
            const selected = categories.find(
              (cat) => cat.name === e.target.value,
            );

            setCategory(selected?.name || "");
            setCategoryIconSvg(selected?.iconSvg || "");
          }}
          required
        >
          <option value="">Select Category</option>

          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}
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
          placeholder="Description"
          className="w-full p-2 bg-gray-700 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
          />
          Available
        </label>

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
              const file = e.target.files[0];
              setImage(file);
              setPreview(URL.createObjectURL(file));
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
