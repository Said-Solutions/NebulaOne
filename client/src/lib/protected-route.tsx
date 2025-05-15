import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Admin emails that should always have access
const ADMIN_EMAILS = ['saidomar.business@gmail.com'];

export function ProtectedRoute({
  path,
  component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  // Define the actual component to render
  const Component = component;

  // Show loading state while auth status is being checked
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Redirect to auth page if not logged in
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if user has an active subscription or is an admin
  const isAdmin = user.email && ADMIN_EMAILS.includes(user.email);
  const hasActiveSubscription = user.stripeSubscriptionStatus === 'active';
  
  // If user is not admin and doesn't have an active subscription,
  // redirect to subscription page
  if (!isAdmin && !hasActiveSubscription) {
    return (
      <Route path={path}>
        <Redirect to="/subscribe" />
      </Route>
    );
  }

  // If logged in and has subscription (or is admin), render the protected component
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}