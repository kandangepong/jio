import { useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
  error?: Error | unknown
  reset?: () => void
}

export function GeneralError({
  className,
  minimal = false,
  error,
  reset,
}: GeneralErrorProps) {
  const { history } = useRouter()
  const errorMsg = error instanceof Error ? error.message : String(error || '')

  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center'>
        {!minimal && (
          <h1 className='text-[5rem] leading-tight font-bold'>500</h1>
        )}
        <span className='font-semibold text-lg'>Oops! Something went wrong</span>
        <p className='text-muted-foreground text-sm max-w-md'>
          Terjadi kesalahan saat merender data. Silakan muat ulang atau periksa koneksi backend.
        </p>
        {errorMsg && (
          <pre className='mt-2 p-2 bg-muted/60 text-xs font-mono rounded max-w-lg overflow-x-auto text-destructive border text-left'>
            {errorMsg}
          </pre>
        )}
        {!minimal && (
          <div className='mt-4 flex gap-3'>
            {reset && (
              <Button onClick={() => reset()}>Coba Lagi</Button>
            )}
            <Button variant='outline' onClick={() => history.go(-1)}>
              Kembali
            </Button>
            <Button
              variant='secondary'
              onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}
            >
              Clear Cache & Reload
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
