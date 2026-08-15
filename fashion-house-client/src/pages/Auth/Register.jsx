import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
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
import { registerUser } from "@/services/auth.api";
import useSettings from "@/hooks/useSettings";
import { Helmet } from "react-helmet-async";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { siteName, logo } = useSettings();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");

    try {
      await registerUser({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      toast.success("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Helmet><title>{`Register | ${siteName}`}</title></Helmet>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {logo && <img src={logo} alt={siteName} className="mx-auto mb-4 h-20 w-auto dark:invert" />}
          <h1 className="text-2xl font-bold text-foreground">{siteName}</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
            <CardDescription>
              Join us and start shopping today
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  })}
                  className={errors.name ? "border-gray-500 focus:border-gray-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-gray-600">{errors.name.message}</p>
                )}
              </div>

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
                  className={(errors.email) ? "border-gray-500 focus:border-gray-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-gray-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className={errors.password ? "border-gray-500 focus:border-gray-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-gray-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className={errors.confirmPassword ? "border-gray-500 focus:border-gray-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-gray-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Link
              to="/"
              className="flex w-full items-center justify-center rounded-lg border border-border bg-background px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              ← Back to Home
            </Link>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-foreground hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
