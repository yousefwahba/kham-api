import {
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../drizzle/drizzle.service';
import catalogRequestContactInfo from '../../drizzle/schema/catalog_request_contact_info';
import catalogRequests from '../../drizzle/schema/catalog_requests';
import { handleServiceError } from '../utilities/error-handling.util';
import { CreateCatalogRequestDto } from './dto/create-catalog-request.dto';
import { UpdateCatalogRequestDto } from './dto/update-catalog-request.dto';
import {
	CatalogRequestEntity,
	CatalogRequestStatusType,
} from './entities/catalog-request.entity';

@Injectable()
export class CatalogRequestsService {
	constructor(
		@Inject(DrizzleService) private readonly drizzleService: DrizzleService,
	) {}

	//create catalog request
	async create(
		createCatalogRequestDto: CreateCatalogRequestDto,
	): Promise<CatalogRequestEntity> {
		try {
			const createdCatalogRequest =
				await this.drizzleService.db.transaction(async (tx) => {
					// Create the contact info first
					const { requestContactInfo, ...catalogRequestData } =
						createCatalogRequestDto;
					if (!catalogRequestData.requestContactInfoId) {
						const contactInfo = await tx
							.insert(catalogRequestContactInfo)
							.values(requestContactInfo)
							.returning();
						if (!contactInfo || contactInfo.length === 0) {
							throw new InternalServerErrorException(
								'Failed to create catalog request contact info',
							);
						} else {
							catalogRequestData.requestContactInfoId =
								contactInfo[0].id;
						}
					}

					catalogRequestData.status = CatalogRequestStatusType.Parked;
					catalogRequestData.createdAt = new Date();

					const catalogRequest = await tx
						.insert(catalogRequests)
						.values(catalogRequestData)
						.returning();

					if (!catalogRequest || catalogRequest.length === 0) {
						throw new InternalServerErrorException(
							'Failed to create catalog request',
						);
					}
					return catalogRequest[0];
				});
			return createdCatalogRequest;
		} catch (error) {
			handleServiceError(error, 'Failed to update catalog request ');
		}
	}

	async findAll(
		page: number,
		limit: number,
	): Promise<CatalogRequestEntity[]> {
		const offset = (page - 1) * limit;

		try {
			return this.drizzleService.db
				.select()
				.from(catalogRequests)
				.limit(limit)
				.offset(offset);
		} catch (error) {
			handleServiceError(error, 'Failed to get all catalog requests ');
		}
	}

	async findOne(id: string): Promise<CatalogRequestEntity> {
		try {
			const catalogRequest =
				await this.drizzleService.db.query.catalogRequests.findFirst({
					where: eq(catalogRequests.id, id),
				});

			if (!catalogRequest) {
				throw new NotFoundException(
					`Catalog request with ID ${id} not found`,
				);
			}

			return catalogRequest;
		} catch (error) {
			handleServiceError(error, 'Failed to find catalog request ');
		}
	}

	async update(
		id: string,
		updateCatalogRequestDto: UpdateCatalogRequestDto,
	): Promise<CatalogRequestEntity> {
		const catalogRequestExists = (
			await this.drizzleService.db
				.select({ count: eq(catalogRequests.id, id) })
				.from(catalogRequests)
		)?.[0]?.count;

		if (
			typeof catalogRequestExists === 'number' &&
			catalogRequestExists <= 0
		) {
			throw new NotFoundException(
				`Catalog request with ID ${id} not found`,
			);
		}

		try {
			// Update the catalog request data
			const updatedCatalogRequest = await this.drizzleService.db
				.update(catalogRequests)
				.set(updateCatalogRequestDto)
				.where(eq(catalogRequests.id, id))
				.returning();

			if (!updatedCatalogRequest[0]) {
				throw new Error('Failed to update catalog request');
			}

			return updatedCatalogRequest[0];
		} catch (error) {
			handleServiceError(error, 'Failed to update catalog request ');
		}
	}

	async remove(id: string): Promise<CatalogRequestEntity> {
		const catalogEntryExists = await this.drizzleService.db
			.select()
			.from(catalogRequests)
			.limit(1)
			.where(eq(catalogRequests.id, id));

		if (!catalogEntryExists[0]) {
			throw new NotFoundException(
				`Catalog Entry with ID ${id} not found`,
			);
		}

		try {
			const removedCatalog = await this.drizzleService.db
				.update(catalogRequests)
				.set({ isRemoved: true })
				.where(eq(catalogRequests.id, id))
				.returning();
			return removedCatalog[0];
		} catch (error) {
			handleServiceError(error, 'Failed to remove catalog request ');
		}
	}
}
