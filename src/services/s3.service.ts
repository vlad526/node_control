import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { UploadedFile } from 'express-fileupload';
import path from 'path';
import { FileItemTypeEnum } from '../enums/file-item-type.enum';
import { configs } from '../configs/config';
import {ApiError} from '../errors/api-error';

class S3Service {
    private readonly client: S3Client;
    private readonly bucketName = configs.AWS_S3_BUCKET_NAME;

    constructor() {

        this.client = new S3Client({
            region: configs.AWS_S3_REGION,
            credentials: {
                accessKeyId: configs.AWS_ACCESS_KEY,
                secretAccessKey: configs.AWS_SECRET_KEY,
            },
        });
    }

    public async deleteFile(fileKey: string): Promise<void> {
        try {
            await this.client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            }));

            console.log(`[S3 Service] Successfully deleted: ${fileKey}`);
        } catch (error) {
            console.error(`[S3 Service Error] Failed to delete ${fileKey}:`, error);
            throw new ApiError('Failed to process file deletion from cloud storage.', 500);
        }
    }

    public async uploadFile(
        file: UploadedFile,
        itemType: FileItemTypeEnum,
        itemId: string,
    ): Promise<string> {
        try {
            const filePath = this.generateFilePath(itemType, itemId, file.name);

            await this.client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: filePath,
                Body: file.data,
                ContentType: file.mimetype,
                ACL: configs.AWS_S3_ACL,
            }));

            console.log(`[S3 Service] Successfully uploaded: ${filePath}`);
            return filePath;
        } catch (e) {
            console.error('[S3 Service Error] Failed to upload file:', e);
            throw new ApiError('Failed to upload file to cloud storage. Please try again later.', 500);
        }
    }

    private generateFilePath(
        itemType: FileItemTypeEnum,
        itemId: string,
        originalName: string
    ): string {
        const extension = path.extname(originalName);
        const uniqueFileName = `${randomUUID()}${extension}`;

        return `${itemType}/${itemId}/${uniqueFileName}`;
    }
}

export const s3Service = new S3Service();