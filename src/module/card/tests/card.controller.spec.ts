import { Test, TestingModule } from '@nestjs/testing';

import { JwtGuard } from '@guards/jwt.guard';

import { CardController } from "@card/card.controller";
import { CardService } from "@card/card.service";

import { BASE_WORD_CARD, PAGINATION_SETTING, UPDATE_WORD_CARD } from "src/common/tests/constants/card";

import { mockJwtGuard, mockRequest } from 'src/common/tests/utils';


describe('CardController', () => {
    let cardController: CardController;
    let cardService: CardService;
  
    const mockCardService = {
      create: jest.fn().mockResolvedValue(BASE_WORD_CARD),
      findAll: jest.fn().mockResolvedValue([BASE_WORD_CARD]),
      findOne: jest.fn().mockResolvedValue(BASE_WORD_CARD),
      update: jest.fn().mockResolvedValue(UPDATE_WORD_CARD),
      remove: jest.fn().mockResolvedValue(BASE_WORD_CARD),
    };
  
    beforeEach(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [CardController],
        providers: [{ provide: CardService, useValue: mockCardService }],
      })
        .overrideGuard(JwtGuard)
        .useValue(mockJwtGuard)
        .compile();
  
      cardController = moduleRef.get<CardController>(CardController);
      cardService = moduleRef.get<CardService>(CardService);
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return an array of cards', async () => {
          const result = await cardController.findAll(
            PAGINATION_SETTING,
            mockRequest.user.sub,
          );
    
          expect(result).toEqual([BASE_WORD_CARD]);
          expect(
            cardService.findAll,
          ).toHaveBeenCalledTimes(1);
        });
    });

    describe('findOne', () => {
        it('should return a single card', async () => {
          const result = await cardController.findOne(mockRequest.user.sub, 1);
    
          expect(result).toEqual(BASE_WORD_CARD);
          expect(cardService.findOne).toHaveBeenCalledWith(mockRequest.user.sub, 1);
        });
    });

    describe('create', () => {
        it('should create a new card', async () => {
          const result = await cardController.create(mockRequest.user.sub, BASE_WORD_CARD);
        
          expect(result).toEqual(BASE_WORD_CARD);
          expect(
            cardService.create,
          ).toHaveBeenCalledWith(mockRequest.user.sub, BASE_WORD_CARD);
        });
    });

    describe('update', () => {
        it('should update a card', async () => {
          const result = await cardController.update(
            mockRequest.user.sub,
            1,
            UPDATE_WORD_CARD,
          );
        
          expect(result).toEqual(UPDATE_WORD_CARD);
          expect(
            cardService.update,
          ).toHaveBeenCalledWith(mockRequest.user.sub, 1, UPDATE_WORD_CARD);
        });
    });

    describe('remove', () => {
        it('should delete a card', async () => {
          const result = await cardController.remove(mockRequest.user.sub, 1);
    
          expect(result).toEqual(BASE_WORD_CARD);
          expect(cardService.remove).toHaveBeenCalledWith(
            mockRequest.user.sub,
            1
          );
        });
    });
})