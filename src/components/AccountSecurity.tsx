import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Smartphone, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AccountSecurityProps {
  userRole: 'client' | 'owner';
}

export function AccountSecurity({ userRole }: AccountSecurityProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Security settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [deviceTracking, setDeviceTracking] = useState(true);

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error', 
        description: 'New passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive'
      });
      return;
    }

    // Here you would call the password change API
    toast({
      title: 'Password Updated',
      description: 'Your password has been changed successfully.'
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordDialog(false);
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    if (enabled) {
      setShowTwoFactorDialog(true);
    } else {
      setTwoFactorEnabled(false);
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled.'
      });
    }
  };

  const enableTwoFactor = () => {
    setTwoFactorEnabled(true);
    setShowTwoFactorDialog(false);
    toast({
      title: '2FA Enabled',
      description: 'Two-factor authentication is now active on your account.'
    });
  };

  const securityScore = () => {
    let score = 0;
    if (twoFactorEnabled) score += 25;
    if (loginAlerts) score += 20;
    if (sessionTimeout) score += 25;
    if (deviceTracking) score += 30;
    return score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Account Security</h2>
        <p className="text-white/70">Protect your account with advanced security features</p>
      </div>

      {/* Security Score */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70">Current Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(securityScore())}`}>
              {securityScore()}/100
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                securityScore() >= 80 ? 'bg-green-400' : 
                securityScore() >= 60 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${securityScore()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Security */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Password</p>
              <p className="text-white/60 text-sm">Last changed 30 days ago</p>
            </div>
            <Button onClick={() => setShowPasswordDialog(true)}>
              Change Password
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-white/60 text-sm">Add an extra layer of security</p>
            </div>
            <div className="flex items-center gap-2">
              {twoFactorEnabled && (
                <Badge className="bg-green-500 text-white">Enabled</Badge>
              )}
              <Switch 
                checked={twoFactorEnabled} 
                onCheckedChange={handleTwoFactorToggle}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Security */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Login Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Login Alerts</p>
              <p className="text-white/60 text-sm">Get notified of new login attempts</p>
            </div>
            <Switch checked={loginAlerts} onCheckedChange={setLoginAlerts} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto Session Timeout</p>
              <p className="text-white/60 text-sm">Automatically log out after inactivity</p>
            </div>
            <Switch checked={sessionTimeout} onCheckedChange={setSessionTimeout} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Device Tracking</p>
              <p className="text-white/60 text-sm">Monitor devices accessing your account</p>
            </div>
            <Switch checked={deviceTracking} onCheckedChange={setDeviceTracking} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Security Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="flex-1">
              <p className="text-white text-sm">Successful login from Chrome</p>
              <p className="text-white/60 text-xs">Today at 2:30 PM • Mexico City, MX</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div className="flex-1">
              <p className="text-white text-sm">New device detected</p>
              <p className="text-white/60 text-xs">Yesterday at 8:15 AM • Unknown location</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-black/90 backdrop-blur border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white/90 text-sm font-medium">Current Password</label>
              <div className="relative">
                <Input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-white/90 text-sm font-medium">New Password</label>
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div>
              <label className="text-white/90 text-sm font-medium">Confirm New Password</label>
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Setup Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent className="bg-black/90 backdrop-blur border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Enable Two-Factor Authentication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <Smartphone className="w-16 h-16 mx-auto text-primary" />
            <p className="text-white">
              Scan the QR code with your authenticator app or enter the setup code manually.
            </p>
            <div className="bg-white p-4 rounded-lg">
              <div className="w-32 h-32 bg-gray-200 mx-auto mb-4 rounded flex items-center justify-center">
                QR Code
              </div>
              <p className="text-sm text-gray-600">Setup Code: ABCD-EFGH-IJKL-MNOP</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTwoFactorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={enableTwoFactor}>
              Enable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}