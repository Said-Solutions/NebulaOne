import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Make sure to change this to your payment completion page
          return_url: window.location.origin + "/settings?tab=subscription",
        },
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your return_url.
      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
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

export default function SubscribePage() {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const { toast } = useToast();
  const [_, navigate] = useLocation();

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