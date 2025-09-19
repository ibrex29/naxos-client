/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getSession, signIn } from 'next-auth/react';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { rolesMap } from '@/types/form';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        toast.error('Login failed. Please check your credentials.');
        return;
      }

 // Fetch session to get user role
      const session = await getSession();
      if (session?.user?.role) {
        const redirectTo = rolesMap[session.user.role] || '/'; 
        toast.success('Login successful!');
        router.push(redirectTo);
      } else {
        setError('Unable to determine user role');
        toast.error('Login failed: Role not found.');
      }
    } catch (err: any)
    {
      setError(err.message || 'An unexpected error occurred');
      toast.error('An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (username: string, password: string) => {
    setFormData({
      username,
      password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <GraduationCap className="md:h-12 md:w-12 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">
              <span className="text-accent">Project</span> Naxos
            </h1>
          </div>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the alumni portal</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Username</Label>
                <Input
                  id="username"
                  type="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400"
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
                    className="border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 pr-10"
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
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                type="submit"
                disabled={isLoading || !formData.username || !formData.password}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <Link href="/register" className="text-sm text-blue-500 hover:underline">
                  Don’t have an account? Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
{/* 
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
            <CardDescription>Click to quickly fill login form</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-gray-200 text-gray-900 hover:bg-blue-50"
                onClick={() => handleQuickLogin('admin@example.com', 'StrongPassword123!')}
              >
                <div className="text-left">
                  <div>Admin Demo</div>
                  <div className="text-xs text-gray-600">admin@example.com</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-200 text-gray-900 hover:bg-blue-50"
                onClick={() => handleQuickLogin('john@example.com', 'password')}
              >
                <div className="text-left">
                  <div>Alumni Demo</div>
                  <div className="text-xs text-gray-600">john@example.com</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default LoginPage;