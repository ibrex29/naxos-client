import { useState } from 'react';

import { Scan, Camera, Keyboard, Check, X } from 'lucide-react';
import { DialogHeader , Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export function BarcodeScanner({ 
  isOpen, 
  onClose, 
  onScan, 
  title = "Scan Barcode" 
}: BarcodeScannerProps) {
  const [inputMethod, setInputMethod] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      onClose();
    }
  };

  const simulateBarcodeScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      const mockBarcodes = [
        '1234567890123',
        '9876543210987',
        '5555555555555',
        '1111111111111'
      ];
      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      onScan(randomBarcode);
      setIsScanning(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Scan className="h-5 w-5" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Input Method Toggle */}
          <div className="flex space-x-2">
            <Button
              variant={inputMethod === 'camera' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMethod('camera')}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
            <Button
              variant={inputMethod === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMethod('manual')}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Manual
            </Button>
          </div>

          {inputMethod === 'camera' ? (
            <div className="space-y-4">
              {/* Mock Camera View */}
              <div className="relative aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                {isScanning ? (
                  <div className="text-center space-y-2">
                    <div className="animate-pulse">
                      <Scan className="h-12 w-12 mx-auto text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Scanning...</p>
                    <Badge variant="secondary">Point camera at barcode</Badge>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Position barcode in frame</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={simulateBarcodeScan} 
                  disabled={isScanning}
                  className="flex-1"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode-input">Enter Barcode</Label>
                <Input
                  id="barcode-input"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Type or paste barcode..."
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Use Barcode
                </Button>
                <Button variant="outline" onClick={onClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}