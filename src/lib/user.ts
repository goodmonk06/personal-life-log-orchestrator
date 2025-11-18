import { db } from './db';

/**
 * Get or create the default demo user
 * This ensures there's always a user available for the demo
 */
export async function getOrCreateDefaultUser() {
  const defaultEmail = 'demo@lifelog.app';

  let user = await db.lifeUser.findUnique({
    where: { email: defaultEmail },
  });

  if (!user) {
    user = await db.lifeUser.create({
      data: {
        email: defaultEmail,
        name: 'Demo User',
        externalId: 'demo-user-001',
      },
    });
  }

  return user;
}

/**
 * Get the default user ID for demo purposes
 * In production, this would come from authentication
 */
export async function getDefaultUserId(): Promise<string> {
  const user = await getOrCreateDefaultUser();
  return user.id;
}
