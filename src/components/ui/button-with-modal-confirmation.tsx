'use client';

import { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import Loading from '../icons/loading';

type ButtonWithModalConfirmationProps = {
  children: React.ReactElement;
  modalTitle: string;
  modalContent?: React.ReactElement;
  onConfirm: () => Promise<void>;
  className?: string;
};
export default function ButtonWithModalConfirmation({
  children,
  modalTitle,
  modalContent,
  onConfirm,
  className,
}: ButtonWithModalConfirmationProps) {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [isConfirmationActionLoading, setIsConfirmationActionLoading] =
    useState(false);

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      <Dialog
        open={isConfirmationDialogOpen}
        onOpenChange={(newVal) => {
          setIsConfirmationDialogOpen(newVal);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {modalContent}

            <div className="flex flex-row gap-3">
              <Button
                onClick={() => {
                  setIsConfirmationDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="min-w-[200px]"
                onClick={async () => {
                  setIsConfirmationActionLoading(true);
                  await onConfirm();
                  setIsConfirmationDialogOpen(false);
                  setIsConfirmationActionLoading(false);
                }}
              >
                {isConfirmationActionLoading ? <Loading /> : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        type="button"
        className={className}
        onClick={() => {
          setIsConfirmationDialogOpen(true);
        }}
      >
        {children}
      </Button>
    </>
  );
}
