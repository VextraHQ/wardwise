"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCanvasserDialogProps {
  canvasserId: string | null;
  canvasserName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (canvasserId: string) => void;
  isLoading?: boolean;
}

export function DeleteCanvasserDialog({
  canvasserId,
  canvasserName,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: DeleteCanvasserDialogProps) {
  const handleConfirm = () => {
    if (canvasserId) {
      onConfirm(canvasserId);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            canvasser record{canvasserName && ` for ${canvasserName}`}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
