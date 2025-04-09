
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, LockKeyhole } from "lucide-react";
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from "@/types/subscription";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  const { user, hasValidSubscription, isAdmin, isOwner } = useAuth();
  
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.isAdminOnly && !isAdmin && !isOwner) {
      toast.error("This plan is restricted to administrators only.");
      return;
    }
    
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      toast.info("Subscription functionality coming soon!");
    }
  };
  
  // Filter out admin plan for non-admin/owner users
  const visiblePlans = SUBSCRIPTION_PLANS.filter(plan => 
    !(plan.isAdminOnly && !isAdmin && !isOwner)
  );
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-gray-400 mt-2">Select the plan that best fits your needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visiblePlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`h-full border ${
              plan.tier === 'premium' ? 'border-purple-500' : 
              plan.tier === 'enterprise' ? 'border-blue-500' : 
              plan.tier === 'admin' ? 'border-red-500' : ''
            }`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.tier === 'premium' && (
                    <Badge className="bg-purple-600">Popular</Badge>
                  )}
                  {plan.isAdminOnly && (
                    <Badge className="bg-red-600">Admin Only</Badge>
                  )}
                  {user?.subscriptionTier === plan.tier && (
                    <Badge className="bg-green-600">Current</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  ₹{plan.price}
                  <span className="text-sm font-normal text-gray-400">/month</span>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {user?.subscriptionTier === plan.tier ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Badge className="mr-2 bg-green-600">✓</Badge> Subscribed
                  </Button>
                ) : plan.isAdminOnly && !(isAdmin || isOwner) ? (
                  <Button variant="outline" className="w-full" disabled>
                    <LockKeyhole className="h-4 w-4 mr-2" />
                    Restricted
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${
                      plan.tier === 'premium' ? 'bg-purple-600 hover:bg-purple-700' : 
                      plan.tier === 'admin' ? 'bg-red-600 hover:bg-red-700' : ''
                    }`}
                    variant={plan.tier === 'free' ? 'outline' : 'default'}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    Choose Plan
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
