import { relations } from 'drizzle-orm';
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';
import catalogRequestContactInfo from './catalog_request_contact_info';
import catalogRequestItems from './catalog_request_items';
import users from './users';

export const catalogRequestStatusEnum = pgEnum('catalog_requests_status', [
	'fulfilled',
	'accepted',
	'rejected',
	'canceled',
	'voided',
	'pending_response',
	'parked',
]);
const catalogRequests = pgTable('catalog_requests', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.references(() => users.id)
		.notNull(),
	requestContactInfoId: uuid('request_contact_info_id').references(
		() => catalogRequestContactInfo.id,
	),
	itemCount: integer('item_count'),
	createdAt: timestamp('created_at'),
	submittedAt: timestamp('submitted_at'),
	respondedAt: timestamp('responded_at'),
	status: catalogRequestStatusEnum('status'),
	notes: text('notes'),
	otherItems: jsonb('other_items'),
	isRemoved: boolean('is_removed').default(false),
});

export default catalogRequests;

export const catalogRequestsRelations = relations(
	catalogRequests,
	({ one, many }) => ({
		requestContactInfo: one(catalogRequestContactInfo, {
			fields: [catalogRequests.requestContactInfoId],
			references: [catalogRequestContactInfo.id],
		}),
		catalogRequestItems: many(catalogRequestItems),
		user: one(users, {
			fields: [catalogRequests.userId],
			references: [users.id],
		}),
	}),
);
