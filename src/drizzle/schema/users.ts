import { relations, sql } from 'drizzle-orm';
import {
	bigint,
	boolean,
	pgEnum,
	pgTable,
	text,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import adminAccess from './admin_access';
import catalog_requests from './catalog_requests';
import users_contact_info from './user_contact_info';

export const userTypeEnum = pgEnum('user_type', ['individual', 'business']);
export const businessEntityTypeEnum = pgEnum('business_entity_type', [
	'factory',
	'supplier',
	'restaurant',
]);

const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	// seekerId: uuid('seeker_id', ).references(() => seekers.id),
	// providerId: uuid('provider_id', ).references(() => providers.id),
	firstName: text('first_name'),
	lastName: text('last_name'),
	profileImage: varchar('profile_image', { length: 256 }),
	authId: varchar('auth_id', { length: 256 }).notNull(),
	contactInfoId: uuid('contact_info_id').references(
		() => users_contact_info.id,
	),
	fcmTokens: varchar('fcm_tokens', { length: 256 }).array(),
	userType: userTypeEnum('user_type'),
	businessType: businessEntityTypeEnum('business_type'),
	adminAccessId: uuid('admin_access_id').references(() => adminAccess.id),
	isActive: boolean('is_active').notNull().default(true),
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
