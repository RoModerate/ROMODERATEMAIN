import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Search, Shield, Info, Gamepad2, Key, HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Command {
  name: string;
  description: string;
  usage: string;
  example: string;
  category: "moderation" | "info" | "utility" | "admin";
  permissions?: string;
}

const commands: Command[] = [
  {
    name: "/ban",
    description: "Ban a Roblox user from your game with an optional reason and duration",
    usage: "/ban <username> [reason] [duration]",
    example: "/ban ExampleUser Exploiting 7d",
    category: "moderation",
    permissions: "Moderator",
  },
  {
    name: "/unban",
    description: "Remove a ban from a Roblox user",
    usage: "/unban <username> [reason]",
    example: "/unban ExampleUser Appeal approved",
    category: "moderation",
    permissions: "Moderator",
  },
  {
    name: "/mute",
    description: "Temporarily mute a Roblox player to prevent them from chatting",
    usage: "/mute <username> <duration> [reason]",
    example: "/mute ExampleUser 1h Spamming chat",
    category: "moderation",
    permissions: "Moderator",
  },
  {
    name: "/kick",
    description: "Kick a Roblox player from the game with an optional reason",
    usage: "/kick <username> [reason]",
    example: "/kick ExampleUser Disruptive behavior",
    category: "moderation",
    permissions: "Moderator",
  },
  {
    name: "/warnings",
    description: "List warnings for a player or add a new warning",
    usage: "/warnings <username> [add/list] [reason]",
    example: "/warnings ExampleUser add Minor rule violation",
    category: "moderation",
    permissions: "Moderator",
  },
  {
    name: "/check",
    description: "Check a player's ban status and complete moderation history",
    usage: "/check <username>",
    example: "/check ExampleUser",
    category: "info",
  },
  {
    name: "/lookup",
    description: "Get detailed information about a Roblox player including account age, join date, and stats",
    usage: "/lookup <username>",
    example: "/lookup ExampleUser",
    category: "info",
  },
  {
    name: "/stats",
    description: "View comprehensive moderation statistics for your server",
    usage: "/stats [timeframe]",
    example: "/stats 30d",
    category: "info",
  },
  {
    name: "/report",
    description: "Create a player report for staff review with evidence",
    usage: "/report <username> <reason> [evidence]",
    example: "/report ExampleUser Exploiting Screenshot attached",
    category: "utility",
  },
  {
    name: "/ticket",
    description: "Create a support ticket for help or questions",
    usage: "/ticket <subject> <description>",
    example: "/ticket Account Issue Cannot access my account",
    category: "utility",
  },
  {
    name: "/dashboard",
    description: "Get a quick link to access the RoModerate web dashboard",
    usage: "/dashboard",
    example: "/dashboard",
    category: "utility",
  },
  {
    name: "/linkkey",
    description: "Link your Discord bot to RoModerate (Admin only - required for setup)",
    usage: "/linkkey <bot-key>",
    example: "/linkkey abc123def456",
    category: "admin",
    permissions: "Administrator",
  },
];

export default function BotCommands() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = 
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "moderation": return <Shield className="h-4 w-4" />;
      case "info": return <Info className="h-4 w-4" />;
      case "utility": return <Gamepad2 className="h-4 w-4" />;
      case "admin": return <Key className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "moderation": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "info": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "utility": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "admin": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "";
    }
  };

  const categoryStats = {
    moderation: commands.filter(c => c.category === "moderation").length,
    info: commands.filter(c => c.category === "info").length,
    utility: commands.filter(c => c.category === "utility").length,
    admin: commands.filter(c => c.category === "admin").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bot Commands</h1>
        <p className="text-muted-foreground mt-2">
          Complete reference for all RoModerate Discord bot commands
        </p>
      </div>

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          All commands are slash commands and work in any Discord channel where the bot has permissions.
          Simply type <code className="bg-muted px-1 py-0.5 rounded text-xs">/</code> to see available commands.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-commands"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({commands.length})
          </TabsTrigger>
          <TabsTrigger value="moderation" data-testid="tab-moderation">
            <Shield className="h-4 w-4 mr-2" />
            Moderation ({categoryStats.moderation})
          </TabsTrigger>
          <TabsTrigger value="info" data-testid="tab-info">
            <Info className="h-4 w-4 mr-2" />
            Info ({categoryStats.info})
          </TabsTrigger>
          <TabsTrigger value="utility" data-testid="tab-utility">
            <Gamepad2 className="h-4 w-4 mr-2" />
            Utility ({categoryStats.utility})
          </TabsTrigger>
          <TabsTrigger value="admin" data-testid="tab-admin">
            <Key className="h-4 w-4 mr-2" />
            Admin ({categoryStats.admin})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4 mt-6">
          {filteredCommands.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No commands found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCommands.map((cmd) => (
                <Card key={cmd.name} className="hover-elevate" data-testid={`card-command-${cmd.name.slice(1)}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <code className="text-lg font-mono bg-muted px-2 py-1 rounded">
                            {cmd.name}
                          </code>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {cmd.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge variant="outline" className={`${getCategoryColor(cmd.category)} flex items-center gap-1.5`}>
                          {getCategoryIcon(cmd.category)}
                          <span className="capitalize">{cmd.category}</span>
                        </Badge>
                        {cmd.permissions && (
                          <Badge variant="secondary" className="text-xs">
                            {cmd.permissions}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Usage</p>
                      <code className="block bg-muted px-3 py-2 rounded text-sm font-mono">
                        {cmd.usage}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Example</p>
                      <code className="block bg-primary/5 border border-primary/20 px-3 py-2 rounded text-sm font-mono text-primary">
                        {cmd.example}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
