'use client';
import Image from 'next/image';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useContext, useState } from 'react';
import { TenantContext } from '../tenant-provider';
import { useForm } from 'react-hook-form';
import { zCreateTenantInput } from '../api/tenant/types';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loading from '@/components/icons/loading';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function CreateTenant() {
  /* -------------------------------------------------------------------------- */
  /*                                    Hooks                                   */
  /* -------------------------------------------------------------------------- */
  const { toast } = useToast();
  const nextRouter = useRouter();
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */

  const [isCreateTenantLoading, setIsCreateTenantLoading] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                                    Forms                                   */
  /* -------------------------------------------------------------------------- */
  const form = useForm<z.infer<typeof zCreateTenantInput>>({
    defaultValues: {
      name: '',
      CDUKey: '',
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                                 JSX Return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      {/* Left side picture: */}
      <div className="w-full hidden md:flex md:w-2/3 flex-col justify-center items-center p-3">
        <div className="h-[90vh] w-full relative ">
          <Image
            src="/office-workers.png"
            alt="office workers"
            fill
            objectFit="cover"
            className="rounded-xl"
          />
        </div>
      </div>

      {/* Create tenant form */}
      <div className="w-full md:w-1/3 flex flex-col gap-6 p-6 mt-3 md:mt-10">
        <h1 className="text-3xl font-bold">Create a new tenant</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              async (values: z.infer<typeof zCreateTenantInput>) => {
                setIsCreateTenantLoading(true);

                try {
                  const response = await fetch('/api/tenant', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                  });

                  if (response.status === 201) {
                    const responseBody = await response.json();
                    toast({
                      title: 'Create Tenant Success',
                      description: responseBody.createdTenant.name + ' created',
                    });

                    form.reset();
                    nextRouter.refresh();
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
                      title: 'Create Tenant Error',
                      description: error.message,
                    });
                  } else {
                    toast({
                      title: 'Create Tenant Error',
                      description: 'An unknown error occurred',
                    });
                  }
                }

                setIsCreateTenantLoading(false);
              }
            )}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the tenant name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name of the tenant. Each machine must be
                    assigned to a tenant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="CDUKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genmega CDU Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the CDU Key"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the CDU key provided by Genmega. This key is used to
                    authenticate the machines. CDU keys are organization-wide,
                    so you only need to specify it here to use across all your
                    machines.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="min-w-[200px]"
            >
              {isCreateTenantLoading ? <Loading /> : 'Create Tenant'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
