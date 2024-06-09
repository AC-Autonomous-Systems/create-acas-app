'use client';
import { zCreateAPIKeyInput } from '@/app/api/api-keys/types';
import { TenantContext } from '@/app/tenant-provider';
import Loading from '@/components/icons/loading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/ui/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { addDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function CreateKey() {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const nextRouter = useRouter();
  const { toast } = useToast();

  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { selectedTenant } = useContext(TenantContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateAPIKeyLoading, setIsCreateAPIKeyLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                                    Forms                                   */
  /* -------------------------------------------------------------------------- */
  const form = useForm<z.infer<typeof zCreateAPIKeyInput>>({
    defaultValues: {
      name: '',
      tenantId: selectedTenant ? selectedTenant.id : '',
      expiration: addDays(new Date(), 30),
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Effects                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (selectedTenant) {
      form.setValue('tenantId', selectedTenant.id);
    }
  }, [form, selectedTenant]);

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="flex flex-row justify-end">
      <Button
        className="min-w-[100px]"
        onClick={() => {
          setIsDialogOpen(true);
        }}
      >
        Create Key
      </Button>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(newVal) => {
          if (!newVal) {
            form.reset();
          }
          setIsDialogOpen(newVal);
        }}
      >
        <DialogContent className="w-[90%]">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create an API key
              {selectedTenant ? ' for ' + selectedTenant.name + '' : ''}
            </DialogDescription>
          </DialogHeader>

          {/* Form to create the API key */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                async (value: z.infer<typeof zCreateAPIKeyInput>) => {
                  if (!selectedTenant) {
                    toast({
                      title: 'Create API Key Error',
                      description:
                        'You must select a tenant to create an API key',
                    });
                    return;
                  }
                  // Create the API key
                  setIsCreateAPIKeyLoading(true);
                  try {
                    const response = await fetch('/api/api-keys', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(value),
                    });

                    if (response.status === 201) {
                      const responseBody = await response.json();
                      toast({
                        title: 'Create API Key Success',
                        description:
                          responseBody.createdAPIKey.name + ' created',
                      });

                      form.reset();
                      nextRouter.refresh();
                      setIsDialogOpen(false);
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
                        title: 'Create API Key Error',
                        description: error.message,
                      });
                    } else {
                      toast({
                        title: 'Create API Key Error',
                        description: 'An unknown error occurred',
                      });
                    }
                  }

                  setIsCreateAPIKeyLoading(false);
                }
              )}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the API key name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>The name of the API Key.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiration"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-[240px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < addDays(new Date(), 30)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The expiration date of the API Key.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="min-w-[200px]"
              >
                {isCreateAPIKeyLoading ? <Loading /> : 'Create Key'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
