import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const romoderateIcon = "/romoderate-icon.png";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={romoderateIcon} 
                alt="RoModerate" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold">RoModerate</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="gap-2"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="flex items-center justify-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="h-9 w-9 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-4">Privacy Policy</h1>
        <p className="text-center text-muted-foreground mb-12">
          Last Updated: January 25, 2025
        </p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Welcome to RoModerate's Privacy Policy. This policy describes how we collect, use, store, and protect your 
                personal information when you use our Discord bot hosting and moderation services.
              </p>
              <p>
                We are committed to protecting your privacy and ensuring the security of your personal data. By using RoModerate, 
                you consent to the data practices described in this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <h4 className="font-semibold text-foreground">2.1 Discord Information</h4>
              <p>When you authenticate with Discord, we collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Discord User ID</li>
                <li>Username and discriminator</li>
                <li>Avatar URL</li>
                <li>Email address (if you grant permission)</li>
                <li>List of Discord servers where you have management permissions</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6">2.2 Server Information</h4>
              <p>For Discord servers you connect to RoModerate:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Server ID, name, and icon</li>
                <li>Channel IDs and names for configured moderation channels</li>
                <li>Bot configuration and settings</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6">2.3 Moderation Data</h4>
              <p>We store moderation-related information including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ban records (player IDs, reasons, moderator actions)</li>
                <li>Appeal submissions and responses</li>
                <li>Player reports and moderation tickets</li>
                <li>Moderation logs and activity history</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6">2.4 Technical Information</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP addresses (for security and fraud prevention)</li>
                <li>Browser type and version</li>
                <li>Session information and cookies</li>
                <li>Usage data and analytics</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6 flex items-center gap-2">
                2.5 Marketplace Data
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">New</span>
              </h4>
              <p>For users participating in the RoModerate Marketplace, we collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Listing information (titles, descriptions, images, prices)</li>
                <li>Transaction history and purchase records</li>
                <li>Buyer and seller ratings and reviews</li>
                <li>Wishlist and favorite items</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Escrow transaction data and status updates</li>
                <li>Dispute records and resolution outcomes</li>
                <li>Referral codes and reward balances</li>
                <li>Seller storefront customizations (banners, logos, featured items)</li>
                <li>Level, XP, achievements, and leaderboard rankings</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6">2.6 Uploaded Images</h4>
              <p>When you upload images to marketplace listings:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Images are compressed and stored as base64-encoded data</li>
                <li>Images are limited to 5MB each before compression</li>
                <li>We store up to 5 images per listing</li>
                <li>Images may be analyzed for inappropriate content or policy violations</li>
                <li>You retain ownership but grant us a license to display them</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide and maintain the Service</li>
                <li>To authenticate users and manage accounts</li>
                <li>To host and operate Discord bots on your behalf</li>
                <li>To store and manage moderation data (bans, appeals, reports)</li>
                <li>To facilitate marketplace transactions through our escrow system</li>
                <li>To process payments and manage refunds securely</li>
                <li>To display seller ratings, reviews, and reputation scores</li>
                <li>To prevent fraudulent transactions and marketplace abuse</li>
                <li>To award achievements, track levels, and update leaderboards</li>
                <li>To send transaction notifications (purchases, offers, bids)</li>
                <li>To resolve disputes between buyers and sellers</li>
                <li>To communicate important updates about the Service</li>
                <li>To improve and optimize the Service</li>
                <li>To detect and prevent fraud, abuse, or security issues</li>
                <li>To comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Storage and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We take data security seriously and implement appropriate technical and organizational measures to protect 
                your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Data is stored in secure, encrypted databases</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
                <li>We use industry-standard encryption for data transmission (HTTPS/TLS)</li>
                <li>Bot tokens and API keys are encrypted at rest</li>
                <li>Regular security audits and updates</li>
              </ul>
              <p className="mt-4">
                While we strive to protect your personal information, no method of transmission over the Internet or electronic 
                storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>We do not sell your personal information. We may share your data only in the following circumstances:</p>
              
              <h4 className="font-semibold text-foreground mt-4">5.1 Service Providers</h4>
              <p>
                We may share data with third-party service providers who assist in operating our Service (e.g., hosting providers, 
                database services). These providers are contractually obligated to protect your data.
              </p>

              <h4 className="font-semibold text-foreground mt-4">5.2 Discord and Roblox</h4>
              <p>
                We interact with Discord's and Roblox's APIs to provide our services. This interaction is subject to their 
                respective privacy policies.
              </p>

              <h4 className="font-semibold text-foreground mt-4">5.3 Legal Requirements</h4>
              <p>
                We may disclose your information if required by law, court order, or government regulation, or to protect the 
                rights, property, or safety of RoModerate, our users, or others.
              </p>

              <h4 className="font-semibold text-foreground mt-4">5.4 Marketplace Privacy</h4>
              <p>In the marketplace context:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Buyer and seller usernames are visible to transaction participants</li>
                <li>Reviews and ratings are publicly displayed on user profiles</li>
                <li>Storefront information (bio, social links) is publicly accessible if enabled</li>
                <li>Leaderboard rankings show usernames and scores publicly</li>
                <li>Transaction details are private except to involved parties and moderators</li>
                <li>Payment information is never shared and is handled by secure processors</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We retain your personal information for as long as necessary to provide the Service and fulfill the purposes 
                outlined in this Privacy Policy. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Account information: Retained while your account is active</li>
                <li>Moderation data: Retained to maintain moderation history and appeal records</li>
                <li>Marketplace transactions: Retained for 7 years for legal and tax compliance</li>
                <li>Reviews and ratings: Retained permanently unless removed for policy violations</li>
                <li>Listing images: Retained while listing is active, deleted 30 days after removal</li>
                <li>Dispute records: Retained for 3 years after resolution</li>
                <li>Session data: Retained for 7 days</li>
                <li>Logs: Retained for up to 90 days for security and debugging purposes</li>
              </ul>
              <p className="mt-4">
                You may request deletion of your data at any time by contacting us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us through our support channels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We use cookies and similar tracking technologies to maintain your session and improve your experience:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Session Cookies:</strong> Essential for authentication and maintaining your logged-in state</li>
                <li><strong>Analytics:</strong> To understand how users interact with the Service</li>
              </ul>
              <p className="mt-4">
                You can control cookie settings through your browser, but disabling cookies may limit functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Our Service is intended for users aged 13 and older, in compliance with Discord's and Roblox's age requirements. 
                We do not knowingly collect personal information from children under 13.
              </p>
              <p>
                If we become aware that we have collected personal information from a child under 13, we will take steps to 
                delete such information promptly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Your information may be transferred to and maintained on servers located outside of your jurisdiction where 
                data protection laws may differ. By using the Service, you consent to this transfer.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting 
                the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p>
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us through our 
                Discord community or support channels.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button 
            size="lg"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            Back to Home
          </Button>
        </div>
      </div>

      <footer className="py-8 border-t bg-card/30 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={romoderateIcon} alt="RoModerate" className="h-6 w-6 object-contain" />
            <span className="font-bold">RoModerate</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Professional Discord & Roblox Moderation
          </p>
        </div>
      </footer>
    </div>
  );
}
