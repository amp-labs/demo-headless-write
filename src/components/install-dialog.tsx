import type { Installation } from '@amp-labs/react'

import { Dialog, DialogContent, DialogDescription,DialogHeader, DialogTitle } from './ui/dialog'
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
      <DialogContent className="sm:max-w-[1200px]">
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
              No installation found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 