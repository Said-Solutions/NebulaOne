import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Check, Loader2 } from "lucide-react";

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

// Registration schema
const registerSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const [location, navigate] = useLocation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  const { toast } = useToast();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form setup
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form setup
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(
      { username: values.username, password: values.password },
      {
        onSuccess: () => {
          toast({
            title: "Login successful",
            description: "Welcome back to NebulaOne!",
          });
          navigate("/");
        },
      }
    );
  };

  // Handle registration submission
  const onRegisterSubmit = (values: RegisterValues) => {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(
      { 
        ...userData, 
        initials: userData.name
          .split(" ")
          .map(name => name[0])
          .join("")
          .toUpperCase() 
      },
      {
        onSuccess: () => {
          toast({
            title: "Registration successful",
            description: "Your account has been created. Welcome to NebulaOne!",
          });
          navigate("/");
        },
      }
    );
  };

  // If still checking auth status, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container flex flex-col lg:flex-row items-center justify-center gap-8 px-4 py-10">
        {/* Left side - Auth forms */}
        <Card className="w-full max-w-md">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Login to access your NebulaOne workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form 
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="Your username"
                                className="pl-9" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Your password" 
                                className="pl-9"
                                {...field} 
                              />
                              <button 
                                type="button"
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                              >
                                {passwordVisible ? 
                                  <EyeOff className="h-4 w-4" /> : 
                                  <Eye className="h-4 w-4" />
                                }
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        <>
                          Login
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button 
                    className="text-primary underline-offset-4 hover:underline" 
                    onClick={() => setActiveTab("register")}
                  >
                    Register here
                  </button>
                </p>
              </CardFooter>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Join NebulaOne to experience the future of productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...registerForm}>
                  <form 
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)} 
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="email" 
                                  placeholder="Your email" 
                                  className="pl-9"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Choose a password" 
                                className="pl-9"
                                {...field} 
                              />
                              <button 
                                type="button"
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                              >
                                {passwordVisible ? 
                                  <EyeOff className="h-4 w-4" /> : 
                                  <Eye className="h-4 w-4" />
                                }
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Confirm your password" 
                                className="pl-9"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button 
                    className="text-primary underline-offset-4 hover:underline" 
                    onClick={() => setActiveTab("login")}
                  >
                    Login instead
                  </button>
                </p>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Right side - Product info */}
        <div className="flex flex-col items-center lg:items-start w-full max-w-xl space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-bold">NebulaOne</h1>
            <p className="text-xl text-muted-foreground">The all-in-one productivity workspace</p>
          </div>
          
          <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 w-full">
            <FeatureCard 
              title="Unified Platform" 
              description="All your documents, tasks, meetings and communications in one place"
              icon={<Check className="h-5 w-5" />}
            />
            <FeatureCard 
              title="AI-Powered" 
              description="Intelligent assistant that can search and summarize across your workspace"
              icon={<Check className="h-5 w-5" />}
            />
            <FeatureCard 
              title="Real-time Collaboration" 
              description="Work together with your team in real-time on documents and tasks"
              icon={<Check className="h-5 w-5" />}
            />
            <FeatureCard 
              title="Automatic Organization" 
              description="Smart categorization and auto-tagging for effortless organization"
              icon={<Check className="h-5 w-5" />}
            />
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg w-full">
            <h3 className="text-lg font-semibold mb-2">Sign up today to get:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>14-day free trial of all premium features</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Access to all modules including AI Assistant</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Unlimited document storage and task creation</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>No credit card required for trial period</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature card component
const FeatureCard = ({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode;
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
      <div className="flex items-center space-x-3 mb-2">
        <div className="rounded-full p-1.5 bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default AuthPage;