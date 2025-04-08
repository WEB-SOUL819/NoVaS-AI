
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // Price in Rupees
  features: string[];
  tier: SubscriptionTier;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    description: 'Basic features for personal use',
    price: 0,
    tier: 'free',
    features: [
      '5 Basic Automations',
      'Text-to-Speech (Limited)',
      'Standard Assistant Access',
      'Email Support'
    ]
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Enhanced features for individuals',
    price: 499,
    tier: 'basic',
    features: [
      '15 Advanced Automations',
      'Full Text-to-Speech',
      'Priority Assistant Access',
      'Email & Chat Support',
      'Workflow Export'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'Advanced features for professionals',
    price: 999,
    tier: 'premium',
    features: [
      'Unlimited Automations',
      'Advanced Text-to-Speech',
      'Premium Assistant Access',
      'Computer Vision Features',
      'Priority Support',
      'Custom Workflows'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'Complete solution for businesses',
    price: 4999,
    tier: 'enterprise',
    features: [
      'All Premium Features',
      'Dedicated Account Manager',
      'Custom API Integration',
      'Advanced Analytics',
      'Team Collaboration',
      'White-labeling Options'
    ]
  }
];
