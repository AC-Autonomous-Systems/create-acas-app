'use client';

import { APIKey } from '@/app/api/api-keys/types';
import Loading from '@/components/icons/loading';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
type DeleteAPIKeyModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAPIKey: APIKey;
  setSelectedAPIKey: React.Dispatch<React.SetStateAction<APIKey | undefined>>;
};
export default function DeleteAPIKeyModal({
  open,
  setOpen,
  selectedAPIKey,
  setSelectedAPIKey,
}: DeleteAPIKeyModalProps) {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const { toast } = useToast();
  const nextRouter = useRouter();
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const [isDeleteAPIKeyLoading, setIsDeleteAPIKeyLoading] = useState(false);
  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <Dialog
      open={open}
      onOpenChange={(newVal) => {
        if (!newVal) {
          setSelectedAPIKey(undefined);
        }
        setOpen(newVal);
      }}
    >
      <DialogContent className="w-[90%]">
        <DialogHeader>
          <DialogTitle>Delete API Key</DialogTitle>
          <DialogDescription className="mt-4">
            Are you sure you want to delete {selectedAPIKey.name}? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={async () => {
              setIsDeleteAPIKeyLoading(true);
              try {
                const response = await fetch('/api/api-keys', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    id: selectedAPIKey.id,
                  }),
                });

                if (response.status === 200) {
                  toast({
                    title: 'Delete API Key Success',
                    description: 'API Key deleted',
                  });
                  setSelectedAPIKey(undefined);
                  nextRouter.refresh();
                  setOpen(false);
                } else {
                  const responseBody = await response.json();
                  if (responseBody.error) {
                    throw new Error(responseBody.error);
                  } else {
                    throw new Error('Unknown error');
                  }
                }
              } catch (error) {
                if (error instanceof Error) {
                  toast({
                    title: 'Delete API Key Error',
                    description: error.message,
                  });
                } else {
                  toast({
                    title: 'Delete API Key Error',
                    description: 'An unknown error occurred',
                  });
                }
              }

              setIsDeleteAPIKeyLoading(false);
            }}
            className="min-w-[80px]"
          >
            {isDeleteAPIKeyLoading ? <Loading /> : 'Delete'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
