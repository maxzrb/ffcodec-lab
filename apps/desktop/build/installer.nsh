ShowInstDetails show

!macro customInit
  ; 覆盖安装前确认桌面程序已退出，避免文件被占用或新旧文件混用。
  ffcodec_check_running:
    nsExec::ExecToStack '"$SYSDIR\cmd.exe" /C tasklist /FI "IMAGENAME eq FFCodec Lab.exe" /NH /FO CSV | findstr /I /C:"FFCodec Lab.exe" >nul'
    Pop $0
    Pop $1
    ${If} $0 != 0
      Goto ffcodec_install_ready
    ${EndIf}

    MessageBox MB_YESNOCANCEL|MB_ICONEXCLAMATION \
      "FFCodec Lab 正在运行，无法安全覆盖当前安装。$\n$\n选择“是”强制结束进程，选择“否”重新检测，选择“取消”退出安装。" \
      IDYES ffcodec_force_close IDNO ffcodec_check_running
    Goto ffcodec_cancel

  ffcodec_force_close:
    nsExec::ExecToStack '"$SYSDIR\taskkill.exe" /F /IM "FFCodec Lab.exe"'
    Pop $2
    Pop $3
    ${If} $2 != 0
      MessageBox MB_OK|MB_ICONSTOP \
        "无法结束 FFCodec Lab 进程（退出码 $2）。请手动关闭程序后选择“重试”。"
    ${EndIf}
    Sleep 500
    Goto ffcodec_check_running

  ffcodec_cancel:
    Abort

  ffcodec_install_ready:
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
