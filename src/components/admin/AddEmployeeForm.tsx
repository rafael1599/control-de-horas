
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { type EmployeeCreationData } from '@/types';

// Esquema de validación con Zod actualizado
const formSchema = z.object({
  employee_code: z.string().optional(),
  fullName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  hourlyRate: z.coerce.number().min(0, { message: 'La tarifa debe ser un número positivo.' }).optional(),
});

type EmployeeFormData = z.infer<typeof formSchema>;

interface AddEmployeeFormProps {
  onAddEmployee: (employeeData: EmployeeCreationData) => Promise<void>;
  loading: boolean;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onAddEmployee, loading }) => {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_code: '',
      fullName: '',
      email: '',
      password: '',
      hourlyRate: 15,
    },
  });

  const onSubmit = async (values: EmployeeFormData) => {
    await onAddEmployee(values);
    form.reset();
  };

  return (
    <div className="bg-card p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Agregar Empleado</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
            <FormField
              control={form.control}
              name="employee_code"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>ID / Código (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 050" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="col-span-1 lg:col-span-1">
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-1 lg:col-span-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan.perez@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="col-span-1 lg:col-span-1">
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem className="col-span-1 lg:col-span-1">
                  <FormLabel>Tarifa/hora</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-1 lg:col-span-1 flex items-end h-full">
              <Button type="submit" disabled={loading} className="w-full mt-auto">
                {loading ? 'Agregando...' : <><Plus className="h-4 w-4 mr-2" /> Agregar</>}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddEmployeeForm;
