import { getGameSession } from '../../session/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handlerError } from '../../utils/error/errorHandler.js';

const updateLoactionHandler = ({ socket, userId, payload }) => {
  try {
    const { gameId, x, y } = payload;
    const gameSession = getGameSession(gameId);

    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임 세션을 찾을 수 없습니다.');
    }

    const user = gameSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    user.updatePostition(x, y);
    const packet = gameSession.getAllLocation();

    socket.write(packet);
  } catch (e) {
    handlerError(socket, e);
  }
};
export default updateLoactionHandler;
