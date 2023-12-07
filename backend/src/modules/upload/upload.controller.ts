import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Req,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request, Response } from 'express';
import * as path from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/assets/profile_pictures',
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname).toLowerCase();
          const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
          const dotCount = file.originalname.split('.').length - 1;
          const dangerousChars = ['/', '\\'];

          if (!allowedExtensions.includes(fileExtension)) {
            return cb(new Error('File extension not authorized'), '');
          }

          if (dotCount !== 1) {
            return cb(new Error('File name not authorized'), '');
          }

          if (dangerousChars.some((char) => file.originalname.includes(char))) {
            return cb(
              new Error('File name contains inappropriate characters'),
              '',
            );
          }

          const filename = `${Date.now()}-${file.originalname.replace(
            / /g,
            '',
          )}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = await this.uploadService.decodeJWT(
        req.headers.authorization,
      );

      if (!data) return res.status(HttpStatus.UNAUTHORIZED).send();

      const { sub } = JSON.parse(data[1]);

      const filePath = 'https://localhost:443/api/upload/' + file.filename;
      await this.uploadService.saveFilePath(sub, filePath);
      return res.status(HttpStatus.OK).send();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error during file upload.');
    }
  }
  @Get(':img')
  getImg(@Param('img') image: string, @Res() res: Response) {
    const filename = image.replaceAll('\\.', '').replaceAll('/', '');

    const image_filename = path.resolve(
      `./src/assets/profile_pictures/${filename}`,
    );

    if (!image_filename) return res.status(404).send({});

    try {
      res.sendFile(image_filename);
    } catch (err) {
      return res.status(404).send({});
    }
  }
}
