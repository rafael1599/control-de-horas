import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLogin: React.FC = () => {
  const { isAdmin, login, loginError } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // If the user successfully logs in (isAdmin becomes true), close the dialog.
    if (isAdmin && isOpen) {
      setIsOpen(false);
    }
  }, [isAdmin, isOpen]);

  const handleLogin = () => {
    login(password);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPassword('');
    // In a future iteration, we might want a function in the context to clear the loginError.
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Don't render the login button if the user is already an admin
  if (isAdmin) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4"
      >
        <Settings className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acceso Administrador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <div className="flex gap-2">
              <Button onClick={handleLogin} className="flex-1">
                Ingresar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminLogin;