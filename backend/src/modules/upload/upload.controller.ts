import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
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
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
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

      const filePath = 'http://localhost:3000/upload/' + file.filename;
      await this.uploadService.saveFilePath(sub, filePath);
      return res.status(HttpStatus.OK).send();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error during file upload.');
    }
  }
  @Get(':img')
  getImg(@Param('img') image: string, @Res() res: Response): void {
    //const imgPath = "../../assets/profile_pictures/" + image;
    res.sendFile(path.resolve('src/assets/profile_pictures/' + image));
  }
}
