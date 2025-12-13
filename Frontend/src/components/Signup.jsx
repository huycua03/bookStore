import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";

function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch, // Dùng watch để kiểm tra giá trị của mật khẩu
  } = useForm();

  const onSubmit = async (data) => {
    const newCustomer = {
      fullname: data.fullname,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: data.password,
    };
    
    try {
      const res = await axios.post("http://localhost:4001/api/signup", newCustomer);
      
      if (res.data.requiresActivation) {
        toast.success("Registration successful! 📧", { duration: 4000 });
        toast("Please check your email to activate your account", {
          icon: "✉️",
          duration: 6000,
          style: {
            background: '#3b82f6',
            color: '#fff',
          }
        });
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        toast.success("Signup Successfully");
        localStorage.setItem("customer", JSON.stringify(res.data.customer));
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response) {
        console.log(err);
        toast.error("Error: " + err.response.data.message);
      }
    }
  };

  return (
    <>
      <div className="flex h-screen items-center justify-center">
        <div className=" w-[600px] ">
          <div className="modal-box">
            <form onSubmit={handleSubmit(onSubmit)} method="dialog">
              {/* Close button */}
              <Link
                to="/"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              >
                ✕
              </Link>

              <h3 className="font-bold text-lg">Signup</h3>
              <div className="mt-4 space-y-2">
                <span>Name</span>
                <br />
                <input
                  type="text"
                  placeholder="Enter your fullname"
                  className="w-80 px-3 py-1 border rounded-md outline-none"
                  {...register("fullname", { required: true })}
                />
                <br />
                {errors.fullname && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Phone */}
              <div className="mt-4 space-y-2">
                <span>Phone</span>
                <br />
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  className="w-80 px-3 py-1 border rounded-md outline-none"
                  {...register("phone", { required: true })}
                />
                <br />
                {errors.phone && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="mt-4 space-y-2">
                <span>Email</span>
                <br />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-80 px-3 py-1 border rounded-md outline-none"
                  {...register("email", { required: true })}
                />
                <br />
                {errors.email && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Address */}
              <div className="mt-4 space-y-2">
                <span>Address</span>
                <br />
                <input
                  type="text"
                  placeholder="Enter your address"
                  className="w-80 px-3 py-1 border rounded-md outline-none"
                  {...register("address", { required: true })}
                />
                <br />
                {errors.address && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="mt-4 space-y-2">
                <span>Password</span>
                <br />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-80 px-3 py-1 border rounded-md outline-none"
                  {...register("password", { required: true })}
                />
                <br />
                {errors.password && (
                  <span className="text-sm text-red-500">
                    This field is required
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mt-4 space-y-2">
                <span>Confirm Password</span>
                <br />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="w-80 px-3 py-1 border rounded-md outline-none"
                  {...register("confirmPassword", {
                    required: true,
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match", // Kiểm tra mật khẩu nhập lại
                  })}
                />
                <br />
                {errors.confirmPassword && (
                  <span className="text-sm text-red-500">
                    {errors.confirmPassword.message || "This field is required"}
                  </span>
                )}
              </div>

              {/* Button */}
              <div className="flex justify-around mt-4">
                <button className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200">
                  Signup
                </button>
                <p className="text-xl">
                  Have an account?{" "}
                  <button
                    className="underline text-blue-500 cursor-pointer"
                    onClick={() =>
                      document.getElementById("my_modal_3").showModal()
                    }
                  >
                    Login
                  </button>{" "}
                  <Login />
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
