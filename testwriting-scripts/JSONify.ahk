#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
#SingleInstance, force
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

:*:_mcq::
SendRaw, {
Send, {Enter}
SendRaw, "type": "mcq",
Send, {Enter}
SendRaw, "text": "",
Send, {Enter}
SendRaw, "options": [
Send, {Enter}
Send, {Tab}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
Send, +{Tab}
SendRaw, ],
Send, {Enter}
SendRaw, "value": ,
Send, {Enter}
SendRaw, "image": "",
Send, {Enter}
SendRaw, "tiebreaker": false
Send, {Enter}
Send, +{Tab}
SendRaw, },
Send, {Enter}
return

:*:_msq::
SendRaw, {
Send, {Enter}
SendRaw, "type": "msq",
Send, {Enter}
SendRaw, "text": "",
Send, {Enter}
SendRaw, "options": [
Send, {Enter}
Send, {Tab}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
Send, +{Tab}
SendRaw, ],
Send, {Enter}
SendRaw, "value": ,
Send, {Enter}
SendRaw, "image": "",
Send, {Enter}
SendRaw, "tiebreaker": false
Send, {Enter}
Send, +{Tab}
SendRaw, },
Send, {Enter}
return

:*:_mq::
SendRaw, {
Send, {Enter}
SendRaw, "type": "mq",
Send, {Enter}
SendRaw, "text": "Just another random matching question",
Send, {Enter}
SendRaw, "optionsA": [
Send, {Enter}
Send, {Tab}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
SendRaw, "",
Send, {Enter}
Send, +{Tab}
SendRaw, ],
Send, {Enter}
SendRaw, "optionsB": [
Send, {Enter}
Send, {Tab}
SendRaw, "a", "b", "c", "d"
Send, {Enter}
Send, +{Tab}
SendRaw, ],
Send, {Enter}
SendRaw, "value": ,
Send, {Enter}
SendRaw, "image": "",
Send, {Enter}
SendRaw, "tiebreaker": false
Send, {Enter}
Send, +{Tab}
SendRaw, },
Send, {Enter}
return

:*:_lrq::
SendRaw, {
Send, {Enter}
SendRaw, "type": "lrq",
Send, {Enter}
SendRaw, "text": "",
Send, {Enter}
SendRaw, "value": ,
Send, {Enter}
SendRaw, "image": "",
Send, {Enter}
SendRaw, "tiebreaker": false
Send, {Enter}
Send, +{Tab}
SendRaw, },
Send, {Enter}
return

:*:_fitb::
SendRaw, {
Send, {Enter}
SendRaw, "type": "fitb",
Send, {Enter}
SendRaw, "text": "|~~~~|",
Send, {Enter}
SendRaw, "value": ,
Send, {Enter}
SendRaw, "image": "",
Send, {Enter}
SendRaw, "tiebreaker": false
Send, {Enter}
SendRaw, },
Send, +{Tab}
Send, {Enter}
return

; ---------------------------------------------------------------

:*:_opts::
OptionsFormatted1 := RegExReplace(Clipboard, "[a-z]\. |$", Replacement := """")
OptionsFormatted2 := RegExReplace(OptionsFormatted1, "`r", Replacement := """,")
; OptionsFormatted3 := RegExReplace(OptionsFormatted2, "(?<=`n)""", Replacement := """,")
SendRaw, %OptionsFormatted2%
return
