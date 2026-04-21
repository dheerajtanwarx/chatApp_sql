import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LoaderIcon, MailIcon, UserIcon, ImageIcon } from "lucide-react";

const UpdateProfile = () => {
  const { authUser, updateProfile, isUpdating } = useAuthStore();

  const [formData, setFormData] = useState({
    email: authUser?.email || "",
    username: authUser?.username || "",
    profile_pic: authUser?.profile_pic || null,
  });

  useEffect(() => {
    if (authUser) {
      setFormData({
        email: authUser.email || "",
        username: authUser.username || "",
        profile_pic: authUser.profile_pic || null,
      });
    }
  }, [authUser]);

  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, profile_pic: file });

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Update button clicked");

    const data = new FormData();

    if (formData.email) data.append("email", formData.email);
    if (formData.username) data.append("username", formData.username);
    if (formData.profile_pic) data.append("profile_pic", formData.profile_pic);

    updateProfile(data);
  };

  return (
    <div className="z-10 w-full flex items-center justify-center p-4 bg-slate-900 min-h-screen">
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Update Profile
        </h2>

        <form onSubmit={handleSubmit } className="space-y-5">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 mb-3 flex items-center justify-center border-2 border-slate-600">
              {preview || formData.profile_pic ? (
                <img
                  src={preview || formData.profile_pic}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="text-slate-400 w-10 h-10" />
              )}
            </div>

            <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-slate-300" />
          </div>

          {/* Email */}
          <div>
            <label className="text-slate-300 text-sm">Email</label>
            <div className="relative">
              <MailIcon className="absolute left-2 top-2 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-8 p-2 rounded bg-slate-700 text-white"
                placeholder="Enter new email"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-slate-300 text-sm">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-2 top-2 text-slate-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full pl-8 p-2 rounded bg-slate-700 text-white"
                placeholder="Enter new username"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded"
            
          >
            {isUpdating ? (
              <LoaderIcon className="animate-spin mx-auto" />
            ) : (
              "Update Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
