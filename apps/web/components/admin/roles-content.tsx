'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Phone, Heart, Plus, Edit, Trash2, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';

const roles = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access with all permissions',
    icon: Shield,
    color: 'bg-primary/10 text-primary',
    userCount: 2,
    permissions: ['manage_users', 'manage_roles', 'manage_requests', 'manage_donors', 'view_reports', 'system_settings'],
  },
  {
    id: 'volunteer',
    name: 'Volunteer',
    description: 'Limited access for volunteer operations',
    icon: Heart,
    color: 'bg-accent text-accent-foreground',
    userCount: 12,
    permissions: ['view_requests', 'view_donors', 'update_status'],
  },
];

const allPermissions = [
  { id: 'manage_users', label: 'Manage Users', description: 'Add, edit, delete users' },
  { id: 'manage_roles', label: 'Manage Roles', description: 'Create and modify roles' },
  { id: 'manage_requests', label: 'Manage Requests', description: 'Create and update blood requests' },
  { id: 'manage_donors', label: 'Manage Donors', description: 'Add and edit donor information' },
  { id: 'view_donors', label: 'View Donors', description: 'View donor list and details' },
  { id: 'view_requests', label: 'View Requests', description: 'View blood requests' },
  { id: 'view_reports', label: 'View Reports', description: 'Access analytics and reports' },
  { id: 'add_pledges', label: 'Add Pledges', description: 'Add new donor pledges' },
  { id: 'update_status', label: 'Update Status', description: 'Update request/donor status' },
  { id: 'system_settings', label: 'System Settings', description: 'Access system configuration' },
];

export function RolesContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles Management</h1>
          <p className="text-muted-foreground">Define roles and permissions for system users</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {roles.map((role) => {
          const RoleIcon = role.icon;
          return (
            <Card key={role.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${role.color.includes('primary') ? 'bg-primary' : role.color.includes('secondary') ? 'bg-secondary' : 'bg-accent'}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${role.color}`}>
                      <RoleIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{role.userCount} users assigned</span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {role.id !== 'admin' && (
                    <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>Role Name:</FieldLabel>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
              />
            </Field>
            <Field>
              <FieldLabel>Description:</FieldLabel>
              <Input
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Enter role description"
              />
            </Field>
            <div className="space-y-3">
              <FieldLabel>Permissions:</FieldLabel>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {allPermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-md"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <div>
                      <label
                        htmlFor={permission.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.label}
                      </label>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
