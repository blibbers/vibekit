import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userApi, UpdateProfileData, UpdatePreferencesData } from '@/lib/api'
import { useTheme } from '@/contexts/ThemeContext'
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Camera, Mail, Bell, Moon, Sun, Monitor, Trash2, Upload, Loader2 } from 'lucide-react'

export default function Account() {
  const { user, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
    address: {
      street: user?.profile?.address?.street || '',
      city: user?.profile?.address?.city || '',
      state: user?.profile?.address?.state || '',
      country: user?.profile?.address?.country || '',
      postalCode: user?.profile?.address?.postalCode || ''
    }
  })

  const [preferences, setPreferences] = useState({
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true
    },
    theme: user?.preferences?.theme || 'light'
  })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const updateData: UpdateProfileData = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        profile: {
          bio: profileForm.bio,
          address: profileForm.address
        }
      }

      await userApi.updateProfile(updateData)
      await refreshUser()
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setIsAvatarUploading(true)

    try {
      await userApi.uploadAvatar(file)
      await refreshUser()
      toast.success('Profile picture updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload profile picture')
    } finally {
      setIsAvatarUploading(false)
    }
  }

  const handlePreferencesUpdate = async (field: string, value: any) => {
    try {
      const updateData: UpdatePreferencesData = {}
      
      if (field.startsWith('notifications.')) {
        updateData.notifications = {
          ...preferences.notifications,
          [field.split('.')[1]]: value
        }
        setPreferences(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [field.split('.')[1]]: value
          }
        }))
      } else if (field === 'theme') {
        updateData.theme = value
        setPreferences(prev => ({ ...prev, theme: value }))
        setTheme(value)
      }

      await userApi.updatePreferences(updateData)
      await refreshUser()
      toast.success('Preferences updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update preferences')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount()
      toast.success('Account deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
    }
  }

  const getSocialProviders = () => {
    const providers = []
    if (user?.socialLogins?.google && Object.keys(user.socialLogins.google).length > 0) providers.push('Google')
    if (user?.socialLogins?.apple && Object.keys(user.socialLogins.apple).length > 0) providers.push('Apple')
    if (user?.socialLogins?.facebook && Object.keys(user.socialLogins.facebook).length > 0) providers.push('Facebook')
    return providers
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader>
        <PageHeaderHeading>Account Settings</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your profile, preferences, and account settings
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profile?.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAvatarUploading}
                >
                  {isAvatarUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-medium">{user.firstName} {user.lastName}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAvatarUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email address cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Address</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={profileForm.address.street}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileForm.address.city}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={profileForm.address.state}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileForm.address.country}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={profileForm.address.postalCode}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Social login providers connected to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {getSocialProviders().length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {getSocialProviders().map((provider) => (
                  <Badge key={provider} variant="secondary">
                    {provider}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No social accounts connected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Manage your notification and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => handlePreferencesUpdate('notifications.email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => handlePreferencesUpdate('notifications.push', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Theme */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Appearance</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => handlePreferencesUpdate('theme', 'light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => handlePreferencesUpdate('theme', 'dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => handlePreferencesUpdate('theme', 'system')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that will affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all of your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}