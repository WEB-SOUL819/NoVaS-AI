
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from "@/types/subscription";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SubscriptionPlansProps {
  onSelectPlan?: (plan: SubscriptionPlan) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  const { user, hasValidSubscription } = useAuth();
  
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      toast.info("Subscription functionality coming soon!");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-gray-400 mt-2">Select the plan that best fits your needs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={`h-full border ${plan.tier === 'premium' ? 'border-purple-500' : plan.tier === 'enterprise' ? 'border-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.tier === 'premium' && (
                    <Badge className="bg-purple-600">Popular</Badge>
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
                <Button 
                  className={`w-full ${plan.tier === 'premium' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  variant={plan.tier === 'free' ? 'outline' : 'default'}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={user?.subscriptionTier === plan.tier}
                >
                  {user?.subscriptionTier === plan.tier ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
