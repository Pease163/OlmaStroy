import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Shield, ShieldCheck, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { authApi } from '@/api/auth'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const queryClient = useQueryClient()

  const [qrCode, setQrCode] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  const setup2FA = useMutation({
    mutationFn: () => authApi.setup2FA(),
    onSuccess: (data) => {
      setQrCode(data.qr_code)
    },
    onError: () => toast.error('Ошибка настройки 2FA'),
  })

  const verify2FA = useMutation({
    mutationFn: () => authApi.verify2FA(totpCode),
    onSuccess: () => {
      toast.success('2FA включена')
      setQrCode(null)
      setTotpCode('')
      refreshUser()
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: () => toast.error('Неверный код'),
  })

  const disable2FA = useMutation({
    mutationFn: () => authApi.disable2FA(disablePassword),
    onSuccess: () => {
      toast.success('2FA отключена')
      setDisablePassword('')
      refreshUser()
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
    onError: () => toast.error('Неверный пароль'),
  })

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Профиль</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Логин</span>
            <span className="text-sm font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Роль</span>
            <span className="text-sm font-medium">{user.role?.name || 'Не назначена'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Статус</span>
            <Badge variant={user.is_admin ? 'default' : 'secondary'}>
              {user.is_admin ? 'Администратор' : 'Пользователь'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Двухфакторная аутентификация (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.is_2fa_enabled ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span>2FA включена</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Введите пароль для отключения</label>
                <Input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Пароль"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => disable2FA.mutate()}
                  disabled={!disablePassword || disable2FA.isPending}
                >
                  {disable2FA.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Отключить 2FA
                </Button>
              </div>
            </>
          ) : (
            <>
              {!qrCode ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Двухфакторная аутентификация добавляет дополнительный уровень безопасности к вашему аккаунту.
                  </p>
                  <Button onClick={() => setup2FA.mutate()} disabled={setup2FA.isPending}>
                    {setup2FA.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Настроить 2FA
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Отсканируйте QR-код в приложении-аутентификаторе (Google Authenticator, Authy и т.д.),
                    затем введите 6-значный код.
                  </p>
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Код подтверждения</label>
                    <Input
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="max-w-[200px] text-center text-lg tracking-widest"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => verify2FA.mutate()} disabled={totpCode.length !== 6 || verify2FA.isPending}>
                        {verify2FA.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Подтвердить
                      </Button>
                      <Button variant="outline" onClick={() => { setQrCode(null); setTotpCode('') }}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
