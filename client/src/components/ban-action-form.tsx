import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ban, AlertTriangle, ShieldOff, UserX, Upload, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RobloxPlayer {
  id: string;
  username: string;
  displayName?: string;
  joinDate: string;
  accountAge: number;
  verified: boolean;
  banned: boolean;
}

interface BanActionFormProps {
  player: RobloxPlayer;
  serverId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type ActionType = "ban" | "tempban" | "warn" | "unban";

export function BanActionForm({ player, serverId, onSuccess, onCancel }: BanActionFormProps) {
  const { toast } = useToast();
  const [actionType, setActionType] = useState<ActionType>("ban");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("7");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const banMutation = useMutation({
    mutationFn: async (data: {
      actionType: ActionType;
      reason: string;
      duration?: number;
      evidence?: string[];
    }) => {
      return apiRequest("POST", "/api/moderation/action", {
        serverId,
        robloxUserId: player.id,
        robloxUsername: player.username,
        actionType: data.actionType,
        reason: data.reason,
        duration: data.duration,
        evidence: data.evidence,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bans?serverId=${serverId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/analytics?serverId=${serverId}`] });
      toast({
        title: "Action Successful",
        description: `${actionType === "ban" ? "Ban" : actionType === "tempban" ? "Temporary ban" : actionType === "warn" ? "Warning" : "Unban"} action has been logged and executed.`,
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Action Failed",
        description: "Failed to execute moderation action. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() && actionType !== "unban") {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this action.",
        variant: "destructive",
      });
      return;
    }

    banMutation.mutate({
      actionType,
      reason: reason.trim(),
      duration: actionType === "tempban" ? parseInt(duration) : undefined,
      evidence: evidence.length > 0 ? evidence : undefined,
    });
  };

  const addEvidence = () => {
    if (evidenceUrl.trim() && !evidence.includes(evidenceUrl.trim())) {
      setEvidence([...evidence, evidenceUrl.trim()]);
      setEvidenceUrl("");
    }
  };

  const removeEvidence = (url: string) => {
    setEvidence(evidence.filter((e) => e !== url));
  };

  const actionConfig = {
    ban: {
      icon: Ban,
      title: "Permanent Ban",
      description: "Permanently ban this player from your server",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    tempban: {
      icon: UserX,
      title: "Temporary Ban",
      description: "Ban this player for a specified duration",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    warn: {
      icon: AlertTriangle,
      title: "Warning",
      description: "Issue a warning to this player",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    unban: {
      icon: ShieldOff,
      title: "Unban Player",
      description: "Remove ban from this player",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  };

  const config = actionConfig[actionType];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-lg ${config.bg} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <CardTitle>{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Target Player</p>
            <p className="text-sm text-muted-foreground">{player.username} (ID: {player.id})</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-type">Action Type</Label>
            <Select value={actionType} onValueChange={(value: ActionType) => setActionType(value)}>
              <SelectTrigger id="action-type" data-testid="select-action-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ban">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    Permanent Ban
                  </div>
                </SelectItem>
                <SelectItem value="tempban">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4" />
                    Temporary Ban
                  </div>
                </SelectItem>
                <SelectItem value="warn">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Warning
                  </div>
                </SelectItem>
                <SelectItem value="unban">
                  <div className="flex items-center gap-2">
                    <ShieldOff className="h-4 w-4" />
                    Unban
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {actionType === "tempban" && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                data-testid="input-duration"
              />
            </div>
          )}

          {actionType !== "unban" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Exploiting, Alt account, Toxic behavior..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={3}
                data-testid="input-reason"
              />
              <p className="text-xs text-muted-foreground">
                This will be visible to other moderators and in logs
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Evidence (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Screenshot URL or log link..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEvidence();
                  }
                }}
                data-testid="input-evidence"
              />
              <Button type="button" variant="outline" onClick={addEvidence} data-testid="button-add-evidence">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {evidence.length > 0 && (
              <div className="space-y-2 mt-2">
                {evidence.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                    data-testid={`evidence-item-${index}`}
                  >
                    <span className="flex-1 truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidence(url)}
                      data-testid={`button-remove-evidence-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={banMutation.isPending}
              data-testid="button-submit-action"
            >
              {banMutation.isPending ? "Processing..." : `Execute ${actionConfig[actionType].title}`}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={banMutation.isPending}
                data-testid="button-cancel-action"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
