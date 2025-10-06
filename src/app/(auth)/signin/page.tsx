'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getSession, signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { rolesMap } from '@/types/form';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const demoLogins = [
    {
      role: 'Admin',
      email: 'admin@naxoshealthcare.com',
      password: 'password',
    },
    {
      role: 'Sales',
      email: 'sales@naxoshealthcare.com',
      password: 'password',
    },
    {
      role: 'Warehouse',
      email: 'warehouse@naxoshealthcare.com',
      password: 'password',
    },
    {
      role: 'Finance',
      email: 'finance@naxoshealthcare.com',
      password: 'password',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      toast.error('Please fill in all fields');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        toast.error('Login failed. Please check your credentials.');
        return;
      }

      const session = await getSession();
      if (session?.user?.role) {
        const redirectTo = rolesMap[session.user.role] || '/';
        toast.success('Login successful!');
        router.push(redirectTo);
      } else {
        setError('Unable to determine user role');
        toast.error('Login failed: Role not found.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast.error('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demo: { email: string; password: string }) => {
    setFormData({ email: demo.email, password: demo.password });
    await handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
            <div className="text-primary font-bold text-2xl">N</div>
          </div>
          <div>
            <CardTitle className="text-2xl text-primary">Naxos Healthcare Ltd</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Enterprise Resource Planning System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Quick Demo Access:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {demoLogins.map((demo) => (
                <Button
                  key={demo.role}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleDemoLogin(demo)}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        demo.role === 'Admin'
                          ? 'bg-primary'
                          : demo.role === 'Sales'
                          ? 'bg-success'
                          : demo.role === 'Warehouse'
                          ? 'bg-info'
                          : 'bg-secondary'
                      }`}
                    />
                    <span>{demo.role} Portal</span>
                  </div>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              All demo accounts use password: &quot;password&quot;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}