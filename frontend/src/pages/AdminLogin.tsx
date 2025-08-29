import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";

const AdminLogin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login, isLoading, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast({ 
          title: "Welcome back, Admin!",
          description: "You have been successfully logged in."
        });
        // Redirect to home page instead of dashboard
        navigate("/");
      } else {
        toast({ 
          title: "Invalid credentials", 
          description: "Please check your email and password.",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ 
        title: "Login failed", 
        description: "An error occurred during login. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render the form if user is already logged in
  if (user) {
    return (
      <div className="pt-16">
        <div className="mx-auto max-w-sm px-4 md:px-6 py-12 text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="pt-16">
      <SEO title="Admin Login | Ayosi" description="Secure admin login for managing products and orders." canonical="/admin" />
      <div className="mx-auto max-w-sm px-4 md:px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Access admin features and manage your store
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@ayosi.com"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })} 
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message as string}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter your password"
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })} 
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message as string}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminLogin;