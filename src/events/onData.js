import { config } from '../config/config.js';
import { PACKET_TYPE } from '../constants/header.js';
import { packetParser } from '../utils/parser/packetParser.js';
import { getHandlerById } from '../handlers/index.js';
import { getUserById } from '../session/user.session.js';
import { handlerError } from '../utils/error/errorHandler.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { getProtoMessages } from '../init/loadProtos.js';

export const onData = (socket) => async (data) => {
  socket.buffer = Buffer.concat([socket.buffer, data]);

  const totalHeaderLength = config.packet.totalLength + config.packet.typeLength;

  while (socket.buffer.length >= totalHeaderLength) {
    const length = socket.buffer.readUInt32BE(0);

    const packetType = socket.buffer.readUInt8(config.packet.totalLength);
    if (socket.buffer.length >= length) {
      const packet = socket.buffer.slice(totalHeaderLength, length);
      socket.buffer = socket.buffer.slice(length);

      try {
        switch (packetType) {
          case PACKET_TYPE.PING: {
            const protoMessages = getProtoMessages();
            const Ping = protoMessages.common.Ping;
            const pingMessage = Ping.decode(packet);
            const user = getUserBySocket(socket);
            if (!user) {
              throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
            }

            break;
          }
          case PACKET_TYPE.NORMAL:
            const { handlerId, sequence, payload, userId } = packetParser(packet);

            const user = getUserById(userId);
            if (user && user.sequence !== sequence) {
              throw new CustomError(ErrorCodes.INVALID_SEQUENCE, '잘못된 호출 값입니다. ');
            }

            const handler = getHandlerById(handlerId);
            await handler({
              socket,
              userId,
              payload,
            });
        }
      } catch (error) {
        handlerError(socket, error);
      }
    } else {
      break;
    }
  }
};
