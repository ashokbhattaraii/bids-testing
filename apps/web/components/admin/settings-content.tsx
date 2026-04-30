'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  Mail, 
  Shield, 
  Globe, 
  Database, 
  Clock,
  Save,
  Building2,
  Phone
} from 'lucide-react';
import { Field, FieldLabel } from '@/components/ui/field';

export function SettingsContent() {
  const [settings, setSettings] = useState({
    organizationName: 'Hamro Life Bank',
    organizationAddress: 'Kathmandu, Nepal',
    contactEmail: 'info@hamrolifebank.org',
    contactPhone: '+977-1-4123456',
    hotlineNumber: '1166',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    autoAssignRequests: true,
    requireApproval: true,
    sessionTimeout: 30,
    maintenanceMode: false,
    backupFrequency: 'daily',
    defaultUrgency: 'high',
  });

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure system preferences and organization details</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Organization</CardTitle>
                <CardDescription>Basic organization information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>Organization Name</FieldLabel>
              <Input
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Address</FieldLabel>
              <Textarea
                value={settings.organizationAddress}
                onChange={(e) => setSettings({ ...settings, organizationAddress: e.target.value })}
                rows={2}
              />
            </Field>
            <Field>
              <FieldLabel>Contact Email</FieldLabel>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Contact Phone</FieldLabel>
                <Input
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Hotline Number</FieldLabel>
                <Input
                  value={settings.hotlineNumber}
                  onChange={(e) => setSettings({ ...settings, hotlineNumber: e.target.value })}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Browser push notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Security and access settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>Session Timeout (minutes)</FieldLabel>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
              />
            </Field>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Require Approval for New Users</p>
                <p className="text-sm text-muted-foreground">Admin must approve new registrations</p>
              </div>
              <Switch
                checked={settings.requireApproval}
                onCheckedChange={(checked) => setSettings({ ...settings, requireApproval: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Auto-assign Requests</p>
                <p className="text-sm text-muted-foreground">Automatically assign requests to operators</p>
              </div>
              <Switch
                checked={settings.autoAssignRequests}
                onCheckedChange={(checked) => setSettings({ ...settings, autoAssignRequests: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">System</CardTitle>
                <CardDescription>System and maintenance settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Disable public access temporarily</p>
                </div>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
            <Field>
              <FieldLabel>Backup Frequency</FieldLabel>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </Field>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <div className="flex items-center gap-2 text-secondary">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Last Backup: 2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
