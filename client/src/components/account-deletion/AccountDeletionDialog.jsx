import { useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';

export function AccountDeletionDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('confirm'); // 'confirm' | 'otp' | 'success'
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deletionData, setDeletionData] = useState(null);

  const { user, logout } = useAuth();

  const handleSendOTP = async () => {
    if (!user?.email) {
      setError('User email not found. Please relogin.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authFetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndDelete = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await authFetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete account');
      }

      setDeletionData(data.deletedItems);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      // Logout and clear tokens
      logout();
      window.location.href = '/';
    } else {
      setOpen(false);
      setStep('confirm');
      setOtp('');
      setError('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isOpen) {
        setOpen(true);
      } else {
        handleClose();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          
          {step === 'confirm' && (
            <DialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          )}
          
          {step === 'otp' && (
            <DialogDescription>
              Enter the 6-digit OTP sent to your email address to confirm deletion.
            </DialogDescription>
          )}
          
          {step === 'success' && (
            <DialogDescription className="text-green-600">
              Your account has been permanently deleted.
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 'confirm' && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will permanently delete:
                <ul className="list-disc list-inside mt-2 text-sm">
                  <li>All your vaults and memory slots</li>
                  <li>All uploaded media files (photos and videos)</li>
                  <li>All text content and messages</li>
                  <li>All scheduled deliveries</li>
                  <li>Your account information and activity logs</li>
                </ul>
                This action cannot be reversed.
              </AlertDescription>
            </Alert>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSendOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Enter 6-digit OTP
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('confirm')}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleVerifyAndDelete}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Deletion'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <strong>Account successfully deleted!</strong>
                <br />
                The following items were removed:
                <ul className="list-disc list-inside mt-2 text-sm">
                  <li>{deletionData?.slots || 0} memory slots</li>
                  <li>{deletionData?.vaults || 0} vaults</li>
                  <li>{deletionData?.schedulings || 0} scheduled deliveries</li>
                  <li>{deletionData?.mediaFiles || 0} uploaded media files</li>
                  <li>{deletionData?.inactivityLogs || 0} activity logs</li>
                  <li>Your account profile</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <DialogFooter>
              <Button onClick={handleClose}>
                Continue
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
