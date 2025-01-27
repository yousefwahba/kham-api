import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { InferModel } from 'drizzle-orm';
import userContactInfo from '../../../drizzle/schema/user_contact_info';
import { OptionalApiProperty } from '../../../openapi/decorators';
import { GeoLocation } from '../../utilities/geolocation';

export type UserContactInfoModel = InferModel<typeof userContactInfo>;

@ApiExtraModels(GeoLocation)
export class UserContactInfoEntity implements UserContactInfoModel {
	@OptionalApiProperty()
	address: string;
	@OptionalApiProperty({ type: () => GeoLocation })
	location: GeoLocation;
	@OptionalApiProperty()
	governorate: string;
	@OptionalApiProperty()
	phoneNumber: string;
	@ApiProperty()
	id: string;
	@OptionalApiProperty()
	city: string;
	@OptionalApiProperty()
	email: string;
	@OptionalApiProperty()
	default: boolean;
}
