import React, {
  CSSProperties,
  ChangeEvent,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { CenteredBox } from './CenteredBox'

const initialDigits = ['', '', '', '', '', '', '', '']
export function LoginCodeDialog() {
  const [digits, setDigits] = useState<Array<string | undefined>>(initialDigits)
  const [showLoginCodeDialog, setShowLoginCodeDialog] = useState<boolean>(false)

  const _inputRefs = useRef<any[]>([])
  const _initFocus = useRef<boolean>(false)

  useEffect(() => {
    window.flipflip?.ipc.onShowLoginCodeDialog(() => {
      setDigits(initialDigits)
      setShowLoginCodeDialog(true)
      _initFocus.current = true
    })
    window.flipflip?.ipc.onCloseLoginCodeDialog(() => {
      setShowLoginCodeDialog(false)
      _initFocus.current = false
    })
  }, [])

  const cancel = () => {
    setShowLoginCodeDialog(false)
    window.flipflip?.ipc.cancelLoginCode()
  }

  const onDigitChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const value = event.currentTarget.value
    const newDigits = [...digits]
    newDigits.splice(index, 1, value)
    setDigits(newDigits)

    const next = index + 1
    if (next < _inputRefs.current.length) {
      _inputRefs.current[next]?.focus()
    } else if (newDigits.every((digit) => digit !== '')) {
      window.flipflip?.ipc.verifyLoginCode(newDigits.join(''))
      setShowLoginCodeDialog(false)
    }
  }

  const digitStyle: CSSProperties = {
    fontWeight: 'bold',
    fontSize: '1.75rem',
    textAlign: 'center'
  }

  return (
    <Dialog open={showLoginCodeDialog} onClose={cancel} maxWidth="sm">
      <DialogContent>
        <CenteredBox sx={{ px: 2, pt: 2, pb: 3 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ textTransform: 'uppercase' }}
          >
            Login
          </Typography>
          <IconButton
            aria-label="close"
            onClick={cancel}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
          <Stack direction="row" spacing={2} sx={{ my: 2 }}>
            {[...Array(4).keys()].map((index) => {
              return (
                <TextField
                  key={index}
                  inputRef={(ref) => {
                    _inputRefs.current[index] = ref
                    if (index === 0 && _initFocus.current) {
                      _initFocus.current = false
                      _inputRefs.current[index]?.focus()
                    }
                  }}
                  value={digits[index]}
                  onChange={(e) => onDigitChange(e, index)}
                  inputProps={{ maxLength: 1, style: digitStyle }}
                />
              )
            })}
            <Typography style={{ ...digitStyle, alignSelf: 'center' }}>
              -
            </Typography>
            {[...Array(4).keys()].map((index) => {
              index += 4
              return (
                <TextField
                  key={index}
                  inputRef={(ref) => (_inputRefs.current[index] = ref)}
                  value={digits[index]}
                  onChange={(e) => onDigitChange(e, index)}
                  inputProps={{ maxLength: 1, style: digitStyle }}
                />
              )
            })}
          </Stack>
          <Typography variant="h6">Type code to open FlipFlip.</Typography>
        </CenteredBox>
      </DialogContent>
    </Dialog>
  )
}
