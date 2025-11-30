import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HelpCircle, BookOpen, Terminal, Shield, Zap, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function Help() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about using RoModerate effectively
        </p>
      </div>

      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertDescription>
          Can't find what you're looking for? Check out the{" "}
          <Link href="/bot-commands" className="underline">
            Bot Commands Reference
          </Link>{" "}
          for more detailed information about bot commands and features.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="getting-started">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="getting-started">
            <BookOpen className="h-4 w-4 mr-2" />
            Getting Started
          </TabsTrigger>
          <TabsTrigger value="moderation">
            <Shield className="h-4 w-4 mr-2" />
            Moderation
          </TabsTrigger>
          <TabsTrigger value="bot-commands">
            <Terminal className="h-4 w-4 mr-2" />
            Bot Usage
          </TabsTrigger>
          <TabsTrigger value="troubleshooting">
            <Zap className="h-4 w-4 mr-2" />
            Troubleshooting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to RoModerate!</CardTitle>
              <CardDescription>
                Learn the basics of managing your server with RoModerate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is RoModerate?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      RoModerate is a comprehensive moderation system that connects your Discord server with your Roblox game. 
                      It allows you to manage bans, appeals, tickets, and player reports all from one centralized dashboard.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Features:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Cross-platform ban management (Discord + Roblox)</li>
                        <li>Automated appeal system</li>
                        <li>Support ticket system</li>
                        <li>Player reporting and moderation</li>
                        <li>Real-time analytics and insights</li>
                        <li>Team collaboration tools</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I set up my server?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Follow these steps to get started:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>
                          <strong>Invite the RoModerate Bot</strong> - Click the invite link and add the bot to your Discord server
                        </li>
                        <li>
                          <strong>Configure Channels</strong> - Set up channels for reports, appeal logs, and ticket management
                        </li>
                        <li>
                          <strong>Link Your Roblox Game</strong> - Add your Roblox API key and Universe ID in the settings
                        </li>
                        <li>
                          <strong>Invite Team Members</strong> - Add moderators and admins to help manage your server
                        </li>
                        <li>
                          <strong>Test the System</strong> - Try creating a test ban or report to ensure everything works
                        </li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Understanding Roles and Permissions</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <div className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge>Owner</Badge>
                          <span className="text-muted-foreground">Full access to all features</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Can manage all settings, add/remove team members, and access sensitive data
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Co-Owner</Badge>
                          <span className="text-muted-foreground">Nearly full access</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Can manage most settings and team members (cannot remove owner)
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Admin</Badge>
                          <span className="text-muted-foreground">Elevated permissions</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Can manage bans, appeals, tickets, and view analytics
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Moderator</Badge>
                          <span className="text-muted-foreground">Basic moderation</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Can handle tickets, review reports, and issue basic moderation actions
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I invite team members?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>Navigate to the <strong>Team Members</strong> page from the sidebar</li>
                        <li>Click <strong>Create Invite Link</strong></li>
                        <li>Select the role (Moderator, Admin, etc.) and permissions</li>
                        <li>Set an expiration time and usage limit (optional)</li>
                        <li>Share the generated invite link with your team member</li>
                        <li>They'll click the link and authorize with Discord to join</li>
                      </ol>
                      <Alert className="mt-4">
                        <AlertDescription className="text-xs">
                          <strong>Pro Tip:</strong> You can create multiple invite links with different permission levels for different team roles.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Guide</CardTitle>
              <CardDescription>
                Best practices for managing your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="ban-1">
                  <AccordionTrigger>How to ban a player</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p><strong>From Discord:</strong></p>
                      <code className="block bg-muted px-3 py-2 rounded mb-3">
                        /ban username:ExampleUser reason:Exploiting duration:7d
                      </code>
                      <p><strong>From Dashboard:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to the <strong>Moderation Panel</strong></li>
                        <li>Search for the player by username or ID</li>
                        <li>Click <strong>Ban Player</strong></li>
                        <li>Fill in the reason, evidence, and duration</li>
                        <li>Click <strong>Confirm Ban</strong></li>
                      </ol>
                      <p className="mt-3">
                        The player will be immediately banned from your Roblox game and notified via Discord (if linked).
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ban-2">
                  <AccordionTrigger>How to handle appeals</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>Navigate to the <strong>Appeals</strong> page</li>
                        <li>Review the player's appeal and their ban history</li>
                        <li>Check the original ban reason and evidence</li>
                        <li>Make a decision (Approve, Deny, or Request More Info)</li>
                        <li>Add a review note explaining your decision</li>
                        <li>The player will be notified of the outcome</li>
                      </ol>
                      <Alert className="mt-4">
                        <AlertDescription className="text-xs">
                          <strong>Best Practice:</strong> Always review ban evidence before approving appeals. Consider the player's history and the severity of the original offense.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ban-3">
                  <AccordionTrigger>Handling support tickets</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Support tickets are user-submitted requests for help. To handle them:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Go to the <strong>Support Tickets</strong> page</li>
                        <li>Click on a ticket to view details</li>
                        <li>Assign yourself (or another team member)</li>
                        <li>Communicate with the user via Discord</li>
                        <li>Update the ticket status as you progress</li>
                        <li>Close the ticket when resolved</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="ban-4">
                  <AccordionTrigger>Player reports and review</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Reports are submitted by players in your game. Review them regularly:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Check the <strong>Reports</strong> page for new submissions</li>
                        <li>Review the evidence provided (screenshots, videos)</li>
                        <li>Investigate the reported player's history</li>
                        <li>Take appropriate action (ban, warn, dismiss)</li>
                        <li>Update the report status and add review notes</li>
                      </ul>
                      <p className="mt-3">
                        Reports marked as "approved" can automatically trigger bans if you've configured Auto Actions.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot-commands" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Discord Bot Commands</CardTitle>
              <CardDescription>
                Quick reference for using the RoModerate bot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  For a complete list of commands with examples, visit the{" "}
                  <Link href="/bot-commands" className="underline font-medium">
                    Bot Commands Reference
                  </Link>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Common Commands:</h4>
                <div className="grid gap-2">
                  <div className="border rounded-lg p-3">
                    <code className="text-sm font-mono">/ban</code>
                    <p className="text-xs text-muted-foreground mt-1">Ban a player from your game</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <code className="text-sm font-mono">/check</code>
                    <p className="text-xs text-muted-foreground mt-1">Check a player's moderation history</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <code className="text-sm font-mono">/lookup</code>
                    <p className="text-xs text-muted-foreground mt-1">Get detailed player information</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <code className="text-sm font-mono">/stats</code>
                    <p className="text-xs text-muted-foreground mt-1">View moderation statistics</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" asChild className="w-full">
                <Link href="/bot-commands">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View All Commands
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
              <CardDescription>
                Common issues and how to solve them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="trouble-1">
                  <AccordionTrigger>Bot is offline or not responding</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>Check the <strong>Server Settings</strong> page to see bot status</li>
                        <li>Verify the bot has the correct permissions in Discord</li>
                        <li>Try restarting the bot from the dashboard</li>
                        <li>Ensure your bot token is valid and not expired</li>
                        <li>If issues persist, check the Activity Logs for error messages</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trouble-2">
                  <AccordionTrigger>Bans not syncing to Roblox</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p><strong>Possible causes:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Invalid or expired Roblox API key</li>
                        <li>Incorrect Universe ID configured</li>
                        <li>API rate limits exceeded</li>
                        <li>Your game doesn't have the RoModerate integration script</li>
                      </ul>
                      <p className="mt-3"><strong>Solutions:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Verify your Roblox API key in Settings → Roblox API Keys</li>
                        <li>Double-check your Universe ID is correct</li>
                        <li>Ensure your game has the latest RoModerate module installed</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trouble-3">
                  <AccordionTrigger>Commands returning errors</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>If bot commands are returning errors:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Verify you have the correct permissions for that command</li>
                        <li>Check that all required parameters are provided</li>
                        <li>Ensure usernames are spelled correctly (Roblox usernames are case-sensitive)</li>
                        <li>Try using the command from the dashboard instead</li>
                        <li>Check the Activity Logs for detailed error messages</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trouble-4">
                  <AccordionTrigger>Missing permissions error</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>This usually means either:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li>
                          <strong>Your account doesn't have permission</strong> - Contact your server owner or admin to grant you the necessary role
                        </li>
                        <li>
                          <strong>The bot doesn't have Discord permissions</strong> - Ask a server admin to check the bot's role has:
                          <ul className="list-disc list-inside ml-4 mt-1">
                            <li>Manage Messages</li>
                            <li>Send Messages</li>
                            <li>Embed Links</li>
                            <li>Read Message History</li>
                          </ul>
                        </li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trouble-5">
                  <AccordionTrigger>Dashboard not loading or showing errors</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Try these steps:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Clear your browser cache and cookies</li>
                        <li>Try logging out and back in</li>
                        <li>Ensure you're using a supported browser (Chrome, Firefox, Edge)</li>
                        <li>Disable browser extensions that might interfere</li>
                        <li>Check your internet connection</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
