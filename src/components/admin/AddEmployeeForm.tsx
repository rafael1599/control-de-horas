
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { type EmployeeCreationData, type Employee } from '@/types';
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

// Esquema de validación con Zod actualizado
const formSchema = z.object({
  employee_code: z.string().optional(),
  fullName: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, introduce un email válido.' }).optional().or(z.literal('')),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }).optional().or(z.literal('')),
  hourlyRate: z.coerce.number().min(0, { message: 'La tarifa debe ser un número positivo.' }).optional(),
});

type EmployeeFormData = z.infer<typeof formSchema>;

interface AddEmployeeFormProps {
  onAddEmployee: (employeeData: EmployeeCreationData) => Promise<void>;
  onUpdateEmployee: (employeeId: string, data: Partial<Employee>) => Promise<void>;
  loading: boolean;
  employeeToEdit: Employee | null;
  onCancelEdit: () => void;
  employees: Employee[];
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onAddEmployee, onUpdateEmployee, loading, employeeToEdit, onCancelEdit, employees }) => {
  const [showWarningDialog, setShowWarningDialog] = React.useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = React.useState<EmployeeFormData | null>(null);

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

  React.useEffect(() => {
    console.log('AddEmployeeForm useEffect - employeeToEdit:', employeeToEdit);
    if (employeeToEdit) {
      form.setValue('employee_code', employeeToEdit.employee_code || '');
      form.setValue('fullName', employeeToEdit.full_name || '');
      form.setValue('hourlyRate', employeeToEdit.hourly_rate || 0);
      form.setValue('email', employeeToEdit.email || '');
      form.setValue('password', ''); // Password should never be pre-populated for security
    } else {
      form.reset({
        employee_code: '',
        fullName: '',
        email: '',
        password: '',
        hourlyRate: 15,
      });
    }
  }, [employeeToEdit, form]);

  const onSubmit = async (values: EmployeeFormData) => {
    if (employeeToEdit) {
      // Update employee
      const updateData: Partial<Employee> = {
        code: values.employee_code || undefined,
        name: values.fullName,
        email: values.email || undefined,
        password: values.password || undefined,
        hourlyRate: values.hourlyRate || undefined,
      };
      await onUpdateEmployee(employeeToEdit.id, updateData);
      onCancelEdit();
      form.reset();
    } else {
      // Add new employee
      const missingFields: string[] = [];
      if (!values.employee_code) missingFields.push('Código');
      if (!values.email) missingFields.push('Email');
      if (!values.password) missingFields.push('Contraseña');
      if (!values.hourlyRate) missingFields.push('Tarifa/hora');

      if (missingFields.length > 0) {
        setPendingSubmitValues(values);
        setShowWarningDialog(true);
      } else {
        await onAddEmployee(values);
        onCancelEdit();
        form.reset();
      }
    }
  };

  const handleContinueSubmit = async () => {
    if (pendingSubmitValues) {
      await onAddEmployee(pendingSubmitValues);
      onCancelEdit();
      form.reset();
      setPendingSubmitValues(null);
    }
    setShowWarningDialog(false);
  };

  return (
    <div className="bg-card p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">{employeeToEdit ? 'Editar Empleado' : 'Agregar Empleado'}</h3>

      
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
                  <FormLabel>Email (Opcional)</FormLabel>
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
                  <FormLabel>Contraseña (Opcional)</FormLabel>
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
                  <FormLabel>Tarifa/hora (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-1 lg:col-span-1 flex items-end h-full">
              <Button type="submit" disabled={loading} className="w-full mt-auto">
                {loading ? (employeeToEdit ? 'Guardando...' : 'Agregando...') : (employeeToEdit ? 'Guardar Cambios' : <><Plus className="h-4 w-4 mr-2" /> Agregar</>)}
              </Button>
              {employeeToEdit && (
                <Button type="button" variant="outline" onClick={onCancelEdit} className="w-full mt-auto ml-2">
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>

      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campos Opcionales Vacíos</AlertDialogTitle>
            <AlertDialogDescription>
              Has dejado algunos campos opcionales vacíos (Código, Email, Contraseña, Tarifa/hora). ¿Deseas continuar sin rellenarlos o prefieres volver para editarlos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWarningDialog(false)}>Volver a Editar</AlertDialogCancel>
            <AlertDialogAction onClick={handleContinueSubmit}>Continuar de Todos Modos</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddEmployeeForm;
