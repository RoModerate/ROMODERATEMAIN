import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Code, Server, Shield, Zap, MessageSquare, Settings, Key, ArrowRight, CheckCircle } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { useLocation } from "wouter";
import { PublicNav } from "@/components/public-nav";

const romoderateIcon = "/romoderate-icon.png";

export default function Docs() {
  const [, setLocation] = useLocation();
  
  const sections = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of setting up your Discord bot with Ro Moderate",
      articles: [
        "Quick Start Guide",
        "Creating Your First Bot",
        "Connecting Discord Servers",
        "Dashboard Overview"
      ]
    },
    {
      icon: Shield,
      title: "Moderation Features",
      description: "Explore powerful moderation tools and commands",
      articles: [
        "Auto-Moderation Setup",
        "Custom Commands",
        "Ban Management",
        "Warning System"
      ]
    },
    {
      icon: Server,
      title: "Multi-Server Management",
      description: "Manage multiple Discord servers efficiently",
      articles: [
        "Adding Multiple Servers",
        "Server-Specific Settings",
        "Role Synchronization",
        "Cross-Server Moderation"
      ]
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Integrate Ro Moderate with your applications",
      articles: [
        "Authentication",
        "REST API Endpoints",
        "WebSocket Events",
        "Rate Limiting"
      ]
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Customize your bot's behavior and appearance",
      articles: [
        "Bot Settings",
        "Command Prefixes",
        "Logging Configuration",
        "Webhook Integration"
      ]
    },
    {
      icon: MessageSquare,
      title: "Support",
      description: "Get help when you need it",
      articles: [
        "FAQ",
        "Troubleshooting",
        "Discord Community",
        "Contact Support"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <div className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                <Book className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Documentation
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about building and managing your Discord bot with RoModerate
            </p>
          </div>

          <div className="max-w-6xl mx-auto mb-20 space-y-8">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Quick Start Guide</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Get your Discord bot up and running in minutes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
                      1
                    </div>
                    <h4 className="font-semibold text-lg">Connect Discord</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sign in with your Discord account to get started with RoModerate
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span>Secure OAuth authentication</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
                      2
                    </div>
                    <h4 className="font-semibold text-lg">Configure Bot</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Set up your bot token, channels, and moderation settings
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span>Guided setup wizard</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
                      3
                    </div>
                    <h4 className="font-semibold text-lg">Start Moderating</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Deploy your bot and manage your community effectively
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span>Real-time updates</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t">
                  <Button size="lg" onClick={() => setLocation('/dashboard')} data-testid="button-start" className="gap-2">
                    <SiDiscord className="h-5 w-5" />
                    Start Building Now
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Key className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Discord OAuth Setup</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Configure your Discord application for authentication
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Important: Redirect URL Configuration</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      To enable Discord login, you must configure the redirect URL in your Discord Developer Portal:
                    </p>
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <code className="text-sm break-all">
                        {window.location.origin}/api/auth/discord/callback
                      </code>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Setup Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Go to <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Discord Developer Portal</a></li>
                      <li>Select your application (or create a new one)</li>
                      <li>Navigate to OAuth2 → General</li>
                      <li>Add the redirect URL shown above to "Redirects"</li>
                      <li>Save changes and return to the dashboard</li>
                    </ol>
                  </div>

                  <div className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                    <div className="flex gap-3">
                      <MessageSquare className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h5 className="font-semibold text-sm">Note for Bot Hosting</h5>
                        <p className="text-xs text-muted-foreground">
                          If you're hosting your own Discord bot, you'll need to provide your bot token through the Bot Management page in the dashboard. 
                          The system does not store bot tokens - you must host and run your own bot instance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-6xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-center mb-4">Browse Documentation</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Explore our comprehensive guides and resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {sections.map((section, index) => (
              <Card key={index} className="hover-elevate transition-all border-primary/20" data-testid={`doc-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                    <section.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.articles.map((article, articleIndex) => (
                      <li key={articleIndex} className="flex items-start gap-3 text-sm hover-elevate p-2 rounded-md cursor-pointer transition-all group">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="group-hover:text-primary transition-colors">{article}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-24 text-center">
            <Card className="max-w-3xl mx-auto bg-gradient-to-br from-muted/50 to-muted/30 border-primary/20 shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl mb-3">Need Help?</CardTitle>
                <CardDescription className="text-lg">
                  Join our Discord community or contact support for personalized assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
                <Button size="lg" variant="default" data-testid="button-join-discord" className="gap-2">
                  <SiDiscord className="h-5 w-5" />
                  Join Discord Community
                </Button>
                <Button size="lg" variant="outline" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="py-12 border-t bg-muted/30 mt-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <img src={romoderateIcon} alt="RoModerate" className="h-8 w-8 object-contain" />
                <div>
                  <p className="font-bold">RoModerate</p>
                  <p className="text-sm text-muted-foreground">Professional Discord & Roblox Moderation</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <button onClick={() => setLocation('/')} className="hover:text-foreground transition-colors">
                  Home
                </button>
                <button onClick={() => setLocation('/pricing')} className="hover:text-foreground transition-colors">
                  Pricing
                </button>
                <button onClick={() => setLocation('/terms')} className="hover:text-foreground transition-colors">
                  Terms
                </button>
                <button onClick={() => setLocation('/privacy')} className="hover:text-foreground transition-colors">
                  Privacy
                </button>
                <span>© 2024 RoModerate. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
