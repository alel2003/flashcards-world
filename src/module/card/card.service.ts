import { Injectable } from '@nestjs/common';

import { WordCard } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';

import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { PaginationDto } from './dto/pagination/pagination.dto';

import { DEFAULT_PAGE_SIZE } from 'src/common/constants';

import { notFoundException } from 'src/common/utils/error.util';

@Injectable()
export class CardService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async create(userId: string, dto: CreateCardDto): Promise<WordCard> {
    const data = {
      userId,
      word: dto.word,
      translation: dto.translation,
      isDelete: dto.isDelete,
      examples: {
        create: dto.examples?.map((example) => ({
          text: example.text,
        })),
      },
    };
    const wordCard = await this.prisma.wordCard.create({
      data,
      include: { examples: true },
    });
    return wordCard;
  }

  findAll(dto: PaginationDto, userId: string): Promise<WordCard[]> {
    return this.prisma.wordCard.findMany({
      where: { userId },
      skip: dto.skip,
      take: dto.limit ?? DEFAULT_PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: number): Promise<WordCard | null> {
    const uniqueCard = await this.findByIdCardAndUser(id, userId);

    notFoundException(!uniqueCard, `Card with id:${id} not found`);

    return uniqueCard;
  }

  async update(
    userId: string,
    id: number,
    dto: UpdateCardDto,
  ): Promise<WordCard> {
    const data = {
      word: dto.word,
      translation: dto.translation,
      isDelete: dto.isDelete,
      examples: {
        deleteMany: { wordCardId: id },
        create: dto.examples?.map((example) => ({
          text: example.text,
        })),
      },
    };

    const updateCard = await this.prisma.wordCard.update({
      where: {
        id,
        userId,
      },
      data,
      include: { examples: true },
    });

    notFoundException(!updateCard, `Card with id:${id} not found`);

    return updateCard;
  }

  async remove(userId: string, id: number): Promise<WordCard> {
    const deleteCard = await this.prisma.wordCard.update({
      where: {
        id,
        userId,
      },
      data: {
        isDelete: true,
      },
    });

    notFoundException(!deleteCard, `Card with id:${id} not found`);

    return deleteCard;
  }

  // private methods
  private findByIdCardAndUser(
    id: number,
    userId: string,
  ): Promise<WordCard | null> {
    return this.prisma.wordCard.findUnique({
      where: {
        id,
        userId,
      },
    });
  };
};