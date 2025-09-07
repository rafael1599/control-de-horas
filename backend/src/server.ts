import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import employeeRoutes from './routes/employee.routes';
import timeEntryRoutes from './routes/timeEntry.routes'; // <-- NUEVA IMPORTACIÓN

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/time-entries', timeEntryRoutes); // <-- NUEVO USO DEL ENRUTADOR

// --- INICIO Y CIERRE DEL SERVIDOR ---

async function main() {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });