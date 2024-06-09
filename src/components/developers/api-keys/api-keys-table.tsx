'use client';

import { APIKey } from '@/app/api/api-keys/types';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CopyIcon, TrashIcon } from '@radix-ui/react-icons';
import DeleteAPIKeyModal from './delete-api-key-modal';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

type APIKeysTableProps = {
  apiKeys: APIKey[];
};

export default function APIKeysTable({ apiKeys }: APIKeysTableProps) {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const { toast } = useToast();
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const [selectedAPIKey, setSelectedAPIKey] = useState<APIKey | undefined>(
    undefined
  );
  const [isDeleteAPIKeyModalOpen, setIsDeleteAPIKeyModalOpen] = useState(false);
  /* -------------------------------------------------------------------------- */
  /*                              Table Definition                              */
  /* -------------------------------------------------------------------------- */
  const APIKeysTableColumns: ColumnDef<APIKey>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
      enableResizing: true,
    },
    {
      accessorKey: 'key',
      header: 'API Key',
      cell: ({ row }) => {
        return (
          <div className="max-w-[150px] md:max-w-[300px] flex flex-row justify-between items-center">
            <p className="max-w-[120px] md:max-w-[270px] truncate">
              {row.getValue('key')}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(row.getValue('key'));
                toast({
                  title: 'API Key copied to clipboard',
                });
              }}
            >
              <CopyIcon />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => <div>{row.getValue('createdAt')}</div>,
    },
    {
      accessorKey: 'expiration',
      header: 'Expiration',
      cell: ({ row }) => <div>{row.getValue('expiration')}</div>,
    },
    {
      accessorKey: 'Actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <div className="flex flex-row">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedAPIKey(row.original);
                setIsDeleteAPIKeyModalOpen(true);
              }}
            >
              <TrashIcon />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: apiKeys,
    columns: APIKeysTableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      {selectedAPIKey && isDeleteAPIKeyModalOpen && (
        <DeleteAPIKeyModal
          open={isDeleteAPIKeyModalOpen}
          setOpen={setIsDeleteAPIKeyModalOpen}
          selectedAPIKey={selectedAPIKey}
          setSelectedAPIKey={setSelectedAPIKey}
        />
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={table.getHeaderGroups()[0].headers.length}>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
