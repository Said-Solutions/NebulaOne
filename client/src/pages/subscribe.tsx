import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Shield, Star, Zap, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscriptionForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  // Function to mark subscription as active (for demo only)
  const activateSubscription = async () => {
    try {
      // Update user's subscription status via API
      const res = await apiRequest("POST", "/api/update-subscription", {
        userId: user?.id,
        status: "active",
        plan: "premium",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
      
      if (res.ok) {
        // Refresh the user data
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error activating subscription:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, activate the subscription first
      // In production, this would be done via webhook when payment is confirmed
      const activated = await activateSubscription();
      
      if (!activated) {
        toast({
          title: "Error",
          description: "Could not activate subscription. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/?subscription_success=true",
        },
        redirect: "if_required",
      });

      // Handle payment confirmation
      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        toast({
          title: "Subscription Activated",
          description: "Your premium subscription is now active!",
        });
        
        // Navigate to home
        navigate("/");
      } else {
        // Payment requires additional action or is processing
        // The user will be redirected by the return_url
      }
    } catch (e) {
      toast({
        title: "Payment Error",
        description: "An error occurred during the payment process.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <PaymentElement />
        <Button disabled={isLoading || !stripe || !elements} className="w-full" type="submit">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Subscribe Now"
          )}
        </Button>
      </div>
    </form>
  );
};

const PlanFeature = ({ included, feature }: { included: boolean; feature: string }) => (
  <div className="flex items-center mb-2">
    {included ? (
      <Check className="h-4 w-4 mr-2 text-green-500" />
    ) : (
      <X className="h-4 w-4 mr-2 text-red-500" />
    )}
    <span className="text-sm">{feature}</span>
  </div>
);

// Admin "Skip" function component
const AdminSkipButton = ({ onSkip }: { onSkip: () => void }) => {
  const { user } = useAuth();
  const ADMIN_EMAILS = ['saidomar.business@gmail.com'];
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  
  // Only admin users can see this button
  if (!isAdmin) return null;
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full mt-4">
          Skip Subscription (Admin)
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bypass Subscription Requirement</AlertDialogTitle>
          <AlertDialogDescription>
            As an admin user, you can bypass the subscription requirement. 
            This option is only available to specific admin accounts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSkip}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default function SubscribePage() {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Function to activate free trial for admin users
  const activateAdminAccess = async () => {
    try {
      // Update user's subscription status via API
      const res = await apiRequest("POST", "/api/update-subscription", {
        userId: user?.id,
        status: "active",
        plan: "admin",
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      });
      
      if (res.ok) {
        // Refresh the user data
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        toast({
          title: "Admin Access Granted",
          description: "You have been granted admin access to NebulaOne.",
        });
        navigate("/");
        return true;
      }
      
      toast({
        title: "Error",
        description: "Could not activate admin access. Please try again.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Error activating admin access:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    // Check if user already has a subscription
    if (user?.subscriptionPlan === "premium" && user?.subscriptionExpiry) {
      const expiryDate = new Date(user.subscriptionExpiry);
      if (expiryDate > new Date()) {
        // Redirect to settings page if subscription is active
        navigate("/settings?tab=subscription");
        return;
      }
    }

    // Create payment intent as soon as the page loads
    const getSubscription = async () => {
      try {
        const res = await apiRequest("POST", "/api/get-or-create-subscription");
        const data = await res.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setStatus('ready');
        } else if (data.status === 'active' || data.status === 'trialing') {
          // Subscription already active, redirect to settings
          toast({
            title: "Subscription Active",
            description: "You already have an active subscription.",
          });
          navigate("/settings?tab=subscription");
        } else {
          throw new Error("No client secret returned");
        }
      } catch (error) {
        console.error("Error creating subscription:", error);
        setStatus('error');
        toast({
          title: "Error",
          description: "Failed to set up subscription. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    getSubscription();
  }, [user, navigate, toast]);

  return (
    <div className="container py-12 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Premium Subscription</h1>
          <p className="text-muted-foreground mb-6">
            Upgrade to NebulaOne Premium for enhanced productivity features and premium support.
          </p>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Star className="text-amber-500 h-6 w-6 mr-2" />
                <CardTitle>Premium Plan</CardTitle>
              </div>
              <CardDescription>
                All features included for power users and teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">$12.99</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1">
                <PlanFeature included={true} feature="Unlimited workspaces" />
                <PlanFeature included={true} feature="Advanced AI capabilities" />
                <PlanFeature included={true} feature="Unlimited document storage" />
                <PlanFeature included={true} feature="Team collaboration" />
                <PlanFeature included={true} feature="Premium support" />
                <PlanFeature included={true} feature="Custom integrations" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Complete Subscription</CardTitle>
              <CardDescription>
                Enter your payment details to subscribe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status === 'loading' && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">
                    There was an error setting up the payment. Please try again.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {status === 'ready' && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscriptionForm />
                </Elements>
              )}
              
              {/* Admin Skip Button */}
              <AdminSkipButton onSkip={activateAdminAccess} />
            </CardContent>
            <CardFooter className="flex-col items-start">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Shield className="h-4 w-4 mr-1" />
                <span>Your payment is secured with Stripe</span>
              </div>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel anytime from your account settings.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}