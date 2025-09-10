import { Request, Response } from 'express';
import prisma from '../prisma-client';

export const initializeCompany = async (req: Request, res: Response) => {
  const companyId = process.env.COMPANY_ID;
  const companyName = "Compañía Principal"; // Puedes cambiar este nombre

  if (!companyId) {
    return res.status(500).json({ error: 'COMPANY_ID no está configurado en las variables de entorno.' });
  }

  try {
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (existingCompany) {
      return res.status(200).json({ message: 'La compañía ya existe.', company: existingCompany });
    }

    const newCompany = await prisma.company.create({
      data: {
        id: companyId,
        company_name: companyName,
      },
    });
    res.status(201).json({ message: 'Compañía inicializada exitosamente.', company: newCompany });
  } catch (error) {
    console.error("Error inicializando la compañía:", error);
    res.status(500).json({ error: 'No se pudo inicializar la compañía.' });
  }
};