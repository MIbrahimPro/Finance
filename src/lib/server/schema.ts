import { pgTable, text, timestamp, integer, boolean, real, jsonb, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

export const accounts = pgTable('account', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<'oauth' | 'oidc' | 'webauthn' | 'email'>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

export const authenticators = pgTable('authenticator', {
  credentialID: text('credentialID').notNull().unique(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerAccountId: text('providerAccountId').notNull(),
  credentialPublicKey: text('credentialPublicKey').notNull(),
  counter: integer('counter').notNull(),
  credentialDeviceType: text('credentialDeviceType').notNull(),
  credentialBackedUp: boolean('credentialBackedUp').notNull(),
  transports: text('transports'),
}, (authenticator) => ({
  compoundKey: primaryKey({ columns: [authenticator.userId, authenticator.credentialID] }),
}));

export const tags = pgTable('tag', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const transactions = pgTable('transaction', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  tagId: text('tagId').notNull().references(() => tags.id),
  title: text('title').notNull(),
  amount: real('amount').notNull(),
  description: text('description').default(''),
  timestamp: timestamp('timestamp', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const persons = pgTable('person', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  timestamp: timestamp('timestamp', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const personEntries = pgTable('personEntry', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  personId: text('personId').notNull().references(() => persons.id, { onDelete: 'cascade' }),
  direction: text('direction', { enum: ['lent', 'borrowed'] }).notNull(),
  amount: real('amount').notNull(),
  title: text('title').notNull(),
  timestamp: timestamp('timestamp', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const dashboardLayouts = pgTable('dashboardLayout', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  layout: jsonb('layout').$type<string[]>().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const statsEntries = pgTable('statsEntry', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  section: text('section', { enum: ['assets', 'liabilities', 'income', 'expenses'] }).notNull(),
  title: text('title').notNull(),
  amount: real('amount').notNull(),
  timestamp: timestamp('timestamp', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const statsLayouts = pgTable('statsLayout', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  layout: jsonb('layout').$type<string[]>().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});
