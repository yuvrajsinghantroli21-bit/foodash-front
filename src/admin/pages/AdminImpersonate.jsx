import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function AdminImpersonate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (!token || !user) {
      toast.error("Invalid support access link");
      navigate("/admin/login", { replace: true });
      return;
    }

    try {
      const parsedUser = JSON.parse(decodeURIComponent(user));

      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(parsedUser));

      toast.success("SuperAdmin support mode enabled");
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      toast.error("Failed to start support mode");
      navigate("/admin/login", { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff8ec]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-4 text-amber-700 animate-spin" />
        <p className="text-sm font-black text-stone-700">
          Opening restaurant admin...
        </p>
      </div>
    </div>
  );
}

export default AdminImpersonate;
