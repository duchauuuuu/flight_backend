import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const user = req.user;
    const loginResult = await this.authService.login(user);
    
    // Trả về HTML page để mobile app có thể nhận data
    // React Native WebView sẽ bắt được message này
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login Success</title>
        </head>
        <body>
          <script>
            // Gửi data về React Native WebView
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              success: true,
              user: ${JSON.stringify(loginResult.user)}
            }));
            
            // Fallback cho testing trên browser
            setTimeout(() => {
              window.close();
            }, 1000);
          </script>
          <h2>Đăng nhập thành công!</h2>
          <p>Đang chuyển về app...</p>
        </body>
      </html>
    `;
    
    res.send(html);
  }
}
