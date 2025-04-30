import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Installation } from '@amp-labs/react'

interface InstallDialogProps {
  isOpen: boolean
  onClose: () => void
  connectionId?: string
  provider: string
  installation?: Installation
}

export function InstallDialog({ isOpen, onClose, connectionId, provider, installation }: InstallDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Integration Status</DialogTitle>
          <DialogDescription>
            {connectionId ? `Integration is connected. ${provider}` : 'Please connect your integration to continue.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {connectionId && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Connection ID: <span className="font-medium">{connectionId}</span>
              </p>
            </div>
        
          )}
          {installation && (
              <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Installation ID: <span className="font-medium">{installation.id}</span>
              </p>
            </div>
          )}
          {!installation && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No installation found.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 