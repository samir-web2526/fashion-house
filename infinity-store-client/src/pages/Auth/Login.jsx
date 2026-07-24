import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { loginUser, googleLogin } from "@/services/auth.api";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/images/logo.png";
import { Helmet } from "react-helmet-async";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

const onSubmit = async (formData) => {
  setLoading(true);

  try {
      await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

    const user = await fetchUser();

    toast.success("Login successful!");

    navigate(user?.role === "admin" ? "/dashboard" : "/");
  } catch (err) {
  const validationErrors = err.response?.data?.errors;

  if (validationErrors) {
    validationErrors.forEach((error) => {
      setError(error.field, {
        type: "server",
        message: error.message,
      });
    });

    return;
  }

  toast.error(
    err.response?.data?.message ||
      "Something went wrong. Please try again."
  );
} finally {
    setLoading(false);
  }
};

const handleGoogleLogin = async (credentialResponse) => {
  if (!credentialResponse.credential) return;

  try {
    setLoading(true);

    await googleLogin(credentialResponse.credential);

    const user = await fetchUser();

    toast.success("Login successful!");

    navigate(user?.role === "admin" ? "/dashboard" : "/");
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Google Login Failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Helmet><title>Login | Infinity Store</title></Helmet>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="Infinity Store" className="mx-auto mb-4 h-14 w-auto dark:invert" />
          <h1 className="text-2xl font-bold text-foreground">Infinity Store</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className={errors.password ? "border-red-500 focus:border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-linear-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="mb-6 flex justify-center">
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => toast.error("Google Login Failed")}
                  theme="outline"
                  shape="rectangular"
                  text="signin_with"
                  width="100%"
                />
              </div>
            </div>

            <Link
              to="/"
              className="flex w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              ← Back to Home
            </Link>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-amber-600 hover:text-amber-700 hover:underline"
              >
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
