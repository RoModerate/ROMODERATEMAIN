import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic application preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              General settings configuration coming soon
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center">
                <Bell className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Notification settings coming soon
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Theme customization coming soon
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Account security options</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Security settings coming soon
            </div>
            <Button variant="destructive" size="sm">
              Revoke All Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
