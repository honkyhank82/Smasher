import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @UseGuards(AuthGuard('jwt'))
  async getConversations(@CurrentUser() user: { userId: string }) {
    return this.chatService.getConversations(user.userId);
  }
}
