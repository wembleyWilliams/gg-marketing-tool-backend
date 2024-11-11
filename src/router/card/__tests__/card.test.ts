import {
    createCard,
    deleteCard,
    getCard,
    updateCard
} from "../routes";

import {
    createCardDB,
    getCardByIdDB,
    updateCardDB,
    deleteCardDB, createSocialDB
} from "../../../database";


jest.mock('../../../database',() => ({
    createCardDB: jest.fn(),
    getCardByIdDB: jest.fn(),
    updateCardDB: jest.fn(),
    deleteCardDB: jest.fn()
}));


// Mock response object
const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

const mockCardData =  {
    userId: "673084d2a230c0919e78463a",
    businessId: "6691e4a5acd809745e822caa",
    status: "active",
    tapCount: 0,
    lastTap: "2024-11-07T15:30:00Z",
    taps: [
        {
            timestamp: "2024-11-07T15:30:00Z",
            location: "null",
            deviceInfo: "null"
        }
    ],
    createdAt: "2024-11-07T15:30:00Z",
    deactivatedAt: ""
}

describe('Card Handlers',() => {
    describe("createCard", () => {
        it("should create a new card and return success message", async () => {
            const cardData = mockCardData
            const mockCreateCardDB = jest.fn().mockResolvedValue("Card created successfully");

            const req = { body: cardData } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            await createCard(req, res);

            expect(createCardDB).toHaveBeenCalledWith(cardData);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith("Success! Card created: Card created successfully");
        });

        it("should return an error message when there is an issue creating the card", async () => {
            const cardData = mockCardData;
            const mockError = new Error('Database error');
            const req = { body: cardData } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            (createCardDB as jest.Mock).mockRejectedValue(mockError);

            await createCard(req, res);
            expect(createCardDB).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ message: 'Error inserting card information', error: expect.any(Error) });

        });
    });

    describe("getCard", () => {
        it("should return the card information when a valid card ID is provided", async () => {
            const cardId = "some-card-id";
            // const mockGetCardByIdDB = jest.fn().mockResolvedValue({ /* mock card data here */ });

            const req = { params: { cardId } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                set: jest.fn()
            } as any;

            (getCardByIdDB as jest.Mock).mockResolvedValue(mockCardData)

            await getCard(req, res);

            expect(getCardByIdDB).toHaveBeenCalledWith(cardId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockCardData);
        });

        it("should return an error when the card ID is not provided", async () => {
            const req = { params: {} } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            await getCard(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ message: 'Unable to find card ID' });
        });

        it("should handle an error if there is an issue fetching the card", async () => {
            const cardId = "some-card-id";

            const req = { params: { cardId } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                set: jest.fn()
            } as any;

            (getCardByIdDB as jest.Mock).mockRejectedValue(new Error("Error fetching card"));

            await getCard(req, res);

            expect(getCardByIdDB).toHaveBeenCalledWith(cardId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ message: 'Error retrieving card information', error: expect.any(Error) });
        });
    });

    describe("updateCard", () => {
        it("should update the card and return the updated card data", async () => {
            const cardId = "some-card-id";
            const updatedCardData = { status: "updated" };

            const req = { params: { cardId }, body: updatedCardData } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            (updateCardDB as jest.Mock).mockResolvedValue(mockCardData);

            await updateCard(req, res);

            expect(updateCardDB).toHaveBeenCalledWith(cardId, updatedCardData);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockCardData);
        });


        it("should return an error when the card ID is not provided", async () => {
            const req = { params: {  }, body: {} } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            await updateCard(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ message: 'Unable to find card ID' });
        });

        it("should return an error if there is an issue updating the card", async () => {
            const cardId = "some-card-id";
            const updatedCardData = { status: "updated" };

            const req = { params: { cardId }, body: updatedCardData } as any;

            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            (updateCardDB as jest.Mock).mockRejectedValue(new Error("Error updating card"));

            await updateCard(req, res);

            expect(updateCardDB).toHaveBeenCalledWith(cardId, updatedCardData);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ message: 'Error updating card information', error: expect.any(Error) });
        });
    });
    describe("deleteCard", () => {
        it("should delete the card and return a success message", async () => {
            const cardId = "some-card-id";

            const req = { params: {cardId} } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            (deleteCardDB as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            await deleteCard(req, res);

            expect(deleteCardDB).toHaveBeenCalledWith(cardId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ deletedCount: 1 });
        });

        it("should return an error when the card ID is not provided", async () => {
            const cardId = "some-card-id";
            const req = { params: { } } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            (deleteCardDB as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            await deleteCard(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({ message: 'Unable to find card ID' });
        });

        it("should return an error if there is an issue deleting the card", async () => {
            const cardId = "some-card-id";

            const req = { params: {cardId} } as any;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as any;

            (deleteCardDB as jest.Mock).mockRejectedValue(new Error("Error deleting card"));

            await deleteCard(req, res);

            expect(deleteCardDB).toHaveBeenCalledWith(cardId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({ message: 'Error deleting card', error: expect.any(Error) });
        });
    });

})