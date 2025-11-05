import prisma from "./app/db.server.js";

async function checkSessions() {
  try {
    const sessions = await prisma.session.findMany();
    console.log("Sessions in database:", sessions.length);
    sessions.forEach(session => {
      console.log(`- ID: ${session.id}, Shop: ${session.shop}, Online: ${session.isOnline}`);
    });
  } catch (error) {
    console.error("Error checking sessions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessions();