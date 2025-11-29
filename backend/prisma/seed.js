import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  
  // Hash all four demo passwords (ensure they match the frontend's expected passwords)
  const internPass = await bcrypt.hash("Intern@123", saltRounds);
  const employeePass = await bcrypt.hash("Employee@123", saltRounds);
  const managerPass = await bcrypt.hash("Manager@123", saltRounds);
  const adminPass = await bcrypt.hash("Admin@123", saltRounds);

  await prisma.employee.createMany({
    data: [
      // 1. ADMIN
      { name: "Admin User", email: "admin@fosys.com", password: adminPass, role: "ADMIN" },
      // 2. MANAGER
      { name: "Manager User", email: "manager@fosys.com", password: managerPass, role: "MANAGER" },
      // 3. EMPLOYEE
      { name: "Employee User", email: "employee@fosys.com", password: employeePass, role: "EMPLOYEE" },
      // 4. INTERN
      { name: "Intern User", email: "intern@fosys.com", password: internPass, role: "INTERN" },
    ],
    skipDuplicates: true, // Prevents errors if these emails already exist
  });
  console.log("✅ Seeded 4 demo employees with correct roles and hashed passwords!");

}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());