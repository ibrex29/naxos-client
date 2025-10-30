'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    // TODO: integrate API call here
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 w-full p-4 ">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Change Password</h1>
        <p className="text-muted-foreground">
          Update your account password to keep your account secure.
        </p>
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>Enter your current and new password below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button className="w-full mt-4" onClick={handleChangePassword}>
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
