import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import {
	ApiBody,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { CreateCatalogRequestItemDto } from './dto/create-catalog-request-item.dto';
import { CreateCatalogRequestDto } from './dto/create-catalog-request.dto';
import { SubmitCatalogRequestDto } from './dto/submit-catalog-request.dto';
import { UpdateCatalogRequestItemDto } from './dto/update-catalog-request-item.dto';
import { UpdateCatalogRequestDto } from './dto/update-catalog-request.dto';
import {
	CatalogRequestItemEntity,
	CatalogRequestItemsModel,
} from './entities/catalog-request-item.entity';
import {
	CatalogRequestEntity,
	CatalogRequestModel,
} from './entities/catalog-request.entity';
import { UserCatalogRequestsService } from './user-catalog-requests.service';

@ApiTags('users-catalog-requests')
@Controller(':uid/catalog-requests')
export class UserCatalogRequestsController {
	constructor(
		private readonly catalogRequestsService: UserCatalogRequestsService,
	) {}

	/**
	 * Authorize User
	 * Create A catalog request ({status: 'parked'}) to allow the user to add items
	 */
	@Post()
	create(
		@Body() createCatalogRequestDto: CreateCatalogRequestDto,
	): Promise<CatalogRequestModel> {
		return this.catalogRequestsService.create(createCatalogRequestDto);
	}

	/**
	 * Authorize User
	 * Submit a catalog request for the user and notify Kham Sales Team
	 */
	@Patch()
	submit(
		@Body() submitCatalogRequestDto: SubmitCatalogRequestDto,
	): Promise<CatalogRequestModel> {
		return this.catalogRequestsService.submit(submitCatalogRequestDto);
	}

	/**
	 * Authorize User
	 * get All the catalog requests for the current user
	 * add select array to select columns from table
	 * implement pagination
	 */
	@ApiOperation({ summary: 'Get all catalog requests' })
	@ApiOkResponse({ type: CatalogRequestEntity, isArray: true })
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@Get()
	async findAll(
		@Query('page') page = 1,
		@Query('limit') limit = 10,
	): Promise<CatalogRequestModel[]> {
		return this.catalogRequestsService.findAll(page, limit);
	}

	/**
	 * Authorize User
	 * get the latest request that has not been pushed (ie; current cart)
	 */

	/**
	 * Authorize User
	 * get a specific request
	 * with Items and Contact Info
	 */
	@ApiOperation({ summary: 'Get a catalog request by ID' })
	@ApiOkResponse({ type: CatalogRequestEntity })
	@ApiParam({ name: 'id', type: String })
	@Get(':id')
	async findOne(@Param('id') id: string): Promise<CatalogRequestEntity> {
		return this.catalogRequestsService.findOne(id);
	}

	/**
	 * Authorize User
	 * update specific properties
	 * Not all properties will be allowed to change TBD
	 */
	@ApiOperation({ summary: 'Update a catalog request by ID' })
	@ApiBody({ type: UpdateCatalogRequestDto })
	@ApiOkResponse({ type: CatalogRequestEntity })
	@ApiParam({ name: 'id', type: String })
	@Patch(':id')
	async update(
		@Param('id') id: string,
		@Body() updateCatalogRequestDto: UpdateCatalogRequestDto,
	): Promise<CatalogRequestModel> {
		return this.catalogRequestsService.update(id, updateCatalogRequestDto);
	}

	/**
	 * Authorize User
	 * validate if there's an available request to add the items to (if not then create one)
	 * Add Items to the Request
	 */
	@ApiOperation({ summary: 'Add items to a catalog request' })
	@ApiParam({ name: 'id', description: 'Catalog request ID' })
	@Post(':id/items')
	async addItemsToRequest(
		@Param('id') requestId: string,
		@Body() createCatalogRequestItemDto: CreateCatalogRequestItemDto,
	): Promise<CatalogRequestItemsModel> {
		return this.catalogRequestsService.addItemsToRequest(
			requestId,
			createCatalogRequestItemDto,
		);
	}

	/**
	 * Authorize User
	 * remove items from request
	 */
	@ApiOperation({ summary: 'Remove items from a catalog request' })
	@ApiParam({ name: 'id', description: 'Catalog request ID' })
	@ApiResponse({
		status: 200,
		description: 'Items removed successfully',
		type: CatalogRequestItemEntity,
	})
	@ApiResponse({ status: 404, description: 'Catalog request not found' })
	@Delete(':id/items')
	async removeItemsFromRequest(
		@Param('id') requestId: string,
	): Promise<CatalogRequestItemsModel> {
		return this.catalogRequestsService.removeItemsFromRequest(requestId);
	}

	/**
	 * Edit Items Quantity
	 */
	@ApiOperation({
		summary: 'Update quantity of a specific item in a catalog request',
	})
	@ApiParam({ name: 'id', description: 'Catalog request ID' })
	@ApiParam({ name: 'itemId', description: 'ID of the item to update' })
	@ApiResponse({
		status: 200,
		description: 'Item quantity updated successfully',
		type: CatalogRequestItemEntity,
	})
	@ApiResponse({
		status: 404,
		description: 'Catalog request or item not found',
	})
	@Patch(':id/items/:itemId')
	async updateItemQuantity(
		@Param('id') requestId: string,
		@Param('itemId') itemId: string,
		@Body() updateItemDto: UpdateCatalogRequestItemDto,
	): Promise<CatalogRequestItemsModel> {
		return this.catalogRequestsService.updateItemQuantity(
			requestId,
			itemId,
			updateItemDto,
		);
	}

	/**
	 * Authorize User
	 * cancel request
	 * remove completely
	 * only if request is pending
	 */
	@Delete(':id')
	async cancelCatalogRequest(@Param('id') requestId: string) {
		return this.catalogRequestsService.cancelCatalogRequest(requestId);
	}
}
