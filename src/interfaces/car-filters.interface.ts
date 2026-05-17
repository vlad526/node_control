export interface CarFilters {
    brand?: string;
    price?: {
        $gte?: number;
        $lte?: number;
    };
    isPublished?: boolean;
}
