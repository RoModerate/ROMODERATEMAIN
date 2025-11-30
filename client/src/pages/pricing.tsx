import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingBag, Shield, Zap, Star, Crown, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/public-nav";

export default function Pricing() {
  const marketplaceFeatures = {
    free: [
      "Browse all listings",
      "Basic seller profile",
      "List up to 5 items",
      "Standard transaction fees (10%)",
      "Community support",
      "Basic review system",
      "Standard search visibility",
    ],
    pro: [
      "Everything in Free",
      "Unlimited listings",
      "Reduced fees (5%)",
      "Verified seller badge",
      "Priority support 24/7",
      "Advanced analytics dashboard",
      "Custom storefront design",
      "Bundle creation tools",
      "Flash sale capabilities",
      "Auction hosting",
      "Featured listing slots (3/month)",
      "Social media promotion",
      "Early access to new features",
      "Bulk upload tools",
    ],
    enterprise: [
      "Everything in Pro",
      "No transaction fees",
      "Dedicated account manager",
      "Custom API integration",
      "White-label storefront",
      "Advanced fraud protection",
      "Custom escrow terms",
      "Unlimited featured listings",
      "Priority listing placement",
      "Custom contracts & agreements",
      "Multi-seller team management",
      "Advanced reporting & exports",
      "Custom payment terms",
      "Dispute resolution priority",
    ],
  };

  const moderatorFeatures = {
    free: [
      "Discord OAuth integration",
      "Basic Bloxlink lookups (100/day)",
      "Single server connection",
      "Manual verification logs",
      "Community Discord support",
      "Basic moderation tools",
      "Standard rate limits",
    ],
    pro: [
      "Everything in Free",
      "Unlimited Bloxlink lookups",
      "Up to 10 servers",
      "Automated verification system",
      "Custom verification webhooks",
      "Advanced logging & analytics",
      "Priority support 24/7",
      "Custom bot integration",
      "Real-time notifications",
      "API access (10,000 calls/day)",
      "Bulk user verification",
      "Custom verification rules",
      "Ban synchronization across servers",
      "Role automation based on Roblox data",
    ],
    enterprise: [
      "Everything in Pro",
      "Unlimited servers",
      "Unlimited API calls",
      "Dedicated infrastructure",
      "Custom SLA guarantees",
      "Advanced security features",
      "Custom feature development",
      "White-label bot hosting",
      "Multi-region redundancy",
      "Advanced audit logging",
      "Compliance & data export tools",
      "Custom integration development",
      "Training & onboarding sessions",
      "Dedicated account manager",
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            Transparent Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're trading assets or moderating servers, we have the perfect plan for you
          </p>
        </div>

        {/* Marketplace Pricing */}
        <section className="mb-24">
          <div className="flex items-center justify-center gap-3 mb-12">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h2 className="text-4xl font-bold text-foreground">Marketplace Plans</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Tier */}
            <Card className="flex flex-col border-2 border-border" data-testid="card-marketplace-free">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-2xl">Free</CardTitle>
                </div>
                <CardDescription className="text-base">Perfect for casual traders</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {marketplaceFeatures.free.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" data-testid="button-marketplace-free">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="flex flex-col border-2 border-primary relative" data-testid="card-marketplace-pro">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">Pro</CardTitle>
                </div>
                <CardDescription className="text-base">For serious sellers</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {marketplaceFeatures.pro.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" data-testid="button-marketplace-pro">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="flex flex-col border-2 border-border" data-testid="card-marketplace-enterprise">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                </div>
                <CardDescription className="text-base">For businesses & platforms</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {marketplaceFeatures.enterprise.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" data-testid="button-marketplace-enterprise">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Moderator Pricing */}
        <section>
          <div className="flex items-center justify-center gap-3 mb-12">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-4xl font-bold text-foreground">Moderator Plans</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Tier */}
            <Card className="flex flex-col border-2 border-border" data-testid="card-moderator-free">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-2xl">Free</CardTitle>
                </div>
                <CardDescription className="text-base">For small communities</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {moderatorFeatures.free.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" data-testid="button-moderator-free">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="flex flex-col border-2 border-primary relative" data-testid="card-moderator-pro">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">Pro</CardTitle>
                </div>
                <CardDescription className="text-base">For active moderators</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {moderatorFeatures.pro.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" data-testid="button-moderator-pro">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="flex flex-col border-2 border-border" data-testid="card-moderator-enterprise">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                </div>
                <CardDescription className="text-base">For large organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-8 flex-1">
                  {moderatorFeatures.enterprise.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" data-testid="button-moderator-enterprise">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ / Additional Info */}
        <section className="mt-24 max-w-4xl mx-auto">
          <Card className="bg-card border-2 border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Need Help Choosing?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Not sure which plan is right for you? Our team is here to help you find the perfect fit for your needs.
              </p>
              <div className="flex justify-center">
                <Button variant="outline" data-testid="button-contact-sales">
                  Contact Sales Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
