'use client';

import { useState } from 'react';
import { useBloodBank } from '@/lib/blood-bank-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Settings,
  Users,
  Shield,
  Phone,
  Headphones,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Shuffle,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/dummy-data';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';

const getRoleColor = (role: User['role']) => {
  switch (role) {
    case 'admin':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'call_operator':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'volunteer':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getRoleIcon = (role: User['role']) => {
  switch (role) {
    case 'admin':
      return Shield;
    case 'call_operator':
      return Headphones;
    case 'volunteer':
      return Phone;
    default:
      return Users;
  }
};

// Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export function AdminContent() {
  const { users, updateUser, deleteUser, addUser } = useBloodBank();
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    dateOfBirth: '',
    role: '' as User['role'] | '',
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    operators: users.filter((u) => u.role === 'call_operator').length,
    volunteers: users.filter((u) => u.role === 'volunteer').length,
    active: users.filter((u) => u.isActive).length,
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateUser(id, { isActive });
  };

  const handleGeneratePassword = () => {
    setNewUser({ ...newUser, password: generatePassword() });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) return;
    
    const user: User = {
      id: `U${String(Date.now()).slice(-6)}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as User['role'],
      joinedAt: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    addUser(user);
    setNewUser({ name: '', email: '', phone: '', password: '', gender: '', dateOfBirth: '', role: '' });
    setIsNewUserOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">System Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and system settings
          </p>
        </div>
        <Button onClick={() => setIsNewUserOpen(true)} className="bg-primary hover:bg-primary/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Headphones className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.operators}</p>
              <p className="text-sm text-muted-foreground">Call Operators</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Phone className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.volunteers}</p>
              <p className="text-sm text-muted-foreground">Volunteers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Settings className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Gender</TableHead>
                <TableHead className="font-semibold">Date of Birth</TableHead>
                <TableHead className="font-semibold text-center">Is Active?</TableHead>
                <TableHead className="font-semibold text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <span className="capitalize">{user.role.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>{user.role === 'admin' ? 'M' : user.role === 'call_operator' ? 'M' : 'F'}</TableCell>
                  <TableCell>{user.joinedAt ? formatDate(user.joinedAt) : '-'}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={user.isActive} 
                      onCheckedChange={(checked) => handleToggleActive(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add user dialog - Matching reference design */}
      <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-lg font-semibold">Add a User</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Row 1: Name + Password */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Name:</FieldLabel>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder=""
                />
              </Field>

              <Field>
                <FieldLabel>Password:</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder=""
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="secondary"
                    size="icon"
                    onClick={handleGeneratePassword}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
            </div>

            {/* Row 2: Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Email:</FieldLabel>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder=""
                />
              </Field>

              <Field>
                <FieldLabel>Phone:</FieldLabel>
                <Input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder=""
                />
              </Field>
            </div>

            {/* Row 3: Gender + Date of Birth */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Gender:</FieldLabel>
                <Select
                  value={newUser.gender}
                  onValueChange={(value) => setNewUser({ ...newUser, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Date of Birth:</FieldLabel>
                <Input
                  type="date"
                  value={newUser.dateOfBirth}
                  onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                  placeholder="dd/mm/yyyy"
                />
              </Field>
            </div>

            {/* Row 4: Role */}
            <Field>
              <FieldLabel>Role:</FieldLabel>
              <Select
                value={newUser.role}
                onValueChange={(value: User['role']) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Search for a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="call_operator">Call Operator</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter className="border-t pt-4 flex gap-2">
            <Button variant="ghost" onClick={() => setIsNewUserOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={handleAddUser}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
