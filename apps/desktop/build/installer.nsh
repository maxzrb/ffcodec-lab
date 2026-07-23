ShowInstDetails show

!macro customInit
!macroend

!macro customInstall
  IfFileExists "$INSTDIR\resources\hardware-monitor\pawnio\PawnIO_setup.exe" 0 pawnio_done
  DetailPrint "Installing PawnIO hardware access driver..."
  nsExec::ExecToLog '"$INSTDIR\resources\hardware-monitor\pawnio\PawnIO_setup.exe" -install -silent'
  Pop $0
  ${If} $0 != 0
    DetailPrint "PawnIO installation failed with exit code $0; FFCodec Lab will use fallback metrics."
  ${EndIf}
  pawnio_done:
!macroend
