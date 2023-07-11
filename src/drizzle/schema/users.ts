import {
	pgTable,
	serial,
	text,
	varchar,
	jsonb,
	doublePrecision,
	timestamp,
	integer,
	pgEnum,
} from 'drizzle-orm/pg-core';
import users_contact_info from './user_contact_info';
import providers from './providers';
import seekers from './seekers';
import { relations } from 'drizzle-orm';
import catalog_requests from './catalog_requests';
import adminAccess from './admin_access';

export const userTypeEnum = pgEnum('user_type', ['individual', 'business']);
export const businessEntityTypeEnum = pgEnum('business_entity_type', [
	'factory',
	'supplier',
	'restaurant',
]);

const users = pgTable('users', {
	id: serial('id').primaryKey(),
	// seekerId: serial('seeker_id').references(() => seekers.id),
	// providerId: serial('provider_id').references(() => providers.id),
	firstName: text('first_name'),
	lastName: text('last_name'),
	profileImage: varchar('profile_image', { length: 256 }),
	authId: serial('auth_id').notNull(),
	contactInfoId: serial('contact_info_id').references(
		() => users_contact_info.id,
	),
	fcmTokens: varchar('fcm_tokens', { length: 256 }).array(),
	userType: userTypeEnum('user_type'),
	businessType: businessEntityTypeEnum('business_type'),
	adminAccessId: serial('admin_access_id').references(() => adminAccess.id),
});
export default users;
export const usersRelations = relations(users, ({ one, many }) => ({
	// seeker: one(seekers, {
	// 	fields: [users.seekerId],
	// 	references: [seekers.id],
	// }),
	// provider: one(providers, {
	// 	fields: [users.providerId],
	// 	references: [providers.id],
	// }),
	adminAccess: one(adminAccess, {
		fields: [users.adminAccessId],
		references: [adminAccess.id],
	}),
	contactInfo: many(users_contact_info),
	catalogRequests: many(catalog_requests),
}));
