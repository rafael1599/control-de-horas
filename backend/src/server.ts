import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import employeeRoutes from './routes/employee.routes';
import timeEntryRoutes from './routes/timeEntry.routes'; // <-- NUEVA IMPORTACIÓN
import setupRoutes from './routes/setup.routes.ts';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middlewares
const allowedOrigins = [
  'http://localhost:5173', // URL de desarrollo local de Vite
  'http://localhost:8080',
  'https://control-de-horas-frontend-three.vercel.app' // URL de producción de Vercel
];

const corsOptions = {
  origin: allowedOrigins
};

app.use(cors(corsOptions));
app.use(express.json());

// Rutas de la API
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/time-entries', timeEntryRoutes); // <-- NUEVO USO DEL ENRUTADOR
app.use('/api/v1/setup', setupRoutes);

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