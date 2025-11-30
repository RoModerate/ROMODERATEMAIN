import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const romoderateIcon = "/romoderate-icon.png";

export default function Terms() {
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
            <FileText className="h-9 w-9 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center mb-4">Terms of Service</h1>
        <p className="text-center text-muted-foreground mb-12">
          Last Updated: January 25, 2025
        </p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By accessing or using RoModerate ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Service.
              </p>
              <p>
                RoModerate provides Discord bot hosting and moderation tools for Roblox game developers and community managers.
                We reserve the right to modify these terms at any time, and your continued use of the Service constitutes acceptance of any changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To use RoModerate, you must authenticate using Discord OAuth. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the security of your Discord account</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your Discord account complies with Discord's Terms of Service</li>
                <li>Providing accurate and current information</li>
              </ul>
              <p>
                You must be at least 13 years old to use this Service, in compliance with Discord's and Roblox's age requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Use the Service to harass, abuse, or harm others</li>
                <li>Distribute malware, viruses, or any harmful code</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated scripts or bots to access the Service without permission</li>
                <li>Violate Discord's or Roblox's Terms of Service</li>
                <li>Engage in fraudulent marketplace activities or price manipulation</li>
                <li>List stolen, hacked, or illegally obtained digital assets</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                4. RoModerate Marketplace
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">New</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <h4 className="font-semibold text-foreground">4.1 Marketplace Overview</h4>
              <p>
                RoModerate Marketplace is a platform for buying and selling Roblox digital assets, including UGC items, 
                game passes, plugins, 3D models, and audio. All transactions are protected by our escrow system.
              </p>

              <h4 className="font-semibold text-foreground mt-6">4.2 Prohibited Items</h4>
              <p>The following items are strictly prohibited from being listed on the marketplace:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Stolen, hacked, or compromised Roblox accounts or assets</li>
                <li>Items that violate Roblox's Terms of Service or Community Standards</li>
                <li>Counterfeit or fraudulently obtained items</li>
                <li>Exploits, cheats, or malicious scripts</li>
                <li>Items containing adult content, hate speech, or illegal material</li>
                <li>Accounts, limiteds, or items against Roblox's trading policies</li>
                <li>Services that involve account access or password sharing</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6">4.3 Seller Responsibilities</h4>
              <p>As a seller, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, truthful descriptions and images of listed items</li>
                <li>Own or have legal rights to sell the items you list</li>
                <li>Deliver purchased items within the agreed timeframe (typically 24-48 hours)</li>
                <li>Respond to buyer inquiries promptly and professionally</li>
                <li>Maintain a minimum 80% completion rate to remain in good standing</li>
                <li>Not artificially inflate prices or engage in price manipulation</li>
                <li>Accept escrow protection on all transactions</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6">4.4 Buyer Responsibilities</h4>
              <p>As a buyer, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Review item descriptions and seller ratings carefully before purchasing</li>
                <li>Complete payment through the platform's escrow system</li>
                <li>Confirm receipt of items within 72 hours of delivery</li>
                <li>Not request chargebacks or payment reversals for completed transactions</li>
                <li>Report issues or disputes through the official dispute resolution system</li>
                <li>Leave honest, constructive reviews after transaction completion</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6">4.5 Listing Requirements</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All listings must include clear images (up to 5) showing the actual item</li>
                <li>Titles must accurately represent the item (no clickbait or misleading titles)</li>
                <li>Descriptions must include all relevant details about condition, features, and limitations</li>
                <li>Prices must be reasonable and not grossly inflated</li>
                <li>You may upload up to 20 active listings at once</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                5. Escrow System & Payment Protection
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Important</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <h4 className="font-semibold text-foreground">5.1 How Escrow Works</h4>
              <p>
                All marketplace transactions are protected by our secure escrow system:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Buyer initiates purchase and funds are held in escrow</li>
                <li>Seller is notified and has 48 hours to deliver the item</li>
                <li>Buyer confirms receipt and satisfaction within 72 hours</li>
                <li>Upon buyer confirmation, funds are released to seller</li>
                <li>If no confirmation, funds auto-release after 72 hours</li>
              </ol>

              <h4 className="font-semibold text-foreground mt-6">5.2 Escrow Fees</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Platform fee: 5% of transaction amount (charged to seller)</li>
                <li>Payment processing fee: 2.9% + $0.30 (for USD transactions)</li>
                <li>Robux transactions: 5% platform fee only</li>
              </ul>

              <h4 className="font-semibold text-foreground mt-6">5.3 Refunds and Cancellations</h4>
              <p>
                Refunds are issued in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Seller fails to deliver within 48 hours - full refund</li>
                <li>Item significantly different from description - full refund</li>
                <li>Item is non-functional or broken - full refund</li>
                <li>Buyer cancels before seller accepts - full refund minus processing fees</li>
              </ul>
              <p className="mt-4">
                Sellers can cancel transactions before accepting, but frequent cancellations may result in account restrictions.
              </p>

              <h4 className="font-semibold text-foreground mt-6">5.4 Dispute Resolution</h4>
              <p>
                If a dispute arises:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Open a dispute ticket within 7 days of transaction</li>
                <li>Provide evidence (screenshots, chat logs, transaction details)</li>
                <li>Our moderation team reviews within 2-3 business days</li>
                <li>Decision is final and binding on both parties</li>
                <li>Funds are released according to the ruling</li>
              </ol>
              <p className="mt-4 font-semibold text-foreground">
                RoModerate acts as a neutral third party and makes final decisions based on evidence provided.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Bot Hosting and Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                RoModerate provides Discord bot hosting services. We strive to maintain high uptime and reliability, 
                but we do not guarantee uninterrupted service. The Service is provided "as is" without warranties of any kind.
              </p>
              <p>
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing valid bot tokens and API keys</li>
                <li>Configuring your Discord server and Roblox integrations correctly</li>
                <li>Ensuring your bot complies with Discord's Developer Terms of Service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We collect and process data as described in our Privacy Policy. By using the Service, you consent to such processing 
                and warrant that all data provided by you is accurate.
              </p>
              <p>
                We store:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Discord user information (username, avatar, email)</li>
                <li>Discord server information you have management access to</li>
                <li>Moderation data (bans, appeals, reports, tickets)</li>
                <li>Bot configuration and settings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                The Service and its original content, features, and functionality are owned by RoModerate and are protected by 
                international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of any content you create or upload to the Service, but grant us a license to use, 
                store, and display such content as necessary to provide the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, 
                and with or without notice. Upon termination, your right to use the Service will immediately cease.
              </p>
              <p>
                You may terminate your account at any time by discontinuing use of the Service and contacting us to request 
                account deletion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To the fullest extent permitted by law, RoModerate shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
                or any loss of data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                <li>Any interruption or cessation of transmission to or from the Service</li>
                <li>Any bugs, viruses, or other harmful code that may be transmitted through the Service</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. RoModerate makes no warranties, expressed or implied, 
                and hereby disclaims all warranties including, without limitation, implied warranties of merchantability, fitness for 
                a particular purpose, or non-infringement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide 
                at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be 
                determined at our sole discretion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have any questions about these Terms of Service, please contact us through our Discord community 
                or support channels.
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
