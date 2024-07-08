import { v4 as uuidv4 } from 'uuid';
import { handlerError } from '../../utils/error/errorHandler';
import { addGameSession } from '../../session/game.session';
import { getUserById } from '../../session/user.session';
import CustomError from '../../utils/error/customError';
import { ErrorCodes } from '../../utils/error/errorCodes';
import { createResponse } from '../../utils/response/createResponse';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds';

const createGameHandler = (socket, userId, payload) => {
  try {
    const gameId = uuidv4();
    const gameSession = addGameSession(gameId);

    const user = getUserById(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }
    gameSession.addUser(user);

    const createGameResponse = createResponse(
      HANDLER_IDS.CREATE_GAME,
      RESPONSE_SUCCESS_CODE,
      { gameId, Message: '게임이 생성되었습니다.' },
      userId,
    );

    socket.write();
  } catch (e) {
    handlerError(socket, e);
  }
};

export default createGameHandler;
