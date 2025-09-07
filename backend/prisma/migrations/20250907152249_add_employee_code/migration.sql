/*
  Warnings:

  - A unique constraint covering the columns `[companyId,employee_code]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Employee" ADD COLUMN     "employee_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_companyId_employee_code_key" ON "public"."Employee"("companyId", "employee_code");
